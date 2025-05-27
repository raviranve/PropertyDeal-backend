const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
    {
      fullname: { type: String, required: true }, // User's full name
      email: { type: String, required: true }, // Contact email
      mobile: { type: String, required: true }, // Mobile number
      message: { type: String, required: true }, // User's query
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Enquiry", enquirySchema);
  