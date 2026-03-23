import Review from "../../models/Review.js";
import Hall from "../../models/Hall.js";
import Booking from "../../models/Booking.js";
import mongoose from "mongoose";

export const createReview = async (reviewData) => {
  try {
    const { hallId, userId, bookingId, rating, title, comment, aspects, images } = reviewData;

    // Check if user already reviewed this venue
    const existingReview = await Review.findOne({ hallId, userId });
    if (existingReview) {
      throw new Error("You have already reviewed this venue");
    }

    // Verify booking exists and belongs to user (for verified review)
    let isVerified = false;
    if (bookingId) {
      const booking = await Booking.findOne({
        _id: bookingId,
        userId,
        hallId,
      });
      isVerified = !!booking;
    }

    const review = new Review({
      hallId,
      userId,
      bookingId,
      rating,
      title,
      comment,
      aspects,
      images,
      isVerified,
      status: "pending", // Admin approval required
    });

    await review.save();
    await review.populate("userId", "firstName lastName profileImage");

    // Update hall average rating
    await updateHallRating(hallId);

    return review;
  } catch (error) {
    throw error;
  }
};

export const getHallReviews = async (hallId, filters = {}) => {
  try {
    const query = { hallId };

    // Filter by status
    if (filters.status) {
      query.status = filters.status;
    } else {
      query.status = "approved"; // Default: show only approved
    }

    // Filter by rating
    if (filters.minRating) {
      query.rating = { $gte: filters.minRating };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .populate("userId", "firstName lastName profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

export const updateReview = async (reviewId, userId, updateData) => {
  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error("Review not found");
    }

    // Only allow user to edit their own review
    if (review.userId.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    // Update allowed fields
    if (updateData.rating !== undefined) review.rating = updateData.rating;
    if (updateData.title !== undefined) review.title = updateData.title;
    if (updateData.comment !== undefined) review.comment = updateData.comment;
    if (updateData.aspects !== undefined) review.aspects = updateData.aspects;

    await review.save();
    await updateHallRating(review.hallId);

    return review;
  } catch (error) {
    throw error;
  }
};

export const deleteReview = async (reviewId, userId) => {
  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error("Review not found");
    }

    // Only allow user or admin to delete
    if (review.userId.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    const hallId = review.hallId;
    await Review.findByIdAndDelete(reviewId);
    await updateHallRating(hallId);

    return { message: "Review deleted successfully" };
  } catch (error) {
    throw error;
  }
};

export const getReviewStats = async (hallId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { hallId: new mongoose.Types.ObjectId(hallId), status: "approved" } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    if (!stats.length) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const data = stats[0];
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    data.ratingDistribution.forEach((rating) => {
      ratingBreakdown[rating]++;
    });

    return {
      averageRating: parseFloat(data.averageRating.toFixed(2)),
      totalReviews: data.totalReviews,
      ratingBreakdown,
    };
  } catch (error) {
    throw error;
  }
};

export const updateHallRating = async (hallId) => {
  try {
    const stats = await getReviewStats(hallId);
    
    await Hall.findByIdAndUpdate(hallId, {
      $set: {
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
      },
    });
  } catch (error) {
    console.error("Error updating hall rating:", error);
  }
};

// Admin functions
export const approveReview = async (reviewId) => {
  try {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status: "approved" },
      { new: true }
    );
    await updateHallRating(review.hallId);
    return review;
  } catch (error) {
    throw error;
  }
};

export const rejectReview = async (reviewId, adminNotes) => {
  try {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status: "rejected", adminNotes },
      { new: true }
    );
    return review;
  } catch (error) {
    throw error;
  }
};
