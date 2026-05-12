const Order = require('../models/Order');
const Product = require('../models/Product');

const TRANSITIONS = {
  'Pending':          ['Accepted', 'Rejected'],
  'Accepted':         ['Preparing', 'Cancelled'],
  'Preparing':        ['Out for Delivery'],
  'Out for Delivery': ['Delivered'],
  'Delivered':        [],
  'Rejected':         [],
  'Cancelled':        []
};

exports.placeOrder = async (req, res) => {
  try {
    const { products, totalAmount, address } = req.body;

    // Validations
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: "Products array cannot be empty" });
    }
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ success: false, message: "Total amount must be greater than 0" });
    }
    if (!address || !address.street || !address.city || !address.pincode || !address.phone) {
      return res.status(400).json({ success: false, message: "All address fields (street, city, pincode, phone) are required" });
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      return res.status(400).json({ success: false, message: "Pincode must be exactly 6 digits" });
    }
    if (!/^\d{10}$/.test(address.phone)) {
      return res.status(400).json({ success: false, message: "Phone must be exactly 10 digits" });
    }

    const order = await Order.create({
      userId: req.user.id,
      products,
      totalAmount,
      address,
      paymentStatus: 'pending',
      orderStatus: 'Pending'
    });

    return res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({ success: true, orders, count: orders.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, date } = req.query;
    let query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    if (date === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: today };
    } else if (date === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: weekAgo };
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders, count: orders.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Access control
    if (req.user.role !== 'admin' && order.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus: newStatus, reason } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Validate Transition
    if (!TRANSITIONS[order.orderStatus].includes(newStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot change status from ${order.orderStatus} to ${newStatus}` 
      });
    }

    // Handle Rejection/Cancellation Reasons
    if (newStatus === 'Rejected' || newStatus === 'Cancelled') {
      if (!reason || reason.length < 5) {
        return res.status(400).json({ success: false, message: "A valid reason (min 5 chars) is required for this status" });
      }
      if (newStatus === 'Rejected') order.rejectionReason = reason;
      else order.cancellationReason = reason;
    }

    order.orderStatus = newStatus;
    order.statusHistory.push({
      status: newStatus,
      changedAt: new Date(),
      changedBy: 'admin'
    });

    await order.save();
    return res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.userId.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Access denied" });

    if (!['Pending', 'Accepted'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: "Order can only be cancelled while Pending or Accepted" });
    }

    order.orderStatus = 'Cancelled';
    order.cancellationReason = reason || 'Cancelled by user';
    order.statusHistory.push({
      status: 'Cancelled',
      changedAt: new Date(),
      changedBy: 'user'
    });

    await order.save();
    return res.status(200).json({ success: true, message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      todayOrders,
      weekOrders,
      pendingOrders,
      deliveredOrders,
      revenueResult,
      topProducts
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: weekAgo } }),
      Order.countDocuments({ orderStatus: 'Pending' }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Order.aggregate([
        { $match: { paymentStatus: 'successful' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $unwind: '$products' },
        { $group: {
          _id: '$products.productId',
          title: { $first: '$products.title' },
          totalOrdered: { $sum: '$products.quantity' }
        }},
        { $sort: { totalOrdered: -1 } },
        { $limit: 5 }
      ])
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        todayOrders,
        weekOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue: revenueResult[0]?.total || 0,
        topProducts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
