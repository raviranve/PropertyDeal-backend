const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },

  propertyType: {
    type: String,
    enum: ["Apartment", "House", "Villa", "Commercial"],
    required: true,
  },

  location: {
    locality: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
    city: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
    state: { type: String, default: "MP" },
    country: { type: String, default: "India" },
  },

  size: { type: Number }, // in square feet, for example
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },

  facilities: {
    type: [String],
    default: ["Wifi", "RO", "Park"],
  },

  propertyImages: [{ type: String }], // store image URLs or paths

  owner: {
    name: { type: String, required: true },
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },

  status: {
    type: String,
    enum: ["Available", "Sold", "Rented"],
    default: "Available",
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subCategory: {
    type: [String], // ✅ allow multiple subcategory names
    required: true,
  },

  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

  averageRating: { type: Number, default: 0 },

  postedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Create model
const Property = mongoose.model("Property", propertySchema);
module.exports = Property;
// module.exports = Property;
