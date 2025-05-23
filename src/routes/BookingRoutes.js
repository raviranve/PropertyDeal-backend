const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/BookingController");
const {
  accessTokenVerify,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const { validateBooking } = require("../middleware/useValidations");

router.post(
  "/create-booking",
  accessTokenVerify,
  validateBooking,
  BookingController.createBooking
);
router.get(
  "/get-bookings",
  accessTokenVerify,
  BookingController.getAllBookings
);
router.get(
  "/get-booking/:id",
  accessTokenVerify,
  BookingController.getBookingById
);
router.patch(
  "/update-booking/:id",
  accessTokenVerify,
  validateBooking,
  authorizeRoles("admin", "seller"),
  BookingController.updateBooking
);
router.delete(
  "/delete-booking/:id",
  accessTokenVerify,
  authorizeRoles("admin", "seller"),
  BookingController.deleteBooking
);
router.patch(
  "/update-status",
  accessTokenVerify,
  authorizeRoles("admin"),
  BookingController.updateBookingStatus
);
router.get(
  "/get-revenue",
  accessTokenVerify,
  authorizeRoles("admin"),
  BookingController.getTotalRevenue
);

module.exports = router;
