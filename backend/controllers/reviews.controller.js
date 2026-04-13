const pool = require("../config/db");

exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId, rating, title, reviewText } = req.body;

    if (!bookingId || !rating || !reviewText?.trim()) {
      return res.status(400).json({
        message: "Booking, rating and review text are required",
      });
    }

    const numericRating = Number(rating);

    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const connection = await pool.getConnection();

    try {
      const [bookings] = await connection.query(
        `
        SELECT b.id, b.user_id, b.room_id, b.status, r.room_number, r.type
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        WHERE b.id = ? AND b.user_id = ?
        `,
        [bookingId, userId],
      );

      if (bookings.length === 0) {
        connection.release();
        return res.status(404).json({ message: "Booking not found" });
      }

      const booking = bookings[0];

      if (booking.status !== "checked_out") {
        connection.release();
        return res.status(400).json({
          message: "You can rate a stay only after check-out",
        });
      }

      const [existing] = await connection.query(
        "SELECT id FROM reviews WHERE booking_id = ?",
        [bookingId],
      );

      if (existing.length > 0) {
        connection.release();
        return res.status(409).json({
          message: "You have already reviewed this booking",
        });
      }

      const [result] = await connection.query(
        `
        INSERT INTO reviews
        (booking_id, user_id, room_id, rating, title, review_text, is_approved, is_featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          bookingId,
          userId,
          booking.room_id,
          numericRating,
          title?.trim() || null,
          reviewText.trim(),
          1,
          0,
        ],
      );

      connection.release();

      return res.status(201).json({
        message: "Review submitted successfully",
        reviewId: result.insertId,
      });
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAdminReviews = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [reviews] = await connection.query(`
      SELECT
        rv.id,
        rv.booking_id,
        rv.user_id,
        rv.room_id,
        rv.rating,
        rv.title,
        rv.review_text,
        rv.is_approved,
        rv.is_featured,
        rv.created_at,
        u.name AS customer_name,
        u.email AS customer_email,
        r.room_number,
        r.type AS room_type
      FROM reviews rv
      JOIN users u ON rv.user_id = u.id
      JOIN rooms r ON rv.room_id = r.id
      ORDER BY rv.created_at DESC
    `);

    connection.release();

    return res.status(200).json({
      message: "Reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    console.error("Get admin reviews error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPublicReviews = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 6, 20);
    const connection = await pool.getConnection();

    const [reviews] = await connection.query(
      `
      SELECT
        rv.id,
        rv.rating,
        rv.title,
        rv.review_text,
        rv.is_featured,
        rv.created_at,
        u.name,
        r.room_number,
        r.type AS room_type
      FROM reviews rv
      JOIN users u ON rv.user_id = u.id
      JOIN rooms r ON rv.room_id = r.id
      WHERE rv.is_approved = 1
      ORDER BY rv.is_featured DESC, rv.created_at DESC
      LIMIT ?
      `,
      [limit],
    );

    const [statsRows] = await connection.query(`
      SELECT
        COUNT(*) AS total_reviews,
        ROUND(AVG(rating), 1) AS average_rating
      FROM reviews
      WHERE is_approved = 1
    `);

    connection.release();

    return res.status(200).json({
      message: "Public reviews fetched successfully",
      data: reviews,
      stats: statsRows[0] || { total_reviews: 0, average_rating: 0 },
    });
  } catch (error) {
    console.error("Get public reviews error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateReviewFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const connection = await pool.getConnection();

    const [result] = await connection.query(
      "UPDATE reviews SET is_featured = ? WHERE id = ?",
      [isFeatured ? 1 : 0, id],
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({
      message: `Review ${isFeatured ? "featured" : "unfeatured"} successfully`,
    });
  } catch (error) {
    console.error("Update review feature error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateReviewApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const connection = await pool.getConnection();

    const [result] = await connection.query(
      "UPDATE reviews SET is_approved = ? WHERE id = ?",
      [isApproved ? 1 : 0, id],
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({
      message: `Review ${isApproved ? "approved" : "hidden"} successfully`,
    });
  } catch (error) {
    console.error("Update review approval error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
