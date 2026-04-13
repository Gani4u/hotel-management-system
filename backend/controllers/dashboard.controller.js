const pool = require("../config/db");

exports.getDashboardStats = async (req, res) => {
  try {
    const { range, startDate, endDate } = req.query;

    let dateFilter = "";
    const params = [];

    if (range === "today") {
      dateFilter = "AND DATE(check_out) = CURDATE()";
    } else if (range === "week") {
      dateFilter = "AND YEARWEEK(check_out, 1) = YEARWEEK(CURDATE(), 1)";
    } else if (range === "month") {
      dateFilter =
        "AND MONTH(check_out) = MONTH(CURDATE()) AND YEAR(check_out) = YEAR(CURDATE())";
    } else if (startDate && endDate) {
      dateFilter = "AND DATE(check_out) BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const connection = await pool.getConnection();

    const [stats] = await connection.query(
      `SELECT
        (SELECT COUNT(*) FROM rooms) as totalRooms,
        (SELECT COUNT(*) FROM rooms WHERE status = 'available') as availableRooms,
        (SELECT COUNT(*) FROM rooms WHERE status = 'booked') as bookedRooms,
        (SELECT COALESCE(SUM(total_amount), 0)
          FROM bookings
          WHERE status = 'checked_out'
          ${dateFilter}
        ) as totalRevenue`,
      params,
    );

    connection.release();

    return res.status(200).json({
      message: "Dashboard statistics retrieved successfully",
      data: stats[0],
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
