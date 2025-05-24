const express = require("express");
const router = express.Router();
const controller = require("../controllers/categoryController");

router.post("/create-category", controller.createCategory);
router.get("/get-categories", controller.getAllCategories);
router.get("/category/:id", controller.getCategoryById);
router.put("/update-category/:id", controller.updateCategory);
router.delete("/delete-category/:id", controller.deleteCategory);
router.patch("/category/update-status", controller.updateCategoryStatus);

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
