const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


// Create new user
exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });

    // creates token of the current user signup
    const token = jwt.sign({
        id: newUser._id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser,
        },
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const {
        email,
        password
    } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        next(new AppError('Please provide email and password', 400));
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({
        email: email
    }).select('+password');

    // correctPassword is coming from userModel method and returns true or false

    // const correct = await user.correctPassword(password, user.password);
    // if user doesnot exist then correct will not run so

    // if(!user || !correct)
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, send token to client

    const token = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(200).json({
        status: 'success',
        token,
    });
});

// middleware to protect the tour routes
// access if user is logged in
exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check if it exists
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // console.log(token);
    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2) Verfication token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded); 
    // {
    //   "id": "5f4e915d194ff564a822e330", current user id
    //   "iat": 1598990101,
    //   "exp": 1606766101 // expiry date
    // }

    // 3) Check if user still exists after token expired or deleted
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does not exist.', 401));
    }

    // 4) Check if user changed password after the token was issued
    // changedPasswordAfter method from userModel
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please login again.', 401));
    };

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});