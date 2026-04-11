import User from "../models/User.js";
import { sendStaffAssignmentEmail, sendStaffAssignmentCancelledEmail } from "./email/email.service.js";
import axios from "axios";

const EXPO_PUSH_API = "https://exp.host/--/api/v2/push/send";

/**
 * Send push notification via Expo
 * @param {string} pushToken - Device push token from Expo
 * @param {object} payload - Notification payload {title, body, data}
 */
export const sendPushNotification = async (pushToken, payload) => {
  try {
    // Validate token format (Expo tokens start with ExponentPushToken)
    if (!pushToken || !pushToken.startsWith("ExponentPushToken")) {
      console.warn(`Invalid push token format: ${pushToken}`);
      return { success: false, error: "Invalid token format" };
    }

    const message = {
      to: pushToken,
      sound: "default",
      title: payload.title || "New Notification",
      body: payload.body || "",
      data: payload.data || {},
      badge: 1,
      priority: "high",
    };

    const response = await axios.post(EXPO_PUSH_API, message);

    if (response.data.errors) {
      console.error("Expo push error:", response.data.errors);
      return { success: false, error: response.data.errors };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error sending push notification:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send push to multiple users
 * @param {array} userIds - Array of user IDs
 * @param {object} payload - Notification payload
 */
export const sendBulkPushNotifications = async (userIds, payload) => {
  try {
    const users = await User.find({ _id: { $in: userIds } }).select("pushTokens");

    const results = [];

    for (const user of users) {
      if (user.pushTokens && user.pushTokens.length > 0) {
        const activeTokens = user.pushTokens.filter((t) => t.isActive).map((t) => t.token);

        for (const token of activeTokens) {
          const result = await sendPushNotification(token, payload);
          results.push({ userId: user._id, token, result });
        }
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error("Error sending bulk push notifications:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Notify staff member when assigned to event scanner
 * @param {object} user - Staff user object
 * @param {object} event - Event object
 * @param {string} gate - Gate/location assigned
 */
export const notifyStaffAssignment = async (user, event, gate) => {
  try {
    console.log('Notifying staff assignment:', {
      userId: user._id,
      userEmail: user.email,
      eventId: event._id,
      eventName: event.name,
      hasEmail: !!user.email,
      hasPushTokens: user.pushTokens?.length > 0,
      activePushTokens: user.pushTokens?.filter(t => t.isActive)?.length || 0,
    });
    
    // Send email (non-blocking)
    try {
      console.log('Sending assignment email to:', user.email);
      await sendStaffAssignmentEmail(user, event, gate);
      console.log('Assignment email sent successfully');
    } catch (emailError) {
      console.error("Failed to send assignment email:", emailError.message);
      // Don't fail the assignment if email fails
    }

    // Send push notification to staff (non-blocking)
    try {
      if (user.pushTokens && user.pushTokens.length > 0) {
        const activeTokens = user.pushTokens.filter((t) => t.isActive);
        console.log(`Sending push notifications to ${activeTokens.length} active device(s)`);

        for (const tokenObj of activeTokens) {
          console.log(`Sending push to token: ${tokenObj.token.substring(0, 20)}...`);
          const result = await sendPushNotification(tokenObj.token, {
            title: "New Scanner Assignment",
            body: `You've been assigned to "${event.name}" at Gate ${gate}`,
            data: {
              type: "staff_assignment",
              eventId: event._id.toString(),
              eventName: event.name,
              gate,
              date: event.eventDate,
              time: event.startTime,
            },
          });
          console.log(`Push notification result:`, result);
        }
      } else {
        console.warn('No active push tokens found for user:', user._id);
      }
    } catch (pushError) {
      console.error("Failed to send push notification:", pushError.message);
      // Don't fail the assignment if push notification fails
    }

    return { success: true };
  } catch (error) {
    console.error("Error in notifyStaffAssignment:", error);
    // Return success anyway - assignment should not fail due to notifications
    return { success: true, warning: error.message };
  }
};

/**
 * Notify staff when assignment is cancelled
 * @param {object} user - Staff user object
 * @param {object} event - Event object
 * @param {string} reason - Cancellation reason
 */
export const notifyAssignmentCancelled = async (user, event, reason = "") => {
  try {
    // Send email (non-blocking)
    try {
      await sendStaffAssignmentCancelledEmail(user, event, reason);
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError.message);
      // Don't fail if email fails
    }

    // Send push notification (non-blocking)
    try {
      if (user.pushTokens && user.pushTokens.length > 0) {
        const activeTokens = user.pushTokens.filter((t) => t.isActive);

        for (const tokenObj of activeTokens) {
          await sendPushNotification(tokenObj.token, {
            title: "Assignment Cancelled",
            body: `Your assignment for "${event.name}" has been cancelled${reason ? ": " + reason : ""}`,
            data: {
              type: "staff_assignment_cancelled",
              eventId: event._id.toString(),
              eventName: event.name,
            },
          });
        }
      }
    } catch (pushError) {
      console.error("Failed to send cancellation push notification:", pushError.message);
      // Don't fail if push fails
    }

    return { success: true };
  } catch (error) {
    console.error("Error in notifyAssignmentCancelled:", error);
    // Return success anyway - cancellation should not fail due to notifications
    return { success: true, warning: error.message };
  }
};
