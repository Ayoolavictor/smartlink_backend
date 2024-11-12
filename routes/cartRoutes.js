const express = require("express");
const cartRouter = express.Router();
const {
  getCart,
  addToCart,
  deleteCart,
  deleteFromCart,
  createCart,
} = require("../controller/cartController");
const { authentication } = require("../middlewares/authenticationMiddleware");

cartRouter
  .get("/getCart", authentication, getCart)
  .post("/addCart/:id", authentication, addToCart)
  .delete("/deleteCart/:id", authentication, deleteCart)
  .post("/deleteFromCart/:id", authentication, deleteFromCart)
  .post("/createCart", authentication, createCart);

module.exports = cartRouter;
