import { 
  registerWithOTP, 
  verifyOTP, 
  resendOTP, 
  loginLocalUser, 
  formatUserResponse 
} from "../../services/auth/auth.service.js";
import { sendWelcomeEmail } from "../../services/email/email.service.js";
import { httpError } from "../../utils/http.utils.js";
import { success } from "../../utils/http.utils.js";

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

    if (req.session.userId != user._id) {
      req.session.userId = user._id;
      req.session.role = user.role;
      req.session.save();
    }

    const userData = formatUserResponse(user);

    return success(res, userData, "Login successful", 200);
  } catch (err) {
    return next(err);
  }
};

// Logout user
export const logoutController = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) return next(httpError(500, "Could not log out user"));
      res.clearCookie("shubham.sid");
      return success(res, {}, "User logged out", 200);
    });
  } catch (err) {
    return next(err);
  }
};
