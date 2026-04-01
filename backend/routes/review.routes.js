const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviews.controller");
const authMiddleware = require("../middleware/auth.middleware");

// public
router.get("/public", reviewController.getPublicReviews);

// customer
router.post("/", authMiddleware(["customer"]), reviewController.createReview);

// admin / staff
router.get(
  "/admin",
  authMiddleware(["admin", "staff"]),
  reviewController.getAdminReviews,
);

router.patch(
  "/:id/feature",
  authMiddleware(["admin", "staff"]),
  reviewController.updateReviewFeature,
);

router.patch(
  "/:id/approval",
  authMiddleware(["admin", "staff"]),
  reviewController.updateReviewApproval,
);

module.exports = router;
