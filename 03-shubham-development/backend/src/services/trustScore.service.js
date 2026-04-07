import User from "../models/User.js";
import OrganizerEvent from "../models/OrganizerEvent.js";
import Flag from "../models/Flag.js";

/**
 * Pure trust score calculation (no DB calls)
 * Can be used in metrics service and elsewhere
 */
export function calculateTrustScoreFromMetrics(metrics) {
  // 1. Approval Rate (30%)
  const approvalRate =
    metrics.eventsCreated > 0
      ? (metrics.eventsApproved / metrics.eventsCreated) * 0.3
      : 0.3; // Give credit for trying

  // 2. Event Activity (25%) - reward creating events
  const eventActivityScore = Math.min(metrics.eventsCreated / 10, 0.5);

  // 3. Flag History (25%)
  const flagPenalty = Math.min(metrics.currentFlags / 3, 1);
  const flagFactor = (1 - flagPenalty) * 0.25;

  // 4. User Ratings (15%)
  const ratingFactor = (metrics.averageRating / 5) * 0.15;

  // 5. Suspension History (5%)
  const suspensionPenalty = Math.min((metrics.suspensionCount || 0) * 0.25, 1);
  const suspensionFactor = (1 - suspensionPenalty) * 0.05;

  // Total: 0.3 baseline + active components
  let trustScore = approvalRate + eventActivityScore + flagFactor + ratingFactor + suspensionFactor;
  trustScore = trustScore * 3 + 1; // Scale to 1-5
  trustScore = Math.max(1, Math.min(5, parseFloat(trustScore.toFixed(1))));

  return trustScore;
}

/**
 * Calculate trust score for organizer (1-5 scale)
 */
export async function calculateTrustScore(organizerId) {
  try {
    const organizer = await User.findById(organizerId).select("trustMetrics");

    if (!organizer) return 3; // default neutral

    const metrics = organizer.trustMetrics || {};
    const trustScore = calculateTrustScoreFromMetrics(metrics);
    const requiresApproval = trustScore < 4; // Low trust needs admin approval

    return {
      trustScore,
      requiresApproval,
      breakdown: {
        approvalRate: parseFloat(((metrics.eventsCreated > 0 ? (metrics.eventsApproved / metrics.eventsCreated) * 0.3 : 0.3).toFixed(2))),
        eventActivity: parseFloat(Math.min(metrics.eventsCreated / 10, 0.5).toFixed(2)),
        flagFactor: parseFloat(((1 - Math.min(metrics.currentFlags / 3, 1)) * 0.25).toFixed(2)),
        ratingFactor: parseFloat(((metrics.averageRating / 5) * 0.15).toFixed(2)),
        suspensionFactor: parseFloat(((1 - Math.min((metrics.suspensionCount || 0) * 0.25, 1)) * 0.05).toFixed(2)),
      },
    };
  } catch (error) {
    console.error("Error calculating trust score:", error);
    return { trustScore: 3, requiresApproval: true };
  }
}

/**
 * Update organizer trust score in database
 */
export async function updateTrustScore(organizerId) {
  try {
    const calculation = await calculateTrustScore(organizerId);

    await User.findByIdAndUpdate(
      organizerId,
      {
        "trustMetrics.trustScore": calculation.trustScore,
        "trustMetrics.requiresApproval": calculation.requiresApproval,
        "trustMetrics.lastUpdatedAt": new Date(),
      },
      { new: true }
    );

    return calculation;
  } catch (error) {
    console.error("Error updating trust score:", error);
  }
}

/**
 * Increment event created count
 */
export async function onEventCreated(organizerId) {
  await User.findByIdAndUpdate(organizerId, {
    $inc: { "trustMetrics.eventsCreated": 1 },
  });
  return updateTrustScore(organizerId);
}

/**
 * Increment event approved count
 */
export async function onEventApproved(organizerId) {
  await User.findByIdAndUpdate(organizerId, {
    $inc: { "trustMetrics.eventsApproved": 1 },
  });
  return updateTrustScore(organizerId);
}

