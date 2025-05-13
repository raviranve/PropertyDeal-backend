const Booking = require("../models/Booking");
const sendNotification = require("../utils/sendNotification");

exports.createBooking = async (req, res) => {
  try {
    const { name, mobile, propertyId, userId, dateTime, message } = req.body;

    const newBooking = new Booking({
      name,
      mobile,
      propertyId,
      userId,
      dateTime,
      message,
    });
    await newBooking.save();

    // Get io instance from app
    const io = req.app.get("socketio");
    // Emit the booking creation event to all connected clients
    sendNotification(io, "newBookingNotification", {
      message: `${name} booked the property`,
      data: newBooking,
    });
    res
      .status(201)
      .json({
        status: true,
        message: "Booking created successfully",
        data: newBooking,
      });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

// Get All Bookings with Pagination
exports.getAllBookings = async (req, res) => {
  try {
    let { page, limit } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const totalBookings = await Booking.countDocuments();
    const bookings = await Booking.find()
      .populate(
        "propertyId",
        "location.city location.state location.country location.address"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({
      status: true,
      message: "Bookings fetched successfully",
      data: bookings,
      totalBookings,
      currentPage: page,
      totalPages: Math.ceil(totalBookings / limit),
      hasNextPage: page * limit < totalBookings,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

// Get Single Booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      "propertyId"
    );
    if (!booking) {
      return res
        .status(404)
        .json({ status: false, message: "Booking not found" });
    }
    res
      .status(200)
      .json({
        status: true,
        message: "Booking fetched successfully",
        data: booking,
      });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

// Update Booking with Validation
exports.updateBooking = async (req, res) => {
  try {
    const { name, mobile, propertyId, dateTime, message, status } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { name, mobile, propertyId, dateTime, message, status },
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return res
        .status(404)
        .json({ status: false, message: "Booking not found" });
    }

    res
      .status(200)
      .json({
        status: true,
        message: "Booking updated successfully",
        data: updatedBooking,
      });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

// Delete Booking
exports.deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    console.log(deletedBooking, "deletedBooking");
    if (!deletedBooking) {
      return res
        .status(404)
        .json({ status: false, message: "Booking not found" });
    }

    res
      .status(200)
      .json({ status: true, message: "Booking deleted successfully", data: deletedBooking });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};
