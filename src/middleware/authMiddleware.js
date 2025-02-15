const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
//   const token = req.header("Authorization").replace("Bearer ", "");
    const token = req.cookies.token; // Get token from cookies

    if (!token)
     return res.status(401).json({
      status: "error",
      message: "Access denied. No token provided.",
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ status: "error", message: "Invalid token." });
  }
};


// Role-Based Authorization Middleware
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          status: "error",
          message: `Access denied. Required role: ${roles.join(", ")}`,
        });
      }
      next();
    };
  };
  
module.exports = {authMiddleware,authorizeRoles};
