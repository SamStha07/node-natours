const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
    default: 'user', // default value isnot overwriting have to manually change the role in db
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
  active: {
    type: Boolean,
    default: true,
    select: false, //hides from the user
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
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

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// checks if active is true or false and show only which are true
// shows all the users having active: true
userSchema.pre(/^find/, function (next) {
  //this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// method
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // candidatePassword = original password which isnot hashed coming from user
  // userPassword = is hashed
  return await bcrypt.compare(candidatePassword, userPassword); // it returns true or false
};

// changed password sometime after logged in
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimeStamp, JWTTimeStamp);
    return JWTTimeStamp < changedTimeStamp; //JWTTimeStamp = token issued, changedTimeStamp = password changed after signup, return true
  }
  // False means Not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // this token will be sent to user's email to create new password
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log(
    {
      resetToken,
    },
    this.passwordResetToken
  );

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //ms

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
