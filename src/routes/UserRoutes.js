const express = require("express");
const { createUser, getUsers, getUserById, updateUser, deleteUser ,login} = require("../controllers/UserController");
const upload = require("../middleware/uploadFile"); 
const {validateUser, validateLogin} = require("../middleware/useValidations");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", upload.single("profileImg"), validateUser, createUser); // Profile image upload
router.post("/login",validateLogin, login);
// Secure routes with authentication
router.get("/users", authMiddleware, authorizeRoles("Admin"), getUsers);
router.get("/users/:id", authMiddleware, authorizeRoles("Admin", "Seller", "Buyer"), getUserById);
router.patch("/users/:id", authMiddleware,validateUser, authorizeRoles("Admin", "Seller"), updateUser);
router.delete("/users/:id", authMiddleware, authorizeRoles("Admin"), deleteUser);


module.exports = router;
