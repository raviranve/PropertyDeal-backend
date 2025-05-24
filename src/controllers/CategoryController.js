const Category = require("../models/Category");
const { success, error } = require("../utils/responseHandler");

exports.createCategory = async (req, res) => {
  try {
    const { categoryName, createdBy, subCategories } = req.body;
    
     const existing = await Category.findOne({ categoryName: { $regex: `^${categoryName}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({
        status: false,
        message: "Category name already exists"
      });
    }

    const category = await Category.create({
      categoryName,
      createdBy,
      subCategories,
    });
    success(res, category, "Category Created Successfully", 201);
  } catch (err) {
    error(res, err, 400);
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    let { page, limit } = req.query; // Default page = 1, limit = 10
    page = parseInt(page);
    limit = parseInt(limit);
    const totalCategories = await Category.countDocuments();
    const categories = await Category.find()
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({
      status: true,
      message: "Category fetched successfully",
      data: categories || [],
      totalCategories,
      currentPage: page,
      totalPages: Math.ceil(totalCategories / limit),
      hasNextPage: page * limit < totalCategories,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return error(res, new Error("Category not found"), 404);
    success(res, category);
  } catch (err) {
    error(res, err);
  }
};

// exports.updateCategory = async (req, res) => {
//   try {
//     const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     if (!updated) return error(res, new Error("Category not found"), 404);
//     // Check if the category name already exists
//     const existing = await Category.findOne({
//       _id: { $ne: req.params.id },
//       categoryName: { $regex: `^${req.body.categoryName}$`, $options: 'i' }
//     });
    
//     success(res, updated, "Category Updated Successfully");
//   } catch (err) {
//     error(res, err, 400);
//   }
// };

exports.updateCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;
    if (categoryName) {
      // Check for duplicate name before updating
      const existing = await Category.findOne({
        categoryName: { $regex: `^${categoryName}$`, $options: 'i' },
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(200).json({
          status: false,
          message: "Category name already exists"
        });
      }
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return error(res, new Error("Category not found"), 404);
    success(res, updated, "Category Updated Successfully");
  } catch (err) {
    error(res, err, 400);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return error(res, new Error("Category not found"), 404);
    success(res, deleted, "Category Deleted Successfully");
  } catch (err) {
    error(res, err);
  }
};

exports.addSubCategory = async (req, res) => {
  try {
    const { name, status = true } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return error(res, new Error("Category not found"), 404);

    category.subCategories.push({ name, status });
    await category.save();
    success(res, category, "Subcategory added", 201);
  } catch (err) {
    error(res, err);
  }
};

exports.updateSubCategory = async (req, res) => {
  try {
    const { name, status } = req.body;
    const category = await Category.findById(req.params.categoryId);
    if (!category) return error(res, new Error("Category not found"), 404);
    const sub = category.subCategories[req.params.subIndex]; // ✅ correct for index-based access

    if (!sub) return error(res, new Error("Subcategory not found"), 404);

    if (name !== undefined) sub.name = name;
    if (status !== undefined) sub.status = status;

    await category.save();
    success(res, category, "Subcategory updated");
  } catch (err) {
    error(res, err);
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return error(res, new Error("Category not found"), 404);

    const sub = category.subCategories[req.params.subIndex]; // ✅ correct for index-based access

    if (!sub) return error(res, new Error("Subcategory not found"), 404);

    category.subCategories.splice(req.params.subIndex, 1);
    await category.save();
    success(res, category, "Subcategory deleted");
  } catch (err) {
    error(res, err);
  }
};

// ✅ UPDATE Category STATUS
exports.updateCategoryStatus = async (req, res) => {
  try {
    const { categoryId, status } = req.body;
    console.log(categoryId, status)
    const updateCategory = await Category.findByIdAndUpdate(
      categoryId,
      { status },
      { new: true }
    );
    res.status(200).json({
      status: true,
      message: "Category status updated successfully",
      data: updateCategory,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error, booking status not updated",
      error: error.message,
    });
  }
};
