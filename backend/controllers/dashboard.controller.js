const pool = require('../config/db');
exports.getDashboardStats = async (req, res) => {
  try {
    const { range, startDate, endDate } = req.query;

    let dateFilter = "";

    if (range === "today") {
      dateFilter = `AND DATE(checked_out_at) = CURDATE()`;
    } else if (range === "week") {
      dateFilter = `AND YEARWEEK(checked_out_at, 1) = YEARWEEK(CURDATE(), 1)`;
    } else if (range === "month") {
      dateFilter = `AND MONTH(checked_out_at) = MONTH(CURDATE()) 
                    AND YEAR(checked_out_at) = YEAR(CURDATE())`;
    } else if (startDate && endDate) {
      dateFilter = `AND DATE(checked_out_at) BETWEEN '${startDate}' AND '${endDate}'`;
    }

    const connection = await pool.getConnection();

    const [stats] = await connection.query(
      `SELECT
        (SELECT COUNT(*) FROM rooms) as total_rooms,
        (SELECT COUNT(*) FROM rooms WHERE status = 'available') as available_rooms,
        (SELECT COUNT(*) FROM rooms WHERE status = 'booked') as booked_rooms,
        (SELECT COALESCE(SUM(total_amount), 0)
          FROM bookings
          WHERE status = 'checked_out'
          AND payment_status = 'completed'
          ${dateFilter}
        ) as total_revenue`,
    );

    connection.release();

    const dashboardData = stats[0];

    res.status(200).json({
      message: "Dashboard statistics retrieved successfully",
      data: {
        totalRooms: dashboardData.total_rooms,
        availableRooms: dashboardData.available_rooms,
        bookedRooms: dashboardData.booked_rooms,
        totalRevenue: dashboardData.total_revenue,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
