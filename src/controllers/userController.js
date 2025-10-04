const User = require('../models/User')

exports.getUser = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error' })
    }
}

exports.updateUser = async (req, res) => {
    try {
        const { username, email } = req.body;

        const updatedFields = {};
        if (username) updatedFields.username = username;
        if (email) updatedFields.email = email;

        const user = await User.findByIdAndUpdate(req.user.id, updatedFields, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        })
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'That username or email is already in use.' });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        res.status(500).json({ success: false, message: 'Server Error occurred while updating user profile.' });

    }
};

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    const { currentPassword, newPassword } = req.body;

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save(); 
    
    const token = user.getSignedJwtToken();
    const options = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    };

    res.status(200).cookie('token', token, options).json({
      success: true,
      message: 'Password updated successfully',
      token
    });

  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server Error occurred while updating password.' });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await User.findByIdAndDelete(req.user.id);

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({ success: true, message: 'Account deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error occurred during account deletion.' });
  }
};