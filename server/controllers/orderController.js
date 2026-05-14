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
    console.log('Order body:', req.body);

    const { products, totalAmount, address } = req.body || {};

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required field: products must be a non-empty array' });
    }
    if (totalAmount === undefined || totalAmount === null || Number(totalAmount) <= 0) {
      return res.status(400).json({ success: false, message: 'Missing required field: totalAmount must be greater than 0' });
    }
    if (!address) {
      return res.status(400).json({ success: false, message: 'Missing required field: address' });
    }
    if (!address.street?.trim()) {
      return res.status(400).json({ success: false, message: 'Missing required address field: street' });
    }
    if (!address.city?.trim()) {
      return res.status(400).json({ success: false, message: 'Missing required address field: city' });
    }
    if (!address.pincode?.trim()) {
      return res.status(400).json({ success: false, message: 'Missing required address field: pincode' });
    }
    if (!address.phone?.trim()) {
      return res.status(400).json({ success: false, message: 'Missing required address field: phone' });
    }

    const cleanProducts = products.map((item, index) => ({
      productId: item?.productId,
      title: item?.title,
      price: Number(item?.price || 0),
      quantity: Number(item?.quantity || 0)
    }));

    const invalidIndex = cleanProducts.findIndex(item =>
      !item.productId || !item.title || item.price <= 0 || item.quantity <= 0
    );
    if (invalidIndex !== -1) {
      return res.status(400).json({
        success: false,
        message: `Invalid product at index ${invalidIndex}. Required: productId, title, price, quantity`
      });
    }

    const order = await Order.create({
      userId: req.user.id,
      products: cleanProducts,
      totalAmount: Number(totalAmount),
      address: {
        street: address.street.trim(),
        city: address.city.trim(),
        pincode: address.pincode.trim(),
        phone: address.phone.trim(),
        landmark: address.landmark?.trim() || ''
      },
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
    const { orderStatus, status, reason } = req.body;
    const newStatus = orderStatus || status;
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
        { $match: { 
          'products.title': { $exists: true, $ne: null }
        }},
        { $group: {
          _id: '$products.productId',
          title: { $first: '$products.title' },
          totalOrdered: { $sum: '$products.quantity' }
        }},
        { $match: { 
          title: { $ne: null },
          totalOrdered: { $gt: 0 }
        }},
        { $sort: { totalOrdered: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Ensure topProducts has no null/undefined items
    const safeTopProducts = (topProducts || [])
      .filter(p => p && p.title && p.totalOrdered)
      .map(p => ({
        _id: String(p._id || ''),
        title: String(p.title || 'Unknown'),
        totalOrdered: Number(p.totalOrdered || 0)
      }));

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders: Number(totalOrders || 0),
        todayOrders: Number(todayOrders || 0),
        weekOrders: Number(weekOrders || 0),
        pendingOrders: Number(pendingOrders || 0),
        deliveredOrders: Number(deliveredOrders || 0),
        totalRevenue: Number(revenueResult[0]?.total || 0),
        topProducts: safeTopProducts
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
