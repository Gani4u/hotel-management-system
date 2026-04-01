const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const roomRoutes = require('./routes/room.routes');
const bookingRoutes = require('./routes/booking.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const customerRoutes = require('./routes/customer.routes');
const publicRoutes = require('./routes/public.routes');
const reviewRoutes = require('./routes/review.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Public Routes (No Authentication)
app.use('/api/public', publicRoutes);

// Authentication Routes
app.use('/api/auth', authRoutes);

// Customer Routes
app.use('/api/reviews', reviewRoutes);

app.use('/api/customer', customerRoutes);

// Protected Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
