const mongoose = require("mongoose");

const smsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: String,
      required: true,
      // e.g. "+1234567890"
    },
    message: {
      type: String,
      required: true,
    },
    sid: {
      type: String, // Twilio message SID after successful send
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Sms", smsSchema);
