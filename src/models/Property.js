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
    address: { type: String, required: true },
    city: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
    state: {
      type: String,
      default: "MP",
    },
    country: {
      type: String,
      default: "India",
    },
  },
  size: { type: Number },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  facility: [{ type: String, default: ["Wifi", "RO", "Park"] }],
  propertyImages: [{ type: String }],
  owner: {
    name: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ["Available", "Sold", "Rented"],
    default: "Available",
  },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  averageRating: { type: Number, default: 0 },
  postedAt: { type: Date, default: Date.now },
});

const Property = mongoose.model("Property", propertySchema);
module.exports = Property;
