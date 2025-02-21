const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model
    rating: { type: Number, required: true, min: 1, max: 5 }, // 1-5 rating
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  });

  const Review = mongoose.model("Review", reviewSchema);
  module.exports = Review;