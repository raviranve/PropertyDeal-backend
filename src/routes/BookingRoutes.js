const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/BookingController");
const { accessTokenVerify, authorizeRoles } = require("../middleware/authMiddleware");
const {validateBooking} = require("../middleware/useValidations")

router.post("/create-booking", accessTokenVerify, validateBooking, authorizeRoles("admin, seller"), BookingController.createBooking);
router.get("/get-bookings", accessTokenVerify, validateBooking, BookingController.getAllBookings);
router.get("/get-booking/:id",accessTokenVerify, validateBooking, BookingController.getBookingById);
router.patch("/update-booking/:id",accessTokenVerify, authorizeRoles("admin, seller"), BookingController.updateBooking);
router.delete("/delete-booking/:id",accessTokenVerify, validateBooking,authorizeRoles("admin, seller"),BookingController.deleteBooking);

module.exports = router;
