const express = require("express");
const userController = require("../controllers/UserController");
const upload = require("../middleware/uploadFile"); 
const {validateSignup,validateLogin,validateVerifyOTP, validateResetPassword} = require("../middleware/useValidations");
const { accessTokenVerify, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup",upload.single("profileImg"),validateSignup,userController.signup); // Profile image upload

router.post("/login",validateLogin, userController.login);
// Google Login
router.post("/google-auth", userController.googleAuth);
router.post("/generate-otp", userController.generateOtp);

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