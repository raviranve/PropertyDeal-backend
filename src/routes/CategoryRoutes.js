const express = require("express");
const router = express.Router();
const controller = require("../controllers/CategoryController");
const { authorizeRoles, accessTokenVerify } = require("../middleware/authMiddleware");

router.post("/create-category", accessTokenVerify, controller.createCategory);
router.get("/get-categories", controller.getAllCategories);
router.get("/category/:id", accessTokenVerify, controller.getCategoryById);
router.put(
  "/update-category/:id",
  accessTokenVerify,
  controller.updateCategory
);
router.delete(
  "/delete-category/:id",
  accessTokenVerify,
  authorizeRoles("admin"),
  controller.deleteCategory
);
router.patch(
  "/category/update-status",
  accessTokenVerify,
  authorizeRoles("admin"),
  controller.updateCategoryStatus
);

module.exports = router;
