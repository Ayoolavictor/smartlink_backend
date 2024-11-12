const Cart = require("../models/carts");
const Product = require("../models/products");
const recalculateTotalAmount = async (cart) => {
  let totalAmount = 0;
  const productPromises = cart.items.map(async (item) => {
    const product = await Product.findById(item.productId);
    return product.price * item.quantity;
  });
  const prices = await Promise.all(productPromises);
  for (const price of prices) {
    totalAmount += price;
  }
  return totalAmount;
};

exports.createCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;
  try {
    const cart = await Cart.create({
      userId,
      items: [{ productId, quantity }],
    });
    const productid = cart.items[0].productId;
    const product = await Product.findById(productid);
    const totalAmount = product.price * cart.items[0].quantity;
    cart.totalAmount = totalAmount;
    await cart.save();
    res.status(200).json({
      status: "success",
      message: "Cart has been created for this user",
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message || "An error occurred",
    });
  }
};

exports.addToCart = async (req, res) => {
  const cartId = req.params.id;
  const { productId, quantity } = req.body;

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        status: "fail",
        message: "Cart not found",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    const existingProductIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingProductIndex > -1) {
      // Product already in cart, update quantity and total amount
      cart.items[existingProductIndex].quantity += quantity;
    } else {
      // Product not in cart, add new item
      cart.items.push({ productId, quantity });
    }

    // Recalculate the totalAmount
    const totalAmount = await recalculateTotalAmount(cart);
    cart.totalAmount = totalAmount;
    await cart.save();

    res.status(201).json({
      status: "success",
      message: "Cart has been updated",
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message || "An error occurred",
    });
  }
};

exports.deleteCart = async (req, res) => {
  const cartId = req.params.id;
  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        status: "fail",
        message: "cart not found",
      });
    }
    await Cart.findByIdAndDelete(cartId);
    res.status(200).json({
      status: "success",
      message: "cart has been deleted",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message || "An error occurred",
    });
  }
};

exports.deleteFromCart = async (req, res) => {
  const cartId = req.params.id;
  const { productId } = req.body;
  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        status: "fail",
        message: "cart not found",
      });
    }
    const matchingProductIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );
    if (matchingProductIndex > -1) {
      cart.items.splice(matchingProductIndex, 1);
    } else {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }
    const totalAmount = await recalculateTotalAmount(cart);
    cart.totalAmount = totalAmount;
    await cart.save();
    return res.status(200).json({
      status: "success",
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message || "An error occurred",
    });
  }
};

exports.getCart = async (req, res) => {
  const userId = req.user.id;
  try {
    const cart = await Cart.find({ userId });
    console.log(cart);
    if (!cart || cart.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "user has no cart",
      });
    }
    res.status(200).json({
      status: "success",
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message || "An error occurred",
    });
  }
};
