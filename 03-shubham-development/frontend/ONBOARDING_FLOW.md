# 🎯 Onboarding Flow Implementation Guide

## Overview
The onboarding system automatically triggers for any user who hasn't completed onboarding, whether they're:
- **New users** registering for the first time
- **Existing users** who previously bypassed the onboarding
- **Users returning after login** without having completed onboarding

---

## 📊 How It Works

### 1️⃣ **New User Registration Flow**

```
User Signs Up
   ↓
Fills Email & Password
   ↓
Receives OTP Email
   ↓
Enters 6-Digit OTP
   ↓
✅ Account Verified
   ↓
🔄 REDIRECTS TO: /auth/onboarding
   ↓
WelcomeTour Component (4-slide carousel)
   ↓
ProfileCompletion Component (form)
   ↓
Profile Saved (hasCompletedOnboarding = true)
   ↓
✅ REDIRECTS TO: /bookings (Dashboard)
```

**Files Involved:**
- [RegisterForm.jsx](../components/auth/RegisterForm.jsx) - Detects `hasCompletedOnboarding` flag after OTP verification
- [OnboardingPage.jsx](../app/(site)/(account)/auth/onboarding/page.jsx) - Onboarding route page

---

### 2️⃣ **Existing User Login Flow (No Onboarding)**

```
User Logs In
   ↓
Enters Email & Password
   ↓
✅ Login Successful
   ↓
Check: hasCompletedOnboarding?
   ├─ ✅ YES → Redirect to Home or redirect URL
   └─ ❌ NO → 🔄 REDIRECT TO: /auth/onboarding
   ↓
WelcomeTour Component
   ↓
ProfileCompletion Component
   ↓
✅ REDIRECTS TO: /bookings (Dashboard)
```

**Files Involved:**
- [LoginForm.jsx](../components/auth/LoginForm.jsx) - Checks flag after login
- [AuthPageClient.jsx](../app/(site)/(account)/auth/AuthPageClient.jsx) - Also includes check for Google login
- [middleware.js](../middleware.js) - Server-side protection

---

### 3️⃣ **Middleware Protection (Server-Side)**

The middleware automatically enforces onboarding:

```javascript
// Onboarding route (/auth/onboarding)
if (isOnboardingRoute) {
  if (!isLoggedIn) {
    // Redirect to login
  }
  if (user?.hasCompletedOnboarding) {
    // User tries to access /auth/onboarding but already completed
    // Redirect to home
  }
  // Allow access - let component handle the flow
}

// Auth routes (/auth/*, /auth/login, etc.)
if (isAuthRoute && isLoggedIn) {
  if (!user?.hasCompletedOnboarding) {
    // Automatically redirect to onboarding
  }
}
```

---

## 🔑 Key Decision Point: `hasCompletedOnboarding` Flag

### Where It's Checked

| Location | Purpose | Action |
|----------|---------|--------|
| **RegisterForm.jsx** | After OTP verification | Redirect to onboarding if `false` |
| **LoginForm.jsx** | After successful login | Redirect to onboarding if `false` |
| **AuthPageClient.jsx** | After Google login | Redirect to onboarding if `false` |
| **OnboardingPage.jsx** | Entry page check | Allow access only if `false` |
| **middleware.js** | Server-side protection | Enforce redirects |

### Where It's Set

| Location | Method | Condition |
|----------|--------|-----------|
| **ProfileCompletion.jsx** | `PUT /api/v1/profile/me` | Set to `true` after form submission |
| **Backend Auth** | User model default | Initially set to `false` on registration |

---

## 🛡️ Protection Layers

### Layer 1: Frontend Login/Signup
- `LoginForm.jsx` checks flag and redirects
- `RegisterForm.jsx` checks flag and redirects

### Layer 2: Frontend Routing
- `OnboardingPage.jsx` validates user is authenticated
- `OnboardingPage.jsx` redirects already-onboarded users

### Layer 3: Middleware (Server-Side)
- `/auth/onboarding` route is protected
- Auth routes redirect unonboarded users to onboarding
- Prevents URL manipulation to bypass flow

### Layer 4: Component Level
- `OnboardingGuard.jsx` (optional wrapper) can be used on any page
- Checks and redirects unonboarded users

---

## 🚀 Onboarding Components

### **1. WelcomeTour.jsx**
- 4-slide swipeable carousel
- Shows platform benefits
- Navigation: Previous/Next buttons + progress dots
- Calls `onComplete()` on final slide

### **2. ProfileCompletion.jsx**
- Collects user information:
  - First Name
  - Last Name
  - Phone Number
  - City (dropdown)
  - Preferred Event Types (multi-select)
- Form validation
- Calls `onComplete(profileData)` on submit

