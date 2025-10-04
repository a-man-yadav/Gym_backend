const User = require('../models/User')
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const nodemailer = require('nodemailer');

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const user = await User.create({
            username, email, password
        })

        sendTokenResponse(user, 201, res);

    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            const message = `A user with that ${field} already exists.`;
            return res.status(400).json({ success: false, message });
        }
        res.status(500).json({ success: false, message: 'Server Error occurred during registration.' });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' })
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Not Registered' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Wrong Password' });
        }

        sendTokenResponse(user, 200, res)

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' })
    }
};

exports.logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({
        success: true,
        message: 'Logged Out successfully'
    })
};

exports.forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(200).json({ success: true, message: 'If a user with that email exists, a password reset email has been sent.' })
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const mailOptions = {
            from: `${process.env.FROM_NAME}< ${process.env.FROM_EMAIL}>`,
            to: user.email,
            subject: 'Password Reset Token',
            text: message,
            html: `<b>${message}</b>`
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Email sent', resetToken: resetToken })
    } catch (err) {
        console.error('Error sending email:', err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ success: false, message: 'Email could not be sent. Server Error.' });
    }
};

exports.resetPassword = async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    try {
        await user.save();
        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message)
            return res.status(400).json({success: false, message: messages.join('. ')});
        }

        return res.status(500).json({success: false, message: 'Error Resseting Password'})
    }
};