/**
 * Increment flag count
 */
export async function onEventFlagged(organizerId) {
  await User.findByIdAndUpdate(organizerId, {
    $inc: { "trustMetrics.currentFlags": 1 },
  });
  return updateTrustScore(organizerId);
}

/**
 * Decrement flag count (when flag is resolved/dismissed)
 */
export async function onFlagResolved(organizerId, resolution) {
  const updates = { $inc: { "trustMetrics.currentFlags": -1 } };

  // If warning or dismissed, increment resolved count
  if (resolution === "warning" || resolution === "dismissed") {
    updates.$inc["trustMetrics.resolvedFlags"] = 1;
  }

  await User.findByIdAndUpdate(organizerId, updates);
  return updateTrustScore(organizerId);
}

/**
 * Handle organizer suspension
 */
export async function suspendOrganizer(
  organizerId,
  reason,
  durationDays = null
) {
  const suspensionEndDate = durationDays
    ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
    : null;

  const organizer = await User.findByIdAndUpdate(
    organizerId,
    {
      suspensionStatus: durationDays ? "temporary" : "permanent",
      suspendedAt: new Date(),
      suspensionReason: reason,
      suspensionEndDate,
      $inc: { "trustMetrics.suspensionCount": 1 },
      $push: {
        suspensionHistory: {
          suspendedAt: new Date(),
          suspendedUntil: suspensionEndDate,
          reason,
        },
      },
    },
    { new: true }
  );

  // Suspend all active events by this organizer
  await OrganizerEvent.updateMany(
    {
      organizerId,
      status: "PUBLISHED",
    },
    {
      status: "SUSPENDED",
      suspendedAt: new Date(),
      suspensionReason: `Organizer suspended: ${reason}`,
      suspensionEndDate,
    }
  );

  await updateTrustScore(organizerId);
  return organizer;
}

/**
 * Lift organizer suspension
 */
export async function liftSuspension(organizerId, liftedBy) {
  const organizer = await User.findByIdAndUpdate(
    organizerId,
    {
      suspensionStatus: "none",
      $set: {
        "suspensionHistory.$[elem].liftedAt": new Date(),
        "suspensionHistory.$[elem].liftedBy": liftedBy,
      },
    },
    {
      new: true,
      arrayFilters: [{ "elem.liftedAt": { $exists: false } }],
    }
  );

  // Restore events if temporary suspension ended
  await OrganizerEvent.updateMany(
    {
      organizerId,
      status: "SUSPENDED",
      suspensionEndDate: { $lt: new Date() },
    },
    {
      status: "PUBLISHED",
      suspensionReason: null,
      suspensionEndDate: null,
    }
  );

  await updateTrustScore(organizerId);
  return organizer;
}

/**
 * Get organizer reputation dashboard
 */
export async function getOrganizerReputation(organizerId) {
  const organizer = await User.findById(organizerId).select(
    "trustMetrics suspensionStatus"
  );

  if (!organizer) return null;

  const flagsData = await Flag.find(
    { organizerId },
    { severity: 1, status: 1, createdAt: 1 }
  );

  const eventsCount = await OrganizerEvent.countDocuments({
    organizerId,
    status: "PUBLISHED",
  });

  const suspendedEventsCount = await OrganizerEvent.countDocuments({
    organizerId,
    status: "SUSPENDED",
  });

  return {
    trustScore: organizer.trustMetrics.trustScore,
    trustBreakdown: organizer.trustMetrics,
    suspensionStatus: organizer.suspensionStatus,
    totalEvents: organizer.trustMetrics.eventsCreated,
    approvedEvents: organizer.trustMetrics.eventsApproved,
    activeEvents: eventsCount,
    suspendedEvents: suspendedEventsCount,
    flags: {
      total: flagsData.length,
      open: flagsData.filter((f) => f.status === "open").length,
      highSeverity: flagsData.filter((f) => f.severity === "high").length,
      critical: flagsData.filter((f) => f.severity === "critical").length,
    },
    suspensionHistory: organizer.suspensionHistory || [],
  };
}
