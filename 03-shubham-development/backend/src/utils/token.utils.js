import crypto from "crypto";

/**
 * Hash a token using SHA256
 * Used for audit logging - stores hash instead of plaintext QR code
 * @param {string} token - Raw token/QR code
 * @returns {string} - Hashed token
 */
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
