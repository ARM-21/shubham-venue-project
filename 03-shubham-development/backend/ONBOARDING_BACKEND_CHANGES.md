# 🔧 Backend Changes for Onboarding Flow

## Summary
Your backend needed updates to support the onboarding system. Here's exactly what was changed and why.

---

## ✅ Changes Made

### 1️⃣ **User Model** - `User.js`

**Added 5 new fields:**

```javascript
hasCompletedOnboarding: {
  type: Boolean,
  default: false  // NEW USERS START HERE
},
city: {
  type: String,
  trim: true
},
preferredEventTypes: [{
  type: String,
  trim: true
}],
firstName: {
  type: String,
  trim: true
},
lastName: {
  type: String,
  trim: true
}
```

**Why These Fields?**
- `hasCompletedOnboarding` - **Core tracking flag** for onboarding status (false = needs onboarding)
- `city` - User's location (Kathmandu, Pokhara, etc.)
- `preferredEventTypes` - Array of event types they're interested in (Wedding, Birthday, Corporate, etc.)
- `firstName`, `lastName` - CamelCase versions to match frontend naming convention

---

### 2️⃣ **Profile Controller** - `profile.controller.js`

**Updated validation and data processing:**

```javascript
// NOW SUPPORTS BOTH CAMELCASE AND SNAKE_CASE
const { first_name, last_name, firstName, lastName, phone, city, preferredEventTypes, hasCompletedOnboarding } = req.body;

// Accept either naming convention
const fname = first_name || firstName;
const lname = last_name || lastName;

// NEW VALIDATION FOR ONBOARDING FIELDS
if (city && typeof city !== 'string') {
  // Return error
}

if (preferredEventTypes && !Array.isArray(preferredEventTypes)) {
  // Return error
}

// BUILD COMPLETE UPDATE DATA WITH ALL FIELDS
const updateData = {
  first_name: fname,
  last_name: lname,
  firstName: fname,
  lastName: lname,
  phone,
  ...(city && { city }),
  ...(preferredEventTypes && { preferredEventTypes }),
  ...(typeof hasCompletedOnboarding === 'boolean' && { hasCompletedOnboarding })
};
```

**Why These Changes?**
- Supports both `firstName` (frontend) and `first_name` (backend convention)
- Validates new fields before saving
- Updates database with complete profile information
- Only includes fields that were provided in request

---

### 3️⃣ **Profile Service** - `profile.service.js`

**Updated to handle all onboarding fields:**

```javascript
export async function updateUserProfileService(userId, data) {
  const allowed = {};
  
  // Name fields (both camelCase and snake_case)
  if (data.first_name) allowed.first_name = data.first_name;
  if (data.firstName) allowed.firstName = data.firstName;
  if (data.last_name) allowed.last_name = data.last_name;
  if (data.lastName) allowed.lastName = data.lastName;
  
  // Contact & Profile fields
  if (data.phone) allowed.phone = data.phone;
  if (data.city) allowed.city = data.city;
  
  // Onboarding fields
  if (data.preferredEventTypes) allowed.preferredEventTypes = data.preferredEventTypes;
  if (typeof data.hasCompletedOnboarding === 'boolean') {
    allowed.hasCompletedOnboarding = data.hasCompletedOnboarding;
  }
  
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: allowed },
    { new: true }
  ).select('-password').lean();
  
  return user;
}
```

**Why This Change?**
- Only saves fields that are provided (safe)
- Stores both naming conventions in database
- Properly handles boolean flag update
- Returns updated user object to frontend

---

## 🔄 Data Flow

### Registration → Onboarding

```
1. User Signs Up
   ↓
2. Backend Creates User:
   {
     email: "user@example.com",
     hasCompletedOnboarding: false,  ← DEFAULT
     // ... other fields
   }

3. Frontend After OTP Verification:
   Checks: user.hasCompletedOnboarding === false?
   → YES: Redirect to onboarding

4. User Completes Onboarding:
   Frontend sends:
   PUT /api/v1/profile/me
   {
     firstName: "John",
     lastName: "Doe",
     phone: "9841234567",
     city: "Kathmandu",
     preferredEventTypes: ["Wedding", "Birthday"],
     hasCompletedOnboarding: true  ← SET TO TRUE
   }

5. Backend Updates User:
   {
     firstName: "John",
     lastName: "Doe",
     first_name: "John",
     last_name: "Doe",
     phone: "9841234567",
     city: "Kathmandu",
     preferredEventTypes: ["Wedding", "Birthday"],
     hasCompletedOnboarding: true  ← NOW TRUE
   }

6. Backend Returns Updated User
   Frontend Redirects to Dashboard
   User will NEVER see onboarding again ✅
```

