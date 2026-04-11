import User from "../../models/User.js";
import { sendPushNotification } from "../../services/notification.service.js";

/**
 * Register push token for a user device
 * POST /api/notifications/register-push-token
 */
export const registerPushToken = async (req, res) => {
  try {
    const { pushToken, platform } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!pushToken || !platform) {
      return res.status(400).json({
        success: false,
        message: "Push token and platform are required",
      });
    }

    if (!["ios", "android"].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: "Platform must be 'ios' or 'android'",
      });
    }

    // Update user's push tokens - add new token if not exists
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          pushTokens: {
            token: pushToken,
            platform,
            registeredAt: new Date(),
            isActive: true,
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Push token registered successfully",
      data: {
        pushTokens: user.pushTokens,
      },
    });
  } catch (error) {
    console.error("Error registering push token:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register push token",
      error: error.message,
    });
  }
};

/**
 * Unregister/remove push token
 * POST /api/notifications/unregister-push-token
 */
export const unregisterPushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;
    const userId = req.user.id;

    if (!pushToken) {
      return res.status(400).json({
        success: false,
        message: "Push token is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          pushTokens: { token: pushToken },
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Push token unregistered successfully",
    });
  } catch (error) {
    console.error("Error unregistering push token:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to unregister push token",
      error: error.message,
    });
  }
};

/**
 * Get user's registered push tokens (admin only)
 * GET /api/notifications/push-tokens
 */
export const getPushTokens = async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;

    // Only allow users to view their own tokens, admins can view any
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view these tokens",
      });
    }

    const user = await User.findById(userId).select("pushTokens");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        pushTokens: user.pushTokens,
      },
    });
  } catch (error) {
    console.error("Error fetching push tokens:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch push tokens",
      error: error.message,
    });
  }
};

/**
 * Send test push notification (admin only, for testing)
 * POST /api/notifications/send-test
 */
export const sendTestNotification = async (req, res) => {
  try {
    const { userId, title, body } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: "userId, title, and body are required",
      });
    }

    const user = await User.findById(userId);

    if (!user || !user.pushTokens || user.pushTokens.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found or has no registered push tokens",
      });
    }

    // Send to all active tokens
    const activeTokens = user.pushTokens
      .filter((t) => t.isActive)
      .map((t) => t.token);

    if (activeTokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User has no active push tokens",
      });
    }

    const payload = {
      title,
      body,
      data: {
        type: "test_notification",
      },
    };

    await Promise.all(
      activeTokens.map((token) => sendPushNotification(token, payload))
    );

    return res.status(200).json({
      success: true,
      message: `Test notification sent to ${activeTokens.length} device(s)`,
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send test notification",
      error: error.message,
    });
  }
};
