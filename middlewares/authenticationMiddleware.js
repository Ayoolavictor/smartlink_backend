const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.authentication = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in",
      });
    }

    // Verify the token and handle errors
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user no longer exists",
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token or token has expired",
    });
  }
};

exports.restrictTo = (...roles) => {
  try {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          status: "fail",
          message: "You are not authorized to do this action",
        });
      }
      next();
    };
  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token or token has expired",
    });
  }
};
