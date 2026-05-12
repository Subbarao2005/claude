const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  loginAdmin,
  getAllUsers
} = require('../controllers/authController');

const { verifyToken } = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);
router.get('/admin/users', verifyToken, isAdmin, getAllUsers);

module.exports = router;
