const Notification = require("../models/Notification");
const sendSms = require("../utils/SendSms");
const Sms = require("../models/Sms");
exports.sendNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body;
    const newNotification = new Notification({ userId, message, type });
    await newNotification.save();
    // Emit notification via Socket.io
    const io = req.app.get("socketio");
    io.emit("notification", { userId, message, type });
    res
      .status(201)
      .json({
        status: true,
        message: "Notification sent successfully",
        data: newNotification,
      });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res
      .status(200)
      .json({
        status: true,
        message: "Notifications fetched successfully",
        data: notifications,
      });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

// ✅ Get notifications for a specific user
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ status: true, data: notifications });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

// ✅ Mark a notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res
      .status(200)
      .json({ status: true, message: "Notification marked as read" });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

// ✅ Delete a specific notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res
      .status(200)
      .json({ status: true, message: "Notification deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

// ✅ Clear all notifications
exports.clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany();
    res
      .status(200)
      .json({ status: true, message: "All notifications cleared" });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

// ✅ Send sms notification
exports.sendSmsToMobile = async (req, res) => {
  try {
    const { to, message, userId, userMobileNumber } = req.body;
    const newSms = new Sms({
      to,
      message,
      userId,
      sid: process.env.TWILIO_ACCOUNT_SID,
    });
    await newSms.save();

    sendSms(message, userMobileNumber); // Call the sendSms function to send the SMS
    console.log(`Sending SMS to ${to}: ${message}`);
    res.status(200).json({ status: true, message: "SMS sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};
