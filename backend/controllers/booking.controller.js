const pool = require("../config/db");

exports.createBooking = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, totalAmount } = req.body;
    const userId = req.user.id;

    if (!roomId || !checkIn || !checkOut || !totalAmount) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [rooms] = await connection.query(
        "SELECT id, price, status FROM rooms WHERE id = ?",
        [roomId],
      );

      if (rooms.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: "Room not found" });
      }

      if (rooms[0].status !== "available") {
        await connection.rollback();
        connection.release();
        return res.status(409).json({ message: "Room is not available" });
      }

      const [result] = await connection.query(
        "INSERT INTO bookings (room_id, user_id, check_in, check_out, total_amount, status) VALUES (?, ?, ?, ?, ?, ?)",
        [roomId, userId, checkIn, checkOut, totalAmount, "reserved"],
      );

      await connection.query("UPDATE rooms SET status = ? WHERE id = ?", [
        "booked",
        roomId,
      ]);

      await connection.commit();
      connection.release();

      return res.status(201).json({
        message: "Booking created successfully",
        bookingId: result.insertId,
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Create booking error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [bookings] = await connection.query(
      `SELECT 
        b.id,
        b.room_id,
        b.user_id,
        b.check_in,
        b.check_out,
        b.total_amount + 0 as total_amount,
        b.status,
        r.room_number,
        r.type,
        r.price + 0 as price,
        u.name,
        u.email,
        u.phone
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN users u ON b.user_id = u.id
      ORDER BY b.id DESC`,
    );

    connection.release();

    const normalized = bookings.map((b) => ({
      ...b,
      total_amount: parseFloat(b.total_amount),
      price: parseFloat(b.price),
    }));

    return res.status(200).json({
      message: "Bookings retrieved successfully",
      data: normalized,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [booking] = await connection.query(
        "SELECT room_id, status FROM bookings WHERE id = ?",
        [id],
      );

      if (booking.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: "Booking not found" });
      }

      await connection.query("UPDATE bookings SET status = ? WHERE id = ?", [
        status,
        id,
      ]);

      if (status === "checked_out" || status === "cancelled") {
        await connection.query("UPDATE rooms SET status = ? WHERE id = ?", [
          "available",
          booking[0].room_id,
        ]);
      }

      await connection.commit();
      connection.release();

      return res
        .status(200)
        .json({ message: "Booking status updated successfully" });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Update booking status error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [booking] = await connection.query(
        "SELECT id, room_id, status FROM bookings WHERE id = ? AND status = ?",
        [bookingId, "reserved"],
      );

      if (booking.length === 0) {
        await connection.rollback();
        connection.release();
        return res
          .status(404)
          .json({ message: "Booking not found or already checked in" });
      }

      await connection.query("UPDATE bookings SET status = ? WHERE id = ?", [
        "checked_in",
        bookingId,
      ]);

      await connection.query("UPDATE rooms SET status = ? WHERE id = ?", [
        "booked",
        booking[0].room_id,
      ]);

      await connection.commit();
      connection.release();

      return res.status(200).json({ message: "Guest checked in successfully" });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Check-in error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [booking] = await connection.query(
        "SELECT id, room_id, status FROM bookings WHERE id = ? AND status = ?",
        [bookingId, "checked_in"],
      );

      if (booking.length === 0) {
        await connection.rollback();
        connection.release();
        return res
          .status(404)
          .json({ message: "Booking not found or not checked in" });
      }

      await connection.query("UPDATE bookings SET status = ? WHERE id = ?", [
        "checked_out",
        bookingId,
      ]);

      await connection.query("UPDATE rooms SET status = ? WHERE id = ?", [
        "available",
        booking[0].room_id,
      ]);

      await connection.commit();
      connection.release();

      return res
        .status(200)
        .json({ message: "Guest checked out successfully" });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Check-out error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTodayCheckIns = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [bookings] = await connection.query(
      `SELECT 
        b.id,
        b.user_id,
        b.room_id,
        b.check_in,
        b.check_out,
        NULL as special_requests,
        b.status,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        r.room_number,
        r.type
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      WHERE DATE(b.check_in) = CURDATE()
      AND b.status = 'reserved'
      ORDER BY b.check_in ASC`,
    );

    connection.release();

    return res.status(200).json({
      message: "Today's check-ins retrieved successfully",
      data: bookings,
    });
  } catch (error) {
    console.error("Get check-ins error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTodayCheckOuts = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [bookings] = await connection.query(
      `SELECT 
        b.id,
        b.user_id,
        b.room_id,
        b.check_in,
        b.check_out,
        b.total_amount + 0 as total_amount,
        'pending' as payment_status,
        u.name as customer_name,
        u.phone as customer_phone,
        r.room_number,
        r.type
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      WHERE DATE(b.check_out) = CURDATE()
      AND b.status = 'checked_in'
      ORDER BY b.check_out ASC`,
    );

    connection.release();

    const normalized = bookings.map((b) => ({
      ...b,
      total_amount: parseFloat(b.total_amount),
    }));

    return res.status(200).json({
      message: "Today's check-outs retrieved successfully",
      data: normalized,
    });
  } catch (error) {
    console.error("Get check-outs error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
