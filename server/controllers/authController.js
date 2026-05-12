const User = require('../models/User');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    return res.status(201).json({
      success: true,
      token: generateToken(user._id, user.role),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      return res.status(200).json({
        success: true,
        token: generateToken(user._id, user.role),
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      return res.status(200).json({
        success: true,
        token: generateToken(admin._id, 'admin'),
        user: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ userId: user._id });
        const totalSpentResult = await Order.aggregate([
          { $match: { userId: user._id, paymentStatus: 'successful' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        return {
          ...user.toObject(),
          orderCount,
          totalSpent: totalSpentResult[0]?.total || 0
        };
      })
    );

    return res.status(200).json({ success: true, users: usersWithStats, count: usersWithStats.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getUserOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({ success: true, orders, count: orders.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  loginAdmin,
  getAllUsers,
  getUserOrderHistory
};
