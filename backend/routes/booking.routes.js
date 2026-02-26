const express = require('express');
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Create booking (Customer)
router.post('/', authMiddleware, bookingController.createBooking);

// Get all bookings (Staff/Admin)
router.get('/', authMiddleware, bookingController.getAllBookings);

// Get today's check-ins (Staff/Admin)
router.get('/today/check-ins', authMiddleware, bookingController.getTodayCheckIns);

// Get today's check-outs (Staff/Admin)
router.get('/today/check-outs', authMiddleware, bookingController.getTodayCheckOuts);

// Check-in endpoint (Staff/Admin)
router.post('/:bookingId/check-in', authMiddleware, bookingController.checkIn);

// Check-out endpoint (Staff/Admin)
router.post('/:bookingId/check-out', authMiddleware, bookingController.checkOut);

// Update booking status (Generic)
router.put('/:id', authMiddleware, bookingController.updateBookingStatus);

module.exports = router;
