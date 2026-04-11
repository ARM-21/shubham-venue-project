import rateLimit from 'express-rate-limit';

/**
 * Rate limiting configuration
 * Uses in-memory store for now (suitable for single server)
 * For production with multiple servers, use Redis store
 */

// General API rate limiter - 100 requests per 15 minutes per IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes.',
  statusCode: 429,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    if (req.path === '/_health') return true;
    return false;
  },
});

// Strict limiter for authentication - 5 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts. Please try again after 15 minutes.',
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests against the limit
});

// Moderate limiter for scanning operations - 200 requests per 15 minutes
export const scannerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for legitimate scanning operations
  message: 'Too many scan requests. Please try again after 15 minutes.',
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for file uploads - 10 uploads per hour
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: 'Too many uploads. Maximum 10 uploads per hour per user.',
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
});

// Payment operations - 20 transactions per hour
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 payment attempts per hour
  message: 'Too many payment attempts. Please try again later.',
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful transactions
});

// Password reset - 3 attempts per hour (very strict)
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit to 3 reset attempts per hour
  message: 'Too many password reset attempts. Please try again after an hour.',
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Enhanced key generator that uses authenticated user ID when available
 * Falls back to IP address for unauthenticated requests
 * This allows the same user to have limits even if they change IPs
 */
export function createAuthAwareKeyGenerator() {
  return (req, res) => {
    // Use user ID if authenticated, otherwise use IP
    if (req.currentUser && req.currentUser._id) {
      return `user:${req.currentUser._id}`;
    }
    return req.ip || req.connection.remoteAddress;
  };
}

/**
 * Create custom rate limiter with authentication awareness
 * Useful for endpoints where you want to track limits per authenticated user
 */
export function createAuthAwareLimiter(windowMs, maxRequests, message) {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message,
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: createAuthAwareKeyGenerator(),
  });
}
