# Rate Limiting Implementation Guide

## What is Rate Limiting?

Rate limiting controls how many requests a client can make to your API within a specific time window. It's a crucial security and performance feature.

### Benefits:

1. **Security**: Prevents brute force attacks (password guessing, spam, DDoS)
2. **Performance**: Protects backend from overload and resource exhaustion
3. **Fair Usage**: Ensures all users get fair access to resources
4. **Cost Control**: Limits API costs (especially important with third-party services like S3)
5. **Data Protection**: Makes it harder for attackers to exploit vulnerabilities through rapid requests

### Real-world analogy:

Think of a restaurant with a reservation system:
- Without rate limiting: Someone can call 1000 times per second to make reservations
- With rate limiting: Each number can call max 5 times per hour

## How it Works

```
Request arrives → Check rate limit store → 
  ✅ Under limit? → Allow request
  ❌ Over limit? → Return 429 (Too Many Requests)
```

### Response Example (Rate Limited):
```
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 5
RateLimit-Remaining: 0
RateLimit-Reset: 1681234567

{"message": "Too many login attempts. Please try again after 15 minutes."}
```

## Rate Limits Implemented

### 1. **General API Limiter** (100 requests/15 min)
- Applied to all `/api/v1/*` routes
- Tracks by IP address
- Purpose: Prevent general abuse

### 2. **Auth Limiter** (5 attempts/15 min, per endpoint)
- Applied to: `/auth/login`, `/auth/register`, `/auth/resend-otp`, `/auth/verify-otp`
- Tracks by IP address
- **skipSuccessfulRequests: true** - Only counts failed attempts
- Purpose: Prevent brute force attacks

### 3. **Scanner Limiter** (200 requests/15 min)
- Applied to: `/scanner/events/:eventId/checkins/scan`
- Tracks by IP address
- Higher limit for legitimate high-volume scanning
- Purpose: Allow rapid scanning during events

### 4. **Upload Limiter** (10 uploads/hour)
- Use case: File upload endpoints
- Purpose: Prevent storage abuse

### 5. **Payment Limiter** (20 attempts/hour)
- Use case: Payment processing endpoints
- Purpose: Prevent transaction fraud

### 6. **Password Reset Limiter** (3 attempts/hour)
- Use case: Password reset endpoints
- Purpose: Prevent account takeover via reset spam

## How to Use

### Apply to a Single Route
```javascript
import { authLimiter } from "../../config/rateLimit.config.js";

router.post("/sensitive-endpoint", authLimiter, async (req, res) => {
  // Handler code
});
```

### Apply Multiple Limiters (Order matters!)
```javascript
router.post("/endpoint", auth, authLimiter, scannerLimiter, handler);
// Auth verification → rate limit → handler
```

### Create Custom Limiter
```javascript
import { createAuthAwareLimiter } from "../../config/rateLimit.config.js";

const customLimiter = createAuthAwareLimiter(
  10 * 60 * 1000,  // 10 minutes
  50,              // 50 requests
  "Too many requests. Try again in 10 minutes."
);

router.post("/custom-endpoint", customLimiter, handler);
```

## Key Configuration Parameters

```javascript
{
  windowMs: 15 * 60 * 1000,        // Time window (15 minutes)
  max: 100,                        // Max requests in window
  message: "Too many requests",    // Error message
  statusCode: 429,                 // HTTP status code
  standardHeaders: true,           // Include RateLimit headers
  legacyHeaders: false,            // Skip X-RateLimit-* headers
  skipSuccessfulRequests: true,    // Don't count successful requests
  skipFailedRequests: false,       // Do count failed requests
  keyGenerator: (req) => req.ip,   // How to identify clients
}
```

## Authentication-Aware Rate Limiting

By default, rate limits are tracked by IP address. For authenticated users, you can track by user ID:

```javascript
const authAwareLimiter = createAuthAwareLimiter(
  15 * 60 * 1000,  // 15 minutes
  100,             // per user
  "Too many requests"
);

router.post("/user-endpoint", isAuthenticated, authAwareLimiter, handler);
```

This allows:
- Same user to have independent limits even if IP changes
- Different IPs from same user count towards same limit
- Unauthenticated requests still tracked by IP

## Best Practices

### 1. Order of Middleware is Important
```javascript
// ❌ WRONG - limiter before auth
router.post("/endpoint", limiter, isAuthenticated, handler);

// ✅ CORRECT - auth first, then limiter
router.post("/endpoint", isAuthenticated, limiter, handler);
```

### 2. Different Limits for Different Operations
```javascript
// Defensive operations: Strict limits
router.post("/login", authLimiter, handler);           // 5/15 min
router.post("/password-reset", passwordResetLimiter, handler); // 3/hour

// Regular operations: Moderate limits
router.get("/data", generalLimiter, handler);          // 100/15 min

// High-volume operations: Higher limits
router.post("/scan", scannerLimiter, handler);         // 200/15 min
```

### 3. Skip Health Checks
```javascript
// Always skip rate limiting for health checks
router.get("/_health", (req, res) => {
  // Returns immediately without rate limit
});
```

### 4. Use Environment Variables
```javascript
// Store limits in env.config.js for easy adjustment
export const RATE_LIMITS = {
  AUTH: process.env.RATE_LIMIT_AUTH || 5,
  GENERAL: process.env.RATE_LIMIT_GENERAL || 100,
  SCANNER: process.env.RATE_LIMIT_SCANNER || 200,
};
```

### 5. Document Rate Limits in API Docs
In your API documentation, always document rate limits:
```
POST /api/v1/auth/login
Rate Limit: 5 requests per 15 minutes
Status: 429 Too Many Requests when exceeded
```

## Production Considerations

### Current Implementation (In-Memory Store)
- ✅ Simple, no external dependencies
- ✅ Good for single server deployments
- ❌ Resets on server restart
- ❌ Doesn't work across multiple servers

### For Multiple Servers: Use Redis Store
```javascript
import RedisStore from "rate-limit-redis";
import redis from "redis";

const client = redis.createClient();

const limiter = rateLimit({
  store: new RedisStore({
    client: client,
    prefix: "rl:", // rate-limit: prefix
  }),
  max: 100,
  windowMs: 15 * 60 * 1000,
});
```

### Monitoring
Add logging to track rate limit violations:
```javascript
const limiter = rateLimit({
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ message: "Too many requests" });
  },
});
```

## Testing Rate Limits

### Using cURL
```bash
# Test rate limit with rapid requests
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"pass"}'
done

# Should get 429 after 5 requests
```

### Using Node.js
```javascript
import axios from 'axios';

const testRateLimit = async () => {
  for (let i = 0; i < 10; i++) {
    try {
      const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
        email: 'test@test.com',
        password: 'pass'
      });
      console.log(`Request ${i+1}: Success`);
    } catch (error) {
      console.log(`Request ${i+1}: ${error.response.status} - ${error.response.data.message}`);
    }
  }
};

testRateLimit();
```

## Summary

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `/auth/*` | 5 | 15 min | Prevent brute force |
| `/scanner/*/scan` | 200 | 15 min | High-volume scanning |
| `/api/v1/*` (general) | 100 | 15 min | General abuse prevention |
| `/upload` | 10 | 1 hour | Storage abuse prevention |
| `/payments` | 20 | 1 hour | Fraud prevention |
| `/password-reset` | 3 | 1 hour | Account takeover prevention |

---

**Last Updated**: 2026-04-11

Questions? Refer to [express-rate-limit documentation](https://github.com/nfriedly/express-rate-limit)
