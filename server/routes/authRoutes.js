const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  loginAdmin,
  getAllUsers,
  getUserOrderHistory
} = require('../controllers/authController');

const { verifyToken } = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);
router.get('/admin/users', verifyToken, isAdmin, getAllUsers);
router.get('/admin/users/:userId/orders', verifyToken, isAdmin, getUserOrderHistory);

module.exports = router;
