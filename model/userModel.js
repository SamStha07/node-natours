const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Username must required'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'admin', 'guide', 'lead-guide'],
        default: 'user' // default value isnot overwriting have to manually change the role in db
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false, //never shows password in output
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // this only works on CREATE and SAVE
            validator: function (el) {
                return el === this.password; //abc === abc i.e true
            },
            message: 'Passwords are not the same!',
        },
    },
    passwordChangedAt: Date,
});
// here "this" represents inside the current document

// MIDDLEWARES
// DOCUMENT MIDDLEWARE from mongoose: runs before .save() or .create()
userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();
    // Hash the password with cost of 12 which is more CPU intensive and requires more time create hash
    this.password = await bcrypt.hash(this.password, 12);
    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

// method
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    // candidatePassword = original password which isnot hashed coming from user
    // userPassword = is hashed
    return await bcrypt.compare(candidatePassword, userPassword); // it returns true or false
};

// changed password sometime after logged in
userSchema.methods.changedPasswordAfter = async function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(changedTimeStamp, JWTTimeStamp);
        return JWTTimeStamp < changedTimeStamp; //JWTTimeStamp = token issued, changedTimeStamp = password changed after signup, return true
    }
    // False means Not changed
    return false;
}

const User = mongoose.model('User', userSchema);
module.exports = User;