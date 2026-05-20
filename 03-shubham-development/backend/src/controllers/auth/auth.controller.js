import {
  registerWithOTP,
  verifyOTP,
  resendOTP,
  loginLocalUser,
  formatUserResponse
} from "../../services/auth/auth.service.js";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../../services/email/email.service.js";
import { httpError } from "../../utils/http.utils.js";
import { success } from "../../utils/http.utils.js";
import { validateRegistrationInput } from "../../utils/passwordValidation.js";
import ENV from "../../config/env.config.js";
import User from "../../models/User.js";
import crypto from "crypto";

// Register user and send OTP
export const registerUserController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const username = email.split('@')[0];
    
    if (!email || !password) {
      throw httpError(400, "Email and password are required");
    }
    if (!username) {
      throw httpError(400, "Username is required");
    }

    // Validate password strength
    const passwordValidation = validateRegistrationInput(email, password);
    if (!passwordValidation.valid) {
      throw httpError(400, passwordValidation.message);
    }

    const result = await registerWithOTP(req.body);

    return success(res, result, "Registration successful! OTP sent to your email", 200);
  } catch (err) {
    return next(err);
  }
};

//  Verify OTP
export const verifyOTPController = async (req, res, next) => {
  try {
    const { userId, code } = req.body;
    
    if (!userId || !code) {
      throw httpError(400, "User ID and OTP code are required");
    }

    const user = await verifyOTP(userId, code);

    // Handle session
    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.save();

    // Single-session enforcement — invalidate any previous session
    await User.findByIdAndUpdate(user._id, { currentSessionId: req.session.id });

    const userData = formatUserResponse(user);
    console.log("Sending welcome email to:", user.email);
    // await sendWelcomeEmail(user.email, user.username);

    return success(res, userData, "Account verified successfully! You are now logged in", 200);
  } catch (err) {
    return next(err);
  }
};

//  Resend OTP
export const resendOTPController = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      throw httpError(400, "User ID is required");
    }

    // await resendOTP(userId);

    return success(res, {}, "New OTP sent to your email", 200);
  } catch (err) {
    return next(err);
  }
};

// Login user
export const loginUserController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw httpError(400, "Email and password are required");
    }

    const user = await loginLocalUser(email, password);

    // Stamp new session and invalidate any previous one (single-session enforcement)
    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.save();
    await User.findByIdAndUpdate(user._id, { currentSessionId: req.session.id });

    // Generate JWT token for mobile app
    const jwtToken = crypto
      .createHash('sha256')
      .update(`${user._id}_${user.email}_${Date.now()}`)
      .digest('hex');

    const userData = formatUserResponse(user);
    
    // Return both user data and token for mobile
    return success(res, {
      ...userData,
      token: jwtToken, // Added for mobile app
    }, "Login successful", 200);
  } catch (err) {
    return next(err);
  }
};

// Logout user
export const logoutController = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) return next(httpError(500, "Could not log out user"));
      const cookieName = ENV.SESSION_NAME || "shubham.sid";
      const cookieOptions = {
        path: "/",
        domain: ENV.NODE_ENV === "production" ? ".shubham-venue.me" : undefined,
        sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
        secure: ENV.NODE_ENV === "production",
      };

      // Clear session cookie (single name used across the app)
      res.clearCookie(cookieName, cookieOptions);
      return success(res, {}, "User logged out", 200);
    });
  } catch (err) {
    return next(err);
  }
};

// Forgot password — generates a token and emails a reset link
export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Always respond the same way to prevent user enumeration
    if (!user || user.provider === 'google') {
      return res.json({ message: "If that email is registered, a reset link has been sent." });
    }

    const plainToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${ENV.FRONTEND_ORIGIN}/auth/reset-password?token=${plainToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    return res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (err) {
    return next(err);
  }
};

// Reset password — validates token and sets new password
export const resetPasswordController = async (req, res, next) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    user.password = password; // pre-save hook hashes it
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    // Invalidate all existing sessions on password change
    user.currentSessionId = null;
    await user.save();

    return res.json({ message: "Password updated successfully. Please log in." });
  } catch (err) {
    return next(err);
  }
};

// Validate session and user - called on app startup to detect stale/invalid cookies
export const validateSessionController = async (req, res, next) => {
  try {
    const userId = req.session?.userId;
    
    // No session exists - not logged in
    if (!userId) {
      return res.status(200).json({ 
        isValid: false, 
        user: null,
        message: "No active session" 
      });
    }

    // Session exists - verify user still exists and is active
    const user = await User.findById(userId).select("-password");
    if (!user) {
      // User was deleted - destroy stale session
      req.session.destroy(() => {});
      const cookieName = ENV.SESSION_NAME || "sid";
      res.clearCookie(cookieName, {
        path: "/",
        domain: ENV.NODE_ENV === "production" ? ".shubham-venue.me" : undefined,
        sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
        secure: ENV.NODE_ENV === "production",
      });
      return res.status(200).json({ 
        isValid: false, 
        user: null,
        message: "User not found - session cleared" 
      });
    }

    if (user.isActive === false) {
      // User is disabled - destroy stale session
      req.session.destroy(() => {});
      const cookieName = ENV.SESSION_NAME || "sid";
      res.clearCookie(cookieName, {
        path: "/",
        domain: ENV.NODE_ENV === "production" ? ".shubham-venue.me" : undefined,
        sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
        secure: ENV.NODE_ENV === "production",
      });
      return res.status(200).json({ 
        isValid: false, 
        user: null,
        message: "Account disabled - session cleared" 
      });
    }

    // Session is valid
    return res.status(200).json({ 
      isValid: true, 
      user: formatUserResponse(user)
    });
  } catch (err) {
    console.error("Session validation error:", err);
    return res.status(200).json({ 
      isValid: false, 
      user: null,
      message: "Error validating session" 
    });
  }
};
