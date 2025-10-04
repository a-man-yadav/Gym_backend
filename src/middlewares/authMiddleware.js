const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not Authorized to access this route. No token found' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select('-password') //this hepls to exclude the password
        next();

    } catch (err) {
        console.error(err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token Expired' })
        }
        return res.status(401).json({ success: false, message: 'Not authorized' })
    }
}

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return res.status(403).json({success: false, message:`User Role ${req.user.role} is not authorised to access this route`})
        }

        next();
    }
}