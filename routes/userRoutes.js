const express = require("express");
const userRouter = express.Router();
const {
  getUser,
  getUsers,
  getMe,
  deleteMe,
  updateMe,
} = require("../controller/userController");
const { authentication } = require("../middlewares/authenticationMiddleware");

userRouter
  .get("/user/:id", authentication, getUser)
  .get("/users", authentication, getUsers)
  .get("/user", authentication, getMe)
  .delete("/user/:id", authentication, deleteMe)
  .patch("/user", authentication, updateMe);

module.exports = userRouter;
