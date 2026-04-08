import User from "../../models/User.js";
import OTP from "../../models/OTP.js";
import { httpError } from "../../utils/http.utils.js";
import crypto from "crypto";
import { sendOTPEmail } from "../email/email.service.js";

export const generateOTP = async (userId, email) => {
  await OTP.updateMany(
    { userId, isUsed: false },
    { isUsed: true }
  );

  // Generate 6-digit OTP
  const otpCode = crypto.randomInt(100000, 999999).toString();

  await OTP.create({
    userId,
    email,
    code: otpCode
  });

  return otpCode;
};

// Register user and send OTP
export const registerWithOTP = async (userData) => {
  const { email, password } = userData;
  const username = email.split('@')[0];

  // Check if user already exists and is verified
  const existingUser = await User.findOne({ 
    $or: [{ email }, { username }] 
  });
  
  if (existingUser && existingUser.isVerified) {
    throw httpError(400, "User already exists with this email or username");
  }

  // Create or update unverified user
  let user = existingUser;
  if (!user) {
    user = await User.create({
      email,
      username,
      password,
      isVerified: false,
      provider: 'local'
    });
  }

  // Generate and send OTP
  const otpCode = await generateOTP(user._id, user.email);

  // Send OTP via email
  await sendOTPEmail(email, otpCode, username);
  console.log(`OTP for ${email}: ${otpCode}`); 

  return {
    userId: user._id,
    email: user.email,
    username: user.username
  };
};

// Verify OTP and activate user account
export const verifyOTP = async (userId, code) => {
  // Find latest unused OTP for this user
  const otpRecord = await OTP.findOne({
    userId,
    isUsed: false
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw httpError(400, "OTP expired or invalid. Please request a new one");
  }

  // Check attempt limit (prevent brute force)
  if (otpRecord.attempts >= 5) {
    await OTP.updateOne({ _id: otpRecord._id }, { isUsed: true });
    throw httpError(429, "Too many failed attempts. Please request a new OTP");
  }

  // Verify OTP
  const isValid = await otpRecord.verifyCode(code);
  
  if (!isValid) {
    // Increment attempts
    otpRecord.attempts += 1;
    await otpRecord.save();
    
    const remainingAttempts = 5 - otpRecord.attempts;
    throw httpError(400, `Invalid OTP. ${remainingAttempts} attempt(s) remaining`);
  }

  // Mark OTP as used
  otpRecord.isUsed = true;
  await otpRecord.save();

  // Update user as verified
  const user = await User.findByIdAndUpdate(
    userId,
    { 
      isVerified: true,
      verifiedAt: new Date()
    },
    { new: true }
  ).select('-password');

  if (!user) {
    throw httpError(404, "User not found");
  }

  return user;
};

// Resend OTP with rate limiting
export const resendOTP = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw httpError(404, "User not found");
  }

  if (user.isVerified) {
    throw httpError(400, "User is already verified");
  }

  // Check if recent OTP exists (rate limiting - 30 seconds)
  const recentOTP = await OTP.findOne({
    userId,
    createdAt: { $gt: new Date(Date.now() - 30000) }
  });

  if (recentOTP) {
    throw httpError(429, "Please wait 30 seconds before requesting a new OTP");
  }

  // Generate and send new OTP
  const otpCode = await generateOTP(user._id, user.email);

  // Send OTP via email
  await sendOTPEmail(user.email, otpCode, user.username);
  console.log(`New OTP for ${user.email}: ${otpCode}`); // Remove in production!

  return {
    email: user.email,
    username: user.username
  };
};

// Login user (only verified users)
export const loginLocalUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    throw httpError(401, "Invalid email or password");
  }

  // Check if user is a Google OAuth user trying to login with password
  if (user.provider === 'google') {
    throw httpError(400, "This account is registered with Google. Please use Google login instead");
  }

  // Block disabled accounts
  if (user.isActive === false) {
    throw httpError(403, "Account disabled. Contact support");
  }

  // Check if user is verified
  if (!user.isVerified) {
    throw httpError(403, "Please verify your email before logging in");
  }

  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    throw httpError(401, "Invalid email or password");
  }

  // Return user without password
  const userObject = user.toObject();
  delete userObject.password;
  
  return userObject;
};

// Format user response
export const formatUserResponse = (user) => {
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name,
    profilePicture: user.profilePicture,
    username: user.username,
    isVerified: user.isVerified,
    hasCompletedOnboarding: user.hasCompletedOnboarding || false,
    isOrganizerEligible: user.isOrganizerEligible || false,
    provider: user.provider || 'local'
  };
};
