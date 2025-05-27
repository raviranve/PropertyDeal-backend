const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: Boolean, default: true },
  },
  { _id: false }
); // _id: false prevents auto-generating an _id for each subcategory

const categorySchema = new mongoose.Schema(
  {
    categoryName: { type: String, unique: true, required: true },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    subCategories: [subCategorySchema], // <-- Subcategories array
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
