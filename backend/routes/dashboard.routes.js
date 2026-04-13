const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/stats",
  authMiddleware(["admin", "staff"]),
  dashboardController.getDashboardStats,
);

module.exports = router;