### **3. OnboardingFlow.jsx**
- Orchestrates WelcomeTour → ProfileCompletion
- Saves profile to backend via `PUT /api/v1/profile/me`
- Sets `hasCompletedOnboarding: true`
- Redirects to `/bookings` dashboard

---

## 🔄 Complete User Journey

### Scenario A: New User
```
Sign Up Page
  ↓ (fill form)
OTP Verification Page
  ↓ (enter OTP)
✅ Account Created
  ↓
🎯 ONBOARDING FLOW
  ├─ WelcomeTour (swipe through benefits)
  ├─ ProfileCompletion (fill profile form)
  └─ Save Profile → hasCompletedOnboarding = true
  ↓
📊 Dashboard (/bookings)
  ↓
🏢 Browse Venues
  ↓
💳 Book Hall (New booking flow with all 7 steps)
```

### Scenario B: Returning User (Without Onboarding)
```
Login Page
  ↓ (enter credentials)
✅ Login Successful
  ↓
Check: hasCompletedOnboarding?
  ├─ ✅ YES → Go to Home
  └─ ❌ NO → 🎯 ONBOARDING FLOW
        ├─ WelcomeTour
        ├─ ProfileCompletion
        └─ Save Profile
  ↓
📊 Dashboard
```

### Scenario C: User Tries to Access Onboarding Directly
```
Visit: /auth/onboarding
  ↓
Middleware checks: isLoggedIn? hasCompletedOnboarding?
  ├─ Not Logged In → Redirect to Login
  ├─ Already Completed → Redirect to Home
  └─ Not Completed → ✅ Allow Access
```

---

## 📁 File Structure

```
frontend/src/
├── config/
│   └── routes.js (Added: AUTH.ONBOARDING)
├── middleware.js (Enhanced with onboarding checks)
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx (Updated: checks hasCompletedOnboarding)
│   │   ├── RegisterForm.jsx (Updated: checks hasCompletedOnboarding)
│   │   └── onboarding/
│   │       ├── OnboardingFlow.jsx (Orchestrator)
│   │       ├── WelcomeTour.jsx (Carousel)
│   │       └── ProfileCompletion.jsx (Form)
│   └── common/
│       └── OnboardingGuard.jsx (Optional page wrapper)
├── app/(site)/(account)/auth/
│   ├── AuthPageClient.jsx (Updated: checks hasCompletedOnboarding)
│   └── onboarding/
│       └── page.jsx (NEW: Onboarding page route)
```

---

## 🔌 Backend Requirements

### User Model
```javascript
{
  // ... existing fields
  hasCompletedOnboarding: {
    type: Boolean,
    default: false
  },
  firstName: String,
  lastName: String,
  phone: String,
  city: String,
  preferredEventTypes: [String],
}
```

### API Endpoints
1. **PUT /api/v1/profile/me**
   - Updates user profile with onboarding data
   - Sets `hasCompletedOnboarding: true`
   - Required fields:
     - `firstName`
     - `lastName`
     - `phone`
     - `city`
     - `preferredEventTypes`
     - `hasCompletedOnboarding`

2. **GET /api/v1/profile/me**
   - Returns user data including `hasCompletedOnboarding`
   - Used by middleware and frontend

---

## ✅ Testing Checklist

- [ ] New user registration → sees onboarding
- [ ] Existing user login (without onboarding) → sees onboarding
- [ ] User submits onboarding form → redirects to dashboard
- [ ] Already-onboarded user logs in → goes to home (no onboarding)
- [ ] Try accessing /auth/onboarding directly (not logged in) → redirects to login
- [ ] Try accessing /auth/onboarding (already onboarded) → redirects to home
- [ ] Backend sets `hasCompletedOnboarding = true` after profile completion
- [ ] Backend defaults `hasCompletedOnboarding = false` on user creation
- [ ] Google OAuth login also triggers onboarding check

---

## 🎨 Onboarding Design System

All onboarding components use:
- **Primary Color:** #3a1224 (dark maroon)
- **Accent Color:** #C0A04C (gold)
- **Background:** #fdfaf6 (cream)
- **Radius:** rounded-3xl (24px)
- **Responsive:** Mobile-first design
- **Accessibility:** Proper labels, ARIA, semantic HTML

---

## 🚨 Troubleshooting

### User sees blank page after onboarding
- Check if `hasCompletedOnboarding` was saved to backend
- Verify profile update API `/api/v1/profile/me` is returning the flag

### Onboarding appears twice
- Clear browser localStorage/cookies
- Verify middleware config is correct
- Check duplicate redirects in components

### User can't access onboarding page
- Ensure user is logged in (has valid session)
- Check middleware matcher includes `/auth/:path*`
- Verify `hasCompletedOnboarding` is `false` in database

### Redirect loops
- Check middleware `isOnboardingRoute` logic
- Verify ProfileCompletion calls saveProfile correctly
- Ensure backend returns updated user object

