import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.resolve(process.cwd(),"../", ".env.local"),
  override: false,
})
const ENV = Object.freeze({
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),

  MONGODB_URI: process.env.MONGODB_URI,

  SESSION_SECRET: process.env.SESSION_SECRET,
  SESSION_NAME: process.env.SESSION_NAME || "sid",
  SESSION_TTL_SECONDS: Number(process.env.SESSION_TTL_SECONDS || 1209600),
  SESSION_COOKIE_MAX_AGE_MS: Number(process.env.SESSION_COOKIE_MAX_AGE_MS || 1209600000),
  TRUST_PROXY_HOPS: Number(process.env.TRUST_PROXY_HOPS || 1),

  FRONTEND_ORIGINS: process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || "http://localhost:3000",

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  AWS_S3_AVATAR_FOLDER: process.env.AWS_S3_AVATAR_FOLDER,

  DEFAULT_BRANDING_LOGO_KEY: process.env.DEFAULT_BRANDING_LOGO_KEY,
  DEFAULT_BRANDING_LOGO_URL: process.env.DEFAULT_BRANDING_LOGO_URL,

  KHALTI_SECRET_KEY: process.env.KHALTI_SECRET_KEY,
  KHALTI_RETURN_URL: process.env.KHALTI_RETURN_URL,
  KHALTI_WEBSITE_URL: process.env.KHALTI_WEBSITE_URL,
  KHALTI_TICKET_RETURN_URL: process.env.KHALTI_TICKET_RETURN_URL,

  ESEWA_PRODUCT_CODE: process.env.ESEWA_PRODUCT_CODE,
  ESEWA_SECRET_KEY: process.env.ESEWA_SECRET_KEY,
  ESEWA_INIT_URL: process.env.ESEWA_INIT_URL,
  ESEWA_STATUS_URL: process.env.ESEWA_STATUS_URL,
  ESEWA_BOOKING_SUCCESS_URL: process.env.ESEWA_BOOKING_SUCCESS_URL,
  ESEWA_BOOKING_FAILURE_URL: process.env.ESEWA_BOOKING_FAILURE_URL,
  ESEWA_TICKET_SUCCESS_URL: process.env.ESEWA_TICKET_SUCCESS_URL,
  ESEWA_TICKET_FAILURE_URL: process.env.ESEWA_TICKET_FAILURE_URL,
});

export default ENV;

export function assertEnv() {
  const required = ["MONGODB_URI", "SESSION_SECRET"];
  const missing = required.filter((k) => !ENV[k]);
  if (missing.length) {
    const err = new Error(`Missing required env vars: ${missing.join(", ")}`);
    err.statusCode = 500;
    throw err;
  }
}