const express = require("express");
const authRouter = express.Router();
const {
  registerUser,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controller/authController");
const { authentication } = require("../middlewares/authenticationMiddleware");

authRouter
  .post("/register", registerUser)
  .post("/login", login)
  .post("/forgotPassword", forgotPassword)
  .post("/resetPassword", resetPassword)
  .post("/changePassword", authentication, changePassword);

module.exports = authRouter;
