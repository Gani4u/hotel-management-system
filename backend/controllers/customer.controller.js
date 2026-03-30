const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const connection = await pool.getConnection();

    try {
      const [customers] = await connection.query(
        "SELECT id FROM users WHERE email = ?",
        [email],
      );

      if (customers.length > 0) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await connection.query(
        "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)",
        [name, email, phone, hashedPassword, "customer"],
      );

      return res.status(201).json({
        message: "Registration successful",
        customerId: result.insertId,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Customer registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const connection = await pool.getConnection();

    try {
      const [customers] = await connection.query(
        "SELECT id, name, email, password, phone, role FROM users WHERE email = ? AND role = ?",
        [email, "customer"],
      );

      if (customers.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const customer = customers[0];
      const isPasswordValid = await bcrypt.compare(password, customer.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: customer.id, email: customer.email, role: customer.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          role: customer.role,
        },
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          role: customer.role,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Customer login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAvailableRooms = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [rooms] = await connection.query(
      "SELECT id, room_number, type, price, status FROM rooms WHERE status = ?",
      ["available"],
    );

    connection.release();

    return res.status(200).json({
      message: "Available rooms retrieved successfully",
      data: rooms,
    });
  } catch (error) {
    console.error("Get available rooms error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCustomerBookings = async (req, res) => {
  try {
    const customerId = req.user.id;
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
        r.price + 0 as price
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.user_id = ?
      ORDER BY b.check_in DESC`,
      [customerId],
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
    console.error("Get customer bookings error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { bookingId } = req.params;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [booking] = await connection.query(
        "SELECT room_id, status FROM bookings WHERE id = ? AND user_id = ?",
        [bookingId, customerId],
      );

      if (booking.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: "Booking not found" });
      }

      if (booking[0].status === "checked_out") {
        await connection.rollback();
        connection.release();
        return res
          .status(400)
          .json({ message: "Cannot cancel completed booking" });
      }

      await connection.query("UPDATE bookings SET status = ? WHERE id = ?", [
        "cancelled",
        bookingId,
      ]);

      await connection.query("UPDATE rooms SET status = ? WHERE id = ?", [
        "available",
        booking[0].room_id,
      ]);

      await connection.commit();
      connection.release();

      return res.status(200).json({
        message: "Booking cancelled successfully",
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
