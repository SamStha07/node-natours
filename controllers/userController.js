const User = require('../model/userModel');
const catchAsync = require('./../utils/catchAsync');


exports.getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        },
    });
});


exports.getOneUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route isnot yet defined',
    });
};
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route isnot yet defined',
    });
};
exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route isnot yet defined',
    });
};
exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route isnot yet defined',
    });
};