import User from '../models/User.js';
import OrganizerEvent from '../models/OrganizerEvent.js';
import Flag from '../models/Flag.js';
import Review from '../models/Review.js';
import { calculateTrustScoreFromMetrics } from './trustScore.service.js';

/**
 * Recalculate trust metrics from source data
 * This syncs the trustMetrics fields with actual data in the database
 */
export const recalculateOrganizerMetrics = async (organizerId) => {
  try {
    // Count events created by organizer
    const eventsCreated = await OrganizerEvent.countDocuments({
      organizerId,
    });

    // Count approved events
    const eventsApproved = await OrganizerEvent.countDocuments({
      organizerId,
      status: 'published', // or 'PUBLISHED' depending on enum
    });

    // Count active flags
    const currentFlags = await Flag.countDocuments({
      organizerId,
      status: { $in: ['open', 'investigating'] }, // active statuses
    });

    // Count resolved flags
    const resolvedFlags = await Flag.countDocuments({
      organizerId,
      status: { $in: ['resolved', 'dismissed'] }, // closed statuses
    });

    // Get average rating from reviews (if Review model exists)
    let averageRating = 5;
    try {
      const reviewData = await Review.aggregate([
        { $match: { organizerId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]);
      
      if (reviewData.length > 0 && reviewData[0].avgRating) {
        averageRating = Math.round(reviewData[0].avgRating * 10) / 10; // Round to 1 decimal
      }
    } catch (err) {
      // Review model might not exist, use default
      console.log(`Review aggregation skipped for ${organizerId}: ${err.message}`);
    }

    // Update user with recalculated metrics
    const user = await User.findById(organizerId);
    if (!user) {
      throw new Error(`User ${organizerId} not found`);
    }

    // Update metrics
    user.trustMetrics = {
      ...user.trustMetrics,
      eventsCreated,
      eventsApproved,
      currentFlags,
      resolvedFlags,
      averageRating,
      // suspensionCount is NOT recalculated (it's historical)
      lastUpdatedAt: new Date(),
    };

    // Recalculate trust score using imported function
    const trustScore = calculateTrustScoreFromMetrics(user.trustMetrics);
    user.trustMetrics.trustScore = trustScore;
    user.trustMetrics.requiresApproval = trustScore < 3.5;

    await user.save();

    return user.trustMetrics;
  } catch (err) {
    console.error(`Error recalculating metrics for ${organizerId}:`, err);
    throw err;
  }
};

/**
 * Recalculate metrics for all organizers
 */
export const recalculateAllOrganizerMetrics = async () => {
  try {
    const organizers = await User.find({ isOrganizerEligible: true }).select('_id');

    console.log(`Starting metric recalculation for ${organizers.length} organizers...`);

    let succeeded = 0;
    let failed = 0;

    for (const organizer of organizers) {
      try {
        await recalculateOrganizerMetrics(organizer._id);
        succeeded++;
      } catch (err) {
        console.error(`Failed for ${organizer._id}:`, err.message);
        failed++;
      }
    }

    console.log(`Metric recalculation complete. Success: ${succeeded}, Failed: ${failed}`);
    return { succeeded, failed, total: organizers.length };
  } catch (err) {
    console.error('Error in recalculateAllOrganizerMetrics:', err);
    throw err;
  }
};
