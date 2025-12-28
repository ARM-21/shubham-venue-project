import User from "../../models/User.js";

export async function registerLocalUser({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }

  const username = normalizedEmail.split("@")[0];
  const newUser = new User({ username, email: normalizedEmail, password });
  await newUser.save();

  return { id: newUser._id, email: newUser.email, username: newUser.username };
}

export async function loginLocalUser({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  if (user.provider !== "local" && user.googleId) {
    const err = new Error(`Please login using ${user.provider}`);
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  return user;
}