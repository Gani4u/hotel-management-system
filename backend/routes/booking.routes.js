const express = require("express");
const bookingController = require("../controllers/booking.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware("customer"), bookingController.createBooking);

router.get("/", authMiddleware(["admin", "staff"]), bookingController.getAllBookings);
router.get(
  "/today/check-ins",
  authMiddleware(["admin", "staff"]),
  bookingController.getTodayCheckIns,
);
router.get(
  "/today/check-outs",
  authMiddleware(["admin", "staff"]),
  bookingController.getTodayCheckOuts,
);
router.post(
  "/:bookingId/check-in",
  authMiddleware(["admin", "staff"]),
  bookingController.checkIn,
);
router.post(
  "/:bookingId/check-out",
  authMiddleware(["admin", "staff"]),
  bookingController.checkOut,
);
router.put(
  "/:id",
  authMiddleware(["admin", "staff"]),
  bookingController.updateBookingStatus,
);

module.exports = router;