---

## 📊 Database Schema

### User Collection Fields

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `hasCompletedOnboarding` | Boolean | `false` | Onboarding status tracker |
| `firstName` | String | - | First name (camelCase) |
| `lastName` | String | - | Last name (camelCase) |
| `first_name` | String | - | First name (snake_case) |
| `last_name` | String | - | Last name (snake_case) |
| `city` | String | - | User's city location |
| `preferredEventTypes` | Array | - | Event types they're interested in |
| `phone` | String | - | Phone number (already existed) |

---

## 🧪 Testing the Backend

### Test Case 1: User Completes Onboarding

```bash
# Frontend sends onboarding data
PUT /api/v1/profile/me
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9841234567",
  "city": "Kathmandu",
  "preferredEventTypes": ["Wedding", "Birthday"],
  "hasCompletedOnboarding": true
}

# Backend should return:
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "firstName": "John",
    "lastName": "Doe",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "9841234567",
    "city": "Kathmandu",
    "preferredEventTypes": ["Wedding", "Birthday"],
    "hasCompletedOnboarding": true,
    // ... other user fields
  }
}
```

### Test Case 2: New User After Registration

```bash
# GET /api/v1/profile/me (after registration)
# Should return:
{
  "user": {
    "email": "newuser@example.com",
    "hasCompletedOnboarding": false,  ← CRITICAL: Should be false
    "firstName": null,
    "lastName": null,
    "city": null,
    "preferredEventTypes": [],
    // ... other fields
  }
}
```

---

## ⚡ Frontend Integration

### Frontend sends onboarding data with:

```javascript
// From ProfileCompletion.jsx
await axiosInstance.put(ROUTES.API.PROFILE.UPDATE, {
  firstName: formData.firstName,
  lastName: formData.lastName,
  phone: formData.phone,
  city: formData.city,
  preferredEventTypes: formData.eventTypes,
  hasCompletedOnboarding: true  // ← SETS FLAG
});
```

### Frontend expects back:

```javascript
// Backend returns user object with updated field
{
  hasCompletedOnboarding: true  // ← Used to determine dashboard vs onboarding
}
```

---

## 🔐 Security Considerations

1. **Field Validation** - Phone must be 10 digits before saving
2. **Type Checking** - `preferredEventTypes` must be array
3. **Safe Update** - Only whitelisted fields are updated (not all req.body)
4. **Boolean Safety** - `hasCompletedOnboarding` only updated if explicitly boolean
5. **Authentication** - All endpoints require `isAuthenticated` middleware

---

## 🚀 Migration Strategy

If you have existing users in the database:

```javascript
// Optional: Run migration to add fields to existing users
db.users.updateMany(
  {},
  {
    $set: {
      hasCompletedOnboarding: false,
      city: null,
      preferredEventTypes: [],
      firstName: "$first_name",
      lastName: "$last_name"
    }
  }
)
```

---

## 📋 Checklist

- ✅ Updated User model with new fields
- ✅ Updated profile controller with validation
- ✅ Updated profile service to handle all fields
- ✅ Frontend supports both camelCase and snake_case
- ✅ Backend returns `hasCompletedOnboarding` in response
- ✅ Default value for `hasCompletedOnboarding` is `false`

---

## 🔗 Related Files

- Backend User Model: `src/models/User.js`
- Profile Controller: `src/controllers/user/profile.controller.js`
- Profile Service: `src/services/user/profile.service.js`
- Profile Routes: `src/routes/user/profile.routes.js` (no changes needed)
- Frontend: Uses `PUT /api/v1/profile/me` endpoint

---

## ❓ FAQ

**Q: Why both `firstName` and `first_name`?**
A: Flexibility - frontend uses camelCase, backend traditionally uses snake_case, database stores both

**Q: What if user updates profile without onboarding?**
A: They can update any field, but `hasCompletedOnboarding` only changes if explicitly set

**Q: Can user complete onboarding partially?**
A: No - `hasCompletedOnboarding` only set to `true` after ProfileCompletion form is fully submitted

**Q: What happens to existing users?**
A: They'll have `hasCompletedOnboarding: false` by default and will need to complete onboarding on next login

