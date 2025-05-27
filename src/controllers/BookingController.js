const Booking = require("../models/Booking");
const { success } = require("../utils/responseHandler");

exports.createBooking = async (req, res) => {
  try {
    const { name, mobile, propertyId, userId, message } = req.body;

    const newBooking = new Booking({
      name,
      mobile,
      propertyId,
      userId,
      message,
    });
    await newBooking.save();

    res.status(201).json({
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
    let { page, limit, status, name } = req.query;

    let filter = {};

    // 📌 Filter by property type
    if (status) filter.status = status;
    // 📌 Filter by name
    if (name) {
      const regex = new RegExp(name, "i");
      filter.name = regex;
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const totalBookings = await Booking.countDocuments(filter);
    const totalConfirmedBookings = await Booking.countDocuments({
      status: "confirmed",
    });
    const totalPendingBookings = await Booking.countDocuments({
      status: "pending",
    });

    const bookings = await Booking.find(filter)
      .populate("propertyId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({
      status: true,
      message: "Bookings fetched successfully",
      data: bookings,
      totalBookings,
      totalConfirmedBookings,
      totalPendingBookings,
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
    res.status(200).json({
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
    const { name, mobile, propertyId, message, status } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { name, mobile, propertyId, message, status },
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return res
        .status(404)
        .json({ status: false, message: "Booking not found" });
    }

    res.status(200).json({
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

//  Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );
    res.status(200).json({
      status: true,
      message: "Booking status updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error, booking status not updated",
      error: error.message,
    });
  }
};

// Delete Booking
exports.deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res
        .status(404)
        .json({ status: false, message: "Booking not found" });
    }

    res.status(200).json({
      status: true,
      message: "Booking deleted successfully",
      data: deletedBooking,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

exports.getTotalRevenue = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      {
        $match: { status: "confirmed" },
      },
      {
        $lookup: {
          from: "properties",
          localField: "propertyId",
          foreignField: "_id",
          as: "property",
        },
      },
      { $unwind: "$property" },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalRevenue: { $sum: "$property.price" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    success(res, { bookings: data }, "Revenue fetched successfully");
  } catch (err) {
    res.status(500).json({ message: "Failed to get revenue", error: err });
  }
};
