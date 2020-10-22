const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const {
  getAllUsers,
  createUser,
  getOneUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} = userController;
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
} = authController;

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getOneUser).patch(updateUser).delete(deleteUser);

module.exports = router;
