const User = require("../models/user");
const Order = require("../models/orders");
const Cart = require("../models/carts");
const { Types } = require("mongoose");
exports.createOrder = async (req, res, next) => {
  try {
    const user = req.user.id;
    const cartId = req.params.id;
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        status: "fail",
        message: "Cart not found",
      });
    }
    const order = await Order.create({
      user,
      cart: cart._id,
      totalAmount: cart.totalAmount,
    });
    res.status(201).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message || "an error occured on the server",
    });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate("cart").exec();
    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "order not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message || "an error occured on the server",
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "user not found",
      });
    }
    const orders = await Order.findOne({ user: userId }).populate("cart");
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "no orders found for this user",
      });
    }
    res.status(200).json({
      status: "success",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message || "an error occured on the server",
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "order is not founc",
      });
    }
    await Order.findByIdAndDelete(orderId);
    res.status(200).json({
      status: "status",
      message: "order deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message || "an error occured on the server",
    });
  }
};

exports.sortOrders = async (req, res) => {
  try {
    const user = new Types.ObjectId(req.user.id);
    const orderStatus = req.params.status;

    const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(404).json({
        status: "fail",
        message: "Invalid parameters",
      });
    }
    const stats = await Order.aggregate([
      {
        $match: { user, status: orderStatus },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message || "an error occured on the server",
    });
  }
};
