const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true,
        trim: true,
        maxlength: [20, 'Username Cnanot be more that 20 characters']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minlength: [8, 'Password must be of 8 characters'],
        select: false,
        validate: {
      validator: function(v) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/.test(v);
      },
      message: 'Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.'
    }
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    pinnedExercises: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise'
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // createdPrograms: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'Program'
    //     }
    // ]

}, {timestamps: true});



// hashing before saving
UserSchema.pre('save', async function (next){
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// password comparision
UserSchema.methods.matchPassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

// session info
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({id: this._id, role: this.role}, process.env.JWT_SECRET, {expiresIn: '7d'})
}

UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model('User', UserSchema)

module.exports = User