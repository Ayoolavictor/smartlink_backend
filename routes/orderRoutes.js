const express = require("express");
const orderRouter = express.Router();
const {
  getOrder,
  getOrders,
  createOrder,
  deleteOrder,
  sortOrders,
} = require("../controller/orderController");
const { authentication } = require("../middlewares/authenticationMiddleware");

orderRouter
  .get("/order/:id", authentication, getOrder)
  .get("/orders", authentication, getOrders)
  .get("/sortOrderBy/:status", authentication, sortOrders)
  .post("/order/:id", authentication, createOrder)
  .delete("/order/:id", authentication, deleteOrder);

module.exports = orderRouter;
