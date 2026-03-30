const pool = require("../config/db");

// Get all available rooms (Public - No Auth Required)
exports.getAvailableRooms = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [rooms] = await connection.query(
      "SELECT id, room_number, type, price, status FROM rooms WHERE status = ?",
      ["available"],
    );

    connection.release();

    res.status(200).json({
      message: "Available rooms retrieved successfully",
      data: rooms,
    });
  } catch (error) {
    console.error("Get available rooms error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get room details
exports.getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;
    const connection = await pool.getConnection();

    const [rooms] = await connection.query(
      "SELECT id, room_number, type, price, status FROM rooms WHERE id = ?",
      [roomId],
    );

    connection.release();

    if (rooms.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({
      message: "Room details retrieved successfully",
      data: rooms[0],
    });
  } catch (error) {
    console.error("Get room details error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search rooms
exports.searchRooms = async (req, res) => {
  try {
    const { checkIn, checkOut, roomType } = req.query;

    if (!checkIn || !checkOut) {
      return res
        .status(400)
        .json({ message: "Check-in and check-out dates are required" });
    }

    const connection = await pool.getConnection();

    let query = `
      SELECT r.id, r.room_number, r.type, r.price, r.status
      FROM rooms r
      WHERE r.status = 'available'
      AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.room_id = r.id
        AND b.check_in < ?
        AND b.check_out > ?
        AND b.status IN ('reserved', 'checked_in')
      )
    `;

    const params = [checkOut, checkIn];

    if (roomType) {
      query += " AND LOWER(r.type) = LOWER(?)";
      params.push(roomType);
    }

    const [rooms] = await connection.query(query, params);
    connection.release();

    res.status(200).json({
      message: "Rooms searched successfully",
      data: rooms,
    });
  } catch (error) {
    console.error("Search rooms error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
