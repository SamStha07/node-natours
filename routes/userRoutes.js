const express = require('express');
const userHandler = require('../controllers/userController');

const {
    getAllUsers,
    createUser,
    getOneUser,
    updateUser,
    deleteUser
} = userHandler;

const router = express.Router();

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getOneUser).patch(updateUser).delete(deleteUser);

module.exports = router;