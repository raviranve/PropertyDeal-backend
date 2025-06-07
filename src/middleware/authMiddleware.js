const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to verify access token
const accessTokenVerify = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      status: "failed",
      message: "Access token not provided.",
      error: { message: "Access token not found" },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "User not found.",
        error: { message: "Invalid token" },
      });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "failed",
        message: "Access token expired.",
        error: { message: error.message },
      });
    }

    res.status(400).json({
      status: "failed",
      message: "Invalid access token.",
      error: { message: error.message },
    });
  }
};

// Role-Based Authorization Middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "failed",
        message: `Access denied. Required role: ${roles.join(", ")}`,
        error: { message: "Access denied for this user" },
      });
    }
    next();
  };
};

module.exports = { accessTokenVerify, authorizeRoles };
