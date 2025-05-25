const mongoose = require("mongoose");

const viewSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    unique: true, // ensures only one view per unique IP
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("View", viewSchema);
