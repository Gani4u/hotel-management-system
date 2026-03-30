const express = require("express");
const customerController = require("../controllers/customer.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/rooms/available", customerController.getAvailableRooms);
router.post("/register", customerController.registerCustomer);
router.post("/login", customerController.loginCustomer);

router.get(
  "/bookings",
  authMiddleware("customer"),
  customerController.getCustomerBookings,
);
router.delete(
  "/bookings/:bookingId",
  authMiddleware("customer"),
  customerController.cancelBooking,
);

module.exports = router;
