const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
//   const token = req.header("Authorization").replace("Bearer ", "");
    const token = req.cookies.token; // Get token from cookies

    if (!token)
     return res.status(401).json({
      status: "error",
      message: "Access denied. No token provided.",
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    // console.log(user, "user");
    
    req.user = user;

    
    next();
  } catch (error) {
    res.status(400).json({ status: "error", message: "Invalid token." });
  }
};


// Role-Based Authorization Middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log(req.data);
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
