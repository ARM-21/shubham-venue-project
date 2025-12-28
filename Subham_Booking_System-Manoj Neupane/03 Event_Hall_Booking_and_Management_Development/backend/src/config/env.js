import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.resolve(process.cwd(),"../", ".env.local"),
  override: false,
})
export const ENV = Object.freeze({
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),

  MONGODB_URI: process.env.MONGODB_URI,

  SESSION_SECRET: process.env.SESSION_SECRET,
  SESSION_NAME: process.env.SESSION_NAME || "sid",

  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || "http://localhost:3000",

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
});

export function assertEnv() {
  const required = ["MONGODB_URI", "SESSION_SECRET"];
  const missing = required.filter((k) => !ENV[k]);
  if (missing.length) {
    const err = new Error(`Missing required env vars: ${missing.join(", ")}`);
    err.statusCode = 500;
    throw err;
  }
}