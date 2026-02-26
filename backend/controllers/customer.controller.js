const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Customer Registration
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const connection = await pool.getConnection();

    // Check if customer exists
    const [customers] = await connection.query(
      'SELECT id FROM customers WHERE email = ?',
      [email]
    );

    if (customers.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await connection.query(
      'INSERT INTO customers (name, email, phone, password) VALUES (?, ?, ?, ?)',
      [name, email, phone, hashedPassword]
    );

    connection.release();

    res.status(201).json({
      message: 'Registration successful',
      customerId: result.insertId,
    });
  } catch (error) {
    console.error('Customer registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Customer Login
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const connection = await pool.getConnection();

    const [customers] = await connection.query(
      'SELECT id, name, email, password, phone FROM customers WHERE email = ?',
      [email]
    );

    connection.release();

    if (customers.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const customer = customers[0];
    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email, type: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: 'customer',
      },
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: 'customer',
      },
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// View Available Rooms (Public - no auth required)
exports.getAvailableRooms = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [rooms] = await connection.query(
      'SELECT id, room_number, type, price, status FROM rooms WHERE status = ?',
      ['available']
    );

    connection.release();

    res.status(200).json({
      message: 'Available rooms retrieved successfully',
      data: rooms,
    });
  } catch (error) {
    console.error('Get available rooms error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Customer's Bookings
exports.getCustomerBookings = async (req, res) => {
  try {
    const customerId = req.user.id;
    const connection = await pool.getConnection();

    const [bookings] = await connection.query(
      `SELECT 
        b.id,
        b.room_id,
        b.customer_id,
        b.check_in,
        b.check_out,
        b.total_amount + 0 as total_amount,
        b.status,
        r.room_number,
        r.type,
        r.price + 0 as price
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.customer_id = ?
      ORDER BY b.check_in DESC`,
      [customerId]
    );

    connection.release();

    // ensure numbers
    const normalized = bookings.map(b => ({
      ...b,
      total_amount: parseFloat(b.total_amount),
      price: parseFloat(b.price)
    }));

    res.status(200).json({
      message: 'Bookings retrieved successfully',
      data: normalized,
    });
  } catch (error) {
    console.error('Get customer bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Cancel Booking
exports.cancelBooking = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { bookingId } = req.params;

    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      const [booking] = await connection.query(
        'SELECT room_id, status FROM bookings WHERE id = ? AND customer_id = ?',
        [bookingId, customerId]
      );

      if (booking.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Booking not found' });
      }

      if (booking[0].status === 'checked_out') {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: 'Cannot cancel completed booking' });
      }

      await connection.query(
        'UPDATE bookings SET status = ? WHERE id = ?',
        ['cancelled', bookingId]
      );

      await connection.query(
        'UPDATE rooms SET status = ? WHERE id = ?',
        ['available', booking[0].room_id]
      );

      await connection.commit();
      connection.release();

      res.status(200).json({
        message: 'Booking cancelled successfully',
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
