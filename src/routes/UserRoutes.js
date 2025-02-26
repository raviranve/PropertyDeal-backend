// const express = require("express");
// const userController = require("../controllers/UserController");
// const upload = require("../middleware/uploadFile"); 
// const {validateUser, validateLogin,validateVerifyOTP, validateForgotPassword, validateResetPassword} = require("../middleware/useValidations");
// const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

// const router = express.Router();

// router.post("/signup", upload.single("profileImg"), userController.signup); // Profile image upload
// router.post("/login", userController.login);
// // Secure routes with authentication
// router.get("/users", authMiddleware, authorizeRoles("Admin"), userController.getUsers);
// router.get("/users/:id", authMiddleware, authorizeRoles("Admin", "Seller", "Buyer"), userController.getUserById);
// router.patch("/users/:id", authMiddleware,validateUser, authorizeRoles("Admin", "Seller"), userController.updateUser);
// router.delete("/users/:id", authMiddleware, authorizeRoles("Admin"), userController.deleteUser);
// // Google Login
// router.post("/google-auth", userController.googleAuth);

// // Verify OTP
// router.post("/verify-otp", validateVerifyOTP, userController.verifyOTP);

// // Forgot Password
// router.post("/forgot-password", validateForgotPassword, userController.forgotPassword);

// // Reset Password
// router.post("/reset-password", validateResetPassword, userController.resetPassword);


// module.exports = router;


const express = require("express");
const userController = require("../controllers/UserController");
const upload = require("../middleware/uploadFile"); 
const {validateSignup,validateLogin,validateVerifyOTP, validateResetPassword} = require("../middleware/useValidations");
const { accessTokenVerify, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup",validateSignup, upload.single("profileImg"), userController.signup); // Profile image upload
router.post("/login",validateLogin, userController.login);
// Google Login
router.post("/google-auth", userController.googleAuth);

// Verify OTP
router.post("/verify-otp", validateVerifyOTP, userController.verifyOTP);

// Reset Password
router.post("/reset-password", validateResetPassword, userController.resetPassword);

// Secure routes with authentication
router.get("/users", accessTokenVerify, authorizeRoles("Admin"), userController.getUsers);
router.get("/users/:id", accessTokenVerify, authorizeRoles("Admin", "Seller", "Buyer"), userController.getUserById);
router.patch("/users/:id", accessTokenVerify, authorizeRoles("Admin", "Seller"), userController.updateUser);
router.delete("/users/:id", accessTokenVerify, authorizeRoles("Admin"), userController.deleteUser);

module.exports = router;