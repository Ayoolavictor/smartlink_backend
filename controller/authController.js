const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res, next) => {
  const { name, email, password, passwordConfirmation, role } = req.body;
  try {
    const user = await User.create({
      name,
      email,
      password,
      passwordConfirmation,
      role,
    });
    const id = user._id;
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.EXPIRES,
    });

    res.status(201).json({
      status: "success",
      message: user,
      accessToken: token,
    });
    next();
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error,
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.confirmPassword(password, user.password))) {
      return res.status(401).json({
        status: "failed",
        message: "user not found",
      });
    }
    const id = user._id;
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.EXPIRES,
    });
    res.status(200).json({
      status: "success",
      accessToken: token,
    });
    next();
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error,
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  try {
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "The email inputted is not registered",
      });
    }
    const otp = await user.createOTP();
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      status: "success",
      message: otp,
    });

    next();
  } catch (error) {
    user.otp = undefined;
    user.otpReset = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({
      status: "fail",
      message: error,
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  const { email, resetCode, newPassword, newPasswordConfirm } = req.body;

  try {
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Validate OTP and expiration
    const isOtpValid = await user.confirmPassword(resetCode, user.otp);
    const isOtpNotExpired = Date.now() <= user.otpReset;
    if (!isOtpValid && !isOtpNotExpired) {
      return res.status(401).json({
        status: "fail",
        message: "Otp is invalid or expired",
      });
    }
    user.password = newPassword;
    user.passwordConfirmation = newPasswordConfirm;
    user.otp = undefined; // Clear OTP
    user.otpReset = undefined; // Clear OTP expiration
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
    next();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error,
    });
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    user.password = password;
    user.passwordConfirmation = confirmPassword;
    user.save();
    res.status(200).json({
      status: "success",
      message: "password changed successfully",
    });
    next();
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error,
    });
  }
};
