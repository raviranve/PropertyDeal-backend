// models/View.js
const mongoose = require('mongoose');

const viewSchema = new mongoose.Schema({
  page: { type: String, required: true },
  ipAddress: { type: String, required: true },
  viewedAt: { type: Date, default: Date.now }
});

// Ensure a combination of IP and page is unique
viewSchema.index({ ipAddress: 1 }, { unique: true });

module.exports = mongoose.model('View', viewSchema);
