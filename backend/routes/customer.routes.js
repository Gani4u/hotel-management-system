const express = require('express');
const customerController = require('../controllers/customer.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', customerController.registerCustomer);
router.post('/login', customerController.loginCustomer);
router.get('/rooms/available', customerController.getAvailableRooms);

// Protected routes (requires authentication)
router.get('/bookings', authMiddleware, customerController.getCustomerBookings);
router.delete('/bookings/:bookingId', authMiddleware, customerController.cancelBooking);

module.exports = router;
