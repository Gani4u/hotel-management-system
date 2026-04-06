const pool = require("../config/db");
const PDFDocument = require("pdfkit");

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
// -------------------- helpers --------------------
const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
};

const drawCard = (doc, x, y, w, h, title) => {
  doc
    .save()
    .fillColor("#F8FAFC")
    .roundedRect(x, y, w, h, 10)
    .fill()
    .restore();

  doc
    .save()
    .strokeColor("#E2E8F0")
    .lineWidth(1)
    .roundedRect(x, y, w, h, 10)
    .stroke()
    .restore();

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#64748B")
    .text(title, x + 14, y + 12);

  return y + 32;
};

const drawTextPair = (doc, label, value, x, y, width = 200) => {
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#64748B")
    .text(label, x, y, { width });

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#0F172A")
    .text(value, x, y + 14, { width });
};

const drawTableHeader = (doc, y) => {
  doc
    .save()
    .fillColor("#0F172A")
    .roundedRect(40, y, 515, 28, 8)
    .fill()
    .restore();

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#FFFFFF")
    .text("Description", 55, y + 9, { width: 230 })
    .text("Qty", 315, y + 9, { width: 40, align: "center" })
    .text("Rate", 390, y + 9, { width: 70, align: "right" })
    .text("Amount", 475, y + 9, { width: 65, align: "right" });

  return y + 38;
};

const drawTableRow = (doc, y, description, qty, rate, amount) => {
  doc
    .save()
    .fillColor("#FFFFFF")
    .roundedRect(40, y - 4, 515, 34, 6)
    .fill()
    .restore();

  doc
    .save()
    .strokeColor("#E2E8F0")
    .lineWidth(1)
    .roundedRect(40, y - 4, 515, 34, 6)
    .stroke()
    .restore();

  doc
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor("#0F172A")
    .text(description, 55, y + 6, { width: 230 })
    .text(String(qty), 315, y + 6, { width: 40, align: "center" })
    .text(rate, 390, y + 6, { width: 70, align: "right" })
    .text(amount, 475, y + 6, { width: 65, align: "right" });

  return y + 42;
};

