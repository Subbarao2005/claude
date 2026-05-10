const Order = require('../models/Order');

// POST /api/orders (Authenticated)
const placeOrder = async (req, res) => {
  try {
    const { products, totalAmount, address } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: "Products are required" });
    }
    if (totalAmount === undefined) {
      return res.status(400).json({ success: false, message: "Total amount is required" });
    }
    if (!address || !address.street || !address.city || !address.pincode || !address.phone) {
      return res.status(400).json({ success: false, message: "Complete address is required" });
    }

    const order = await Order.create({
      userId: req.user.id,
      products,
      totalAmount,
      address,
      paymentStatus: "pending",
      orderStatus: "Pending"
    });

    return res.status(201).json({ success: true, message: "Order placed", order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/my-orders (Authenticated)
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/admin/all (Admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('userId', 'name email phone');
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/:id (Authenticated)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check if user is admin or the order owner
    if (req.user.role !== "admin" && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied. Order belongs to another user." });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/orders/:id/status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Accepted", "Preparing", "Out for Delivery", "Delivered", "Rejected"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.orderStatus = status;
    await order.save();

    return res.status(200).json({ success: true, message: "Order status updated", order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/orders/:id/cancel (Authenticated)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied. You can only cancel your own orders." });
    }

    if (order.orderStatus !== "Pending" && order.orderStatus !== "Accepted") {
      return res.status(400).json({ success: false, message: "Order cannot be cancelled at this stage" });
    }

    order.orderStatus = "Cancelled";
    await order.save();

    return res.status(200).json({ success: true, message: "Order cancelled" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
