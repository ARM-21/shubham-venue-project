import { success } from "../../utils/http.utils.js";
import {
  createReview,
  getHallReviews,
  updateReview,
  deleteReview,
  getReviewStats,
  approveReview,
  rejectReview,
} from "../../services/review/review.service.js";

export const createReviewHandler = async (req, res, next) => {
  try {
    const { hallId } = req.params;
    const userId = req.currentUser._id; // From auth middleware
    const { rating, title, comment, bookingId, aspects, images } = req.body;

    if (!rating || !title || !comment) {
      return res.status(400).json({
        error: "rating, title, and comment are required",
      });
    }

    const review = await createReview({
      hallId,
      userId,
      bookingId,
      rating,
      title,
      comment,
      aspects,
      images,
    });

    return success(res, { review }, "Review submitted successfully", 201);
  } catch (err) {
    return next(err);
  }
};

export const getHallReviewsHandler = async (req, res, next) => {
  try {
    const { hallId } = req.params;
    const { page, limit, minRating, status } = req.query;

    const result = await getHallReviews(hallId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      minRating: minRating ? parseInt(minRating) : null,
      status: status || null,
    });

    return success(res, result, "Reviews retrieved successfully");
  } catch (err) {
    return next(err);
  }
};

export const getReviewStatsHandler = async (req, res, next) => {
  try {
    const { hallId } = req.params;
    const stats = await getReviewStats(hallId);

    return success(res, { stats }, "Review stats retrieved successfully");
  } catch (err) {
    return next(err);
  }
};

export const updateReviewHandler = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.currentUser._id;
    const { rating, title, comment, aspects } = req.body;

    const review = await updateReview(reviewId, userId, {
      rating,
      title,
      comment,
      aspects,
    });

    return success(res, { review }, "Review updated successfully");
  } catch (err) {
    return next(err);
  }
};

export const deleteReviewHandler = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.currentUser._id;

    const result = await deleteReview(reviewId, userId);
    return success(res, result, "Review deleted successfully");
  } catch (err) {
    return next(err);
  }
};

// Admin handlers
export const approveReviewHandler = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const review = await approveReview(reviewId);

    return success(res, { review }, "Review approved");
  } catch (err) {
    return next(err);
  }
};

export const rejectReviewHandler = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { adminNotes } = req.body;
    const review = await rejectReview(reviewId, adminNotes);

    return success(res, { review }, "Review rejected");
  } catch (err) {
    return next(err);
  }
};
