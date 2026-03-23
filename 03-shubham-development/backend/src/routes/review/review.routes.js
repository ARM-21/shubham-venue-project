import express from "express";
import {
  createReviewHandler,
  getHallReviewsHandler,
  getReviewStatsHandler,
  updateReviewHandler,
  deleteReviewHandler,
  approveReviewHandler,
  rejectReviewHandler,
} from "../../controllers/review/review.controller.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Public routes - MORE SPECIFIC ROUTES FIRST
router.get("/:hallId/stats", getReviewStatsHandler);
router.get("/:hallId", getHallReviewsHandler);

// Protected routes (require auth)
router.post("/:hallId", isAuthenticated, createReviewHandler); // User creates review
router.put("/:reviewId", isAuthenticated, updateReviewHandler); // User updates their review
router.delete("/:reviewId", isAuthenticated, deleteReviewHandler); // User deletes their review

// Admin routes
router.patch("/:reviewId/approve", approveReviewHandler);
router.patch("/:reviewId/reject", rejectReviewHandler);

export default router;
