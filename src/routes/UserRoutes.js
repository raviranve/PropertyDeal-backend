const express = require("express");
const userController = require("../controllers/UserController");
const notificationController = require("../controllers/NotificationController");
const upload = require("../middleware/uploadFile");
const {
  validateSignup,
  validateLogin,
  validateVerifyOTP,
  validateResetPassword,
} = require("../middleware/useValidations");
const {
  accessTokenVerify,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/signup",
  upload.single("profileImg"),
  validateSignup,
  userController.signup
);

router.post("/login", validateLogin, userController.login);
// Google Login
router.post("/google-auth", userController.googleAuth);
router.post("/generate-otp", userController.generateOtp);

// Reset Password
router.post(
  "/reset-password",
  validateResetPassword,
  userController.resetPassword
);

// Secure routes with authentication
router.get(
  "/users",
  accessTokenVerify,
  authorizeRoles("admin", "seller"),
  userController.getUsers
);
router.get("/users/:id", accessTokenVerify, userController.getUserById);
router.patch(
  "/users/:id",
  accessTokenVerify,
  authorizeRoles("admin", "seller"),
  userController.updateUser
);
router.delete(
  "/users/:id",
  accessTokenVerify,
  authorizeRoles("admin"),
  userController.deleteUser
);
router.post(
  "/send-sms",
  accessTokenVerify,
  notificationController.sendSmsToMobile
); // Send SMS notification

router.patch(
  "/update/user-role",
  accessTokenVerify,
  authorizeRoles("admin"),
  userController.updateUserRole
);

module.exports = router;
