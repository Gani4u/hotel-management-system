const pool = require('../config/db');

exports.createBooking = async (req, res) => {
  try {
    const { roomId, customerId, checkIn, checkOut, totalAmount } = req.body;

    if (!roomId || !customerId || !checkIn || !checkOut || !totalAmount) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      // Get room details including price
      const [rooms] = await connection.query(
        'SELECT id, price FROM rooms WHERE id = ?',
        [roomId]
      );

      if (rooms.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Room not found' });
      }

      const pricePerNight = rooms[0].price;

      const [result] = await connection.query(
        'INSERT INTO bookings (room_id, customer_id, check_in, check_out, price_per_night, total_amount, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [roomId, customerId, checkIn, checkOut, pricePerNight, totalAmount, 'reserved', 'pending']
      );

      await connection.query(
        'UPDATE rooms SET status = ? WHERE id = ?',
        ['booked', roomId]
      );

      await connection.commit();
      connection.release();

      res.status(201).json({
        message: 'Booking created successfully',
        bookingId: result.insertId,
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
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
        r.price + 0 as price,
        c.name,
        c.email,
        c.phone
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN customers c ON b.customer_id = c.id
      ORDER BY b.id DESC`
    );

    connection.release();

    // convert string numbers to actual numbers
    const normalized = bookings.map((b) => ({
      ...b,
      total_amount: parseFloat(b.total_amount),
      price: parseFloat(b.price),
    }));

    res.status(200).json({
      message: 'Bookings retrieved successfully',
      data: normalized,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      const [booking] = await connection.query(
        'SELECT room_id, status FROM bookings WHERE id = ?',
        [id]
      );

      if (booking.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Booking not found' });
      }

      const updateFields = ['status = ?'];
      const updateValues = [status];

      if (paymentStatus) {
        updateFields.push('payment_status = ?');
        updateValues.push(paymentStatus);
      }

      if (status === 'checked_in') {
        updateFields.push('checked_in_at = NOW()');
      }

      if (status === 'checked_out') {
        updateFields.push('checked_out_at = NOW()');
        // Make room available after check-out
        const roomId = booking[0].room_id;
        await connection.query(
          'UPDATE rooms SET status = ? WHERE id = ?',
          ['available', roomId]
        );
      }

      updateValues.push(id);

      await connection.query(
        `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      await connection.commit();
      connection.release();

      res.status(200).json({ message: 'Booking status updated successfully' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Check-In endpoint (Staff/Admin only)
exports.checkIn = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const staffId = req.user.id;

    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      const [booking] = await connection.query(
        'SELECT id, room_id, status FROM bookings WHERE id = ? AND status = ?',
        [bookingId, 'reserved']
      );

      if (booking.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Booking not found or already checked in' });
      }

      // Update booking status to checked_in
      await connection.query(
        'UPDATE bookings SET status = ?, checked_in_at = NOW(), approved_by = ? WHERE id = ?',
        ['checked_in', staffId, bookingId]
      );

      // Keep room as booked (occupied)
      await connection.query(
        'UPDATE rooms SET status = ? WHERE id = ?',
        ['booked', booking[0].room_id]
      );

      await connection.commit();
      connection.release();

      res.status(200).json({ message: 'Guest checked in successfully' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Check-Out endpoint (Staff/Admin only)
exports.checkOut = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentStatus } = req.body;
    const staffId = req.user.id;

    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      const [booking] = await connection.query(
        'SELECT id, room_id, status FROM bookings WHERE id = ? AND status = ?',
        [bookingId, 'checked_in']
      );

      if (booking.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Booking not found or not checked in' });
      }

      const updateFields = ['status = ?', 'checked_out_at = NOW()', 'approved_by = ?'];
      const updateValues = ['checked_out', staffId];

      if (paymentStatus) {
        updateFields.push('payment_status = ?');
        updateValues.push(paymentStatus);
      }

      updateValues.push(bookingId);

      // Update booking status to checked_out
      await connection.query(
        `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      // Make room available after check-out
      await connection.query(
        'UPDATE rooms SET status = ? WHERE id = ?',
        ['available', booking[0].room_id]
      );

      await connection.commit();
      connection.release();

      res.status(200).json({ message: 'Guest checked out successfully' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get today's pending check-ins (Staff/Admin)
exports.getTodayCheckIns = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [bookings] = await connection.query(
      `SELECT 
        b.id,
        b.customer_id,
        b.room_id,
        b.check_in,
        b.check_out,
        b.special_requests,
        b.status,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        r.room_number,
        r.type
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN rooms r ON b.room_id = r.id
      WHERE DATE(b.check_in) = CURDATE() 
      AND b.status = 'reserved'
      ORDER BY b.check_in ASC`
    );

    connection.release();

    res.status(200).json({
      message: 'Today\'s check-ins retrieved successfully',
      data: bookings,
    });
  } catch (error) {
    console.error('Get check-ins error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get today's pending check-outs (Staff/Admin)
exports.getTodayCheckOuts = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [bookings] = await connection.query(
      `SELECT 
        b.id,
        b.customer_id,
        b.room_id,
        b.check_in,
        b.check_out,
        b.total_amount + 0 as total_amount
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN rooms r ON b.room_id = r.id
      WHERE DATE(b.check_out) = CURDATE() 
      AND b.status = 'checked_in'
      ORDER BY b.check_out ASC`
    );

    connection.release();

    const normalized = bookings.map(b => ({
      ...b,
      total_amount: parseFloat(b.total_amount),
    }));

    res.status(200).json({
      message: 'Today\'s check-outs retrieved successfully',
      data: normalized,
    });
  } catch (error) {
    console.error('Get check-outs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