// -------------------- controller --------------------
exports.generateBill = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const connection = await pool.getConnection();

    try {
      // Optional security improvement:
      // customer can download only their own bill
      let query = `
        SELECT 
          b.id,
          b.user_id,
          b.check_in,
          b.check_out,
          b.total_amount,
          b.status,
          u.name,
          u.email,
          u.phone,
          r.room_number,
          r.type,
          r.price
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        WHERE b.id = ?
      `;
      const params = [bookingId];

      if (req.user.role === "customer") {
        query += " AND b.user_id = ?";
        params.push(req.user.id);
      }

      const [rows] = await connection.query(query, params);
      connection.release();

      if (rows.length === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const booking = {
        ...rows[0],
        total_amount: Number(rows[0].total_amount || 0),
        price: Number(rows[0].price || 0),
      };

      const nights = getNights(booking.check_in, booking.check_out);
      const invoiceNo = `INV-${String(booking.id).padStart(6, "0")}`;
      const issueDate = formatDate(new Date());
      const subtotal = booking.total_amount;
      const total = booking.total_amount;

      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        bufferPages: true,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice_${booking.id}.pdf`
      );

      doc.pipe(res);

      const pageWidth = doc.page.width;
      const primary = "#0F172A";
      const accent = "#2563EB";
      const muted = "#64748B";
      const dark = "#0F172A";
      const success = "#16A34A";

      // -------------------- Header --------------------
      doc.rect(0, 0, pageWidth, 115).fill(primary);

      doc
        .font("Helvetica-Bold")
        .fontSize(24)
        .fillColor("#FFFFFF")
        .text("GRAND STAY HOTEL", 40, 32);

      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor("#CBD5E1")
        .text("Premium Hospitality Invoice", 40, 64);

      doc
        .save()
        .fillColor(accent)
        .roundedRect(410, 28, 145, 34, 8)
        .fill()
        .restore();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#FFFFFF")
        .text("BOOKING INVOICE", 425, 39);

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#CBD5E1")
        .text(`Invoice No: ${invoiceNo}`, 410, 75, { width: 145, align: "right" })
        .text(`Issue Date: ${issueDate}`, 410, 90, { width: 145, align: "right" });

      let y = 140;

      // -------------------- Top info cards --------------------
      let cardY = drawCard(doc, 40, y, 245, 118, "BILLED TO");
      drawTextPair(doc, "Guest Name", booking.name || "N/A", 54, cardY, 210);
      drawTextPair(doc, "Email", booking.email || "N/A", 54, cardY + 36, 210);
      drawTextPair(doc, "Phone", booking.phone || "N/A", 54, cardY + 72, 210);

      cardY = drawCard(doc, 310, y, 245, 118, "BOOKING INFO");
      drawTextPair(doc, "Booking ID", String(booking.id), 324, cardY, 210);
      drawTextPair(
        doc,
        "Room",
        `${booking.room_number} • ${booking.type}`,
        324,
        cardY + 36,
        210
      );
      drawTextPair(
        doc,
        "Status",
        String(booking.status || "").replace(/_/g, " ").toUpperCase(),
        324,
        cardY + 72,
        210
      );

      y += 145;

      // -------------------- Stay details --------------------
      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor(dark)
        .text("Stay Summary", 40, y);

      y += 18;

      doc
        .save()
        .strokeColor("#E2E8F0")
        .lineWidth(1)
        .moveTo(40, y)
        .lineTo(555, y)
        .stroke()
        .restore();

      y += 16;

      drawTextPair(doc, "Check-In", formatDate(booking.check_in), 40, y, 140);
      drawTextPair(doc, "Check-Out", formatDate(booking.check_out), 200, y, 140);
      drawTextPair(doc, "Nights", String(nights), 360, y, 80);
      drawTextPair(doc, "Rate / Night", formatCurrency(booking.price), 450, y, 105);

      y += 64;

      // -------------------- Table --------------------
      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor(dark)
        .text("Charges", 40, y);

      y += 22;
      y = drawTableHeader(doc, y);

      y = drawTableRow(
        doc,
        y,
        `${booking.type} Room • Room ${booking.room_number}`,
        nights,
        formatCurrency(booking.price),
        formatCurrency(subtotal)
      );

      // -------------------- Total box --------------------
      y += 8;

      doc
        .save()
        .fillColor("#F8FAFC")
        .roundedRect(335, y, 220, 92, 10)
        .fill()
        .restore();

      doc
        .save()
        .strokeColor("#E2E8F0")
        .lineWidth(1)
        .roundedRect(335, y, 220, 92, 10)
        .stroke()
        .restore();

      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor(muted)
        .text("Subtotal", 350, y + 18)
        .text(formatCurrency(subtotal), 450, y + 18, { width: 90, align: "right" });

      doc
        .save()
        .strokeColor("#E2E8F0")
        .moveTo(350, y + 42)
        .lineTo(540, y + 42)
        .stroke()
        .restore();

      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor(success)
        .text("Total", 350, y + 56)
        .text(formatCurrency(total), 435, y + 56, { width: 105, align: "right" });

      y += 125;

      // -------------------- Footer note --------------------
      doc
        .save()
        .strokeColor("#CBD5E1")
        .moveTo(40, y)
        .lineTo(555, y)
        .stroke()
        .restore();

      y += 18;

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(dark)
        .text("Thank you for staying with Grand Stay Hotel.", 40, y);

      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor(muted)
        .text(
          "This is a system-generated invoice and does not require a physical signature.",
          40,
          y + 18,
          { width: 515, align: "left" }
        );

      doc.end();
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Generate bill error:", error);
    return res.status(500).json({ message: "Error generating bill" });
  }
};