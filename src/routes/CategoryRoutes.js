const express = require("express");
const router = express.Router();
const controller = require("../controllers/categoryController");
const { authorizeRoles } = require("../middleware/authMiddleware");

router.post("/create-category", controller.createCategory);
router.get("/get-categories", controller.getAllCategories);
router.get("/category/:id", controller.getCategoryById);
router.put("/update-category/:id", controller.updateCategory);
router.delete(
  "/delete-category/:id",
  authorizeRoles("admin"),
  controller.deleteCategory
);
router.patch(
  "/category/update-status",
  authorizeRoles("admin"),
  controller.updateCategoryStatus
);

// Subcategory routes
router.post("/category/:id/subcategories", controller.addSubCategory);
router.put(
  "/category/:categoryId/subcategories/:subIndex",
  controller.updateSubCategory
);
router.delete(
  "/category/:categoryId/subcategories/:subIndex",
  controller.deleteSubCategory
);

module.exports = router;
