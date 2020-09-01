const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const {
    getAllUsers,
    createUser,
    getOneUser,
    updateUser,
    deleteUser
} = userController;
const {
    signup
} = authController;

const router = express.Router();

router.post('/signup', signup);

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getOneUser).patch(updateUser).delete(deleteUser);

module.exports = router;