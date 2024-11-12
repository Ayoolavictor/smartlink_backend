const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.getUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return es.status(404).json({
        status: "fail",
        message: "user not found",
      });
    }
    const data = { name: user.name, email: user.email };
    res.status(200).json({
      status: "success",
      message: data,
    });
    next();
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "users not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: {
        data: users,
      },
    });
    next();
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error,
    });
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    res.status(200).json({
      status: "success",
      message: {
        data: user,
      },
    });
    next();
  } catch (error) {
    return res.status(500).json({
      status: "success",
      message: error,
    });
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({
      status: "success",
      message: "User deleted",
    });
    next();
  } catch (error) {
    return res.status(500).json({
      status: "success",
      message: error,
    });
  }
};
exports.updateMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { name },
      {
        returnDocument: "after",
      }
    );
    res.status(200).json({
      status: "success",
      message: {
        data: user,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "success",
      message: error,
    });
  }
};
