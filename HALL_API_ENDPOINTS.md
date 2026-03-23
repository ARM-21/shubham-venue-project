# Hall-Related API Endpoints Documentation

## Base URLs
- **Public/Site Endpoints**: `/api/v1/halls`
- **Admin Endpoints**: `/api/v1/admin/halls`
- **Booking Endpoints**: `/api/v1/bookings`

---

## 📋 PUBLIC HALL ENDPOINTS (v1/halls)

### 1. List All Halls
**Endpoint**: `GET /api/v1/halls`

**Query Parameters**:
- `city` (optional): Filter halls by city
- `minCapacity` (optional): Filter halls with minimum capacity (number)

**Response**:
```json
{
  "halls": [
    {
      "_id": "ObjectId",
      "name": "Hall Name",
      "slug": "hall-slug",
      "description": "Hall description",
      "images": ["url1", "url2"],
      "capacity": 500,
      "location": {
        "address": "123 Main St",
        "city": "City Name",
        "coordinates": { "lat": 0, "lng": 0 }
      },
      "pricePerHour": 5000,
      "currency": "INR",
      "amenities": ["WiFi", "Parking", "AC"],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 2. Get Hall by Slug
**Endpoint**: `GET /api/v1/halls/:slug`

**Parameters**:
- `:slug` (required): Hall slug from URL

**Response**:
```json
{
  "hall": {
    "_id": "ObjectId",
    "name": "Hall Name",
    "slug": "hall-slug",
    "description": "Detailed description",
    "images": ["url1", "url2"],
    "capacity": 500,
    "location": { ... },
    "pricePerHour": 5000,
    "currency": "INR",
    "amenities": [...],
    "policies": "Cancellation policy text",
    "isActive": true,
    // ... full hall details
  }
}
```

---

### 3. Check Single Hall Availability
**Endpoint**: `POST /api/v1/halls/:hallId/availability`

**Parameters**:
- `:hallId` (required): Hall ID in URL path

**Request Body**:
```json
{
  "date": "2024-12-25",        // Required: yyyy-mm-dd format
  "slot": "morning",             // Required: "morning" | "evening" | "wholeday"
  "guests": 150                  // Required: number >= 1
}
```

**Response** (Available):
```json
{
  "available": true
}
```

**Response** (Not Available):
```json
{
  "available": false,
  "reason": "BOOKED",           // or: "HALL_INACTIVE", "EXCEEDS_CAPACITY", "PAST_DATE", "TIME_BLOCKED"
  "blockingStatus": "CONFIRMED", // Status of blocking booking (if reason is "BOOKED")
  "blockingSlot": "evening"      // Slot of blocking booking
}
```

**Slot Conflict Logic**:
- `wholeday` blocks: morning, evening, wholeday
- `morning` blocks: morning, wholeday
- `evening` blocks: evening, wholeday

**Time Blocking Rules**:
- Morning slot: Must be booked before 9:00 AM on the same day
- Evening slot: Must be booked before 5:00 PM (17:00) on the same day
- Past dates cannot be booked

---

### 4. List All Halls with Availability Filter
**Endpoint**: `GET /api/v1/halls/availability`

**Query Parameters**:
- `date` (required): yyyy-mm-dd format
- `slot` (required): "morning" | "evening" | "wholeday"
- `guests` (required): minimum number of guests (Number >= 1)
- `city` (optional): Filter by city

**Response**:
```json
{
  "halls": [
    {
      "_id": "ObjectId",
      "name": "Hall Name",
      "slug": "hall-slug",
      "capacity": 500,
      "location": { "city": "City Name", ... },
      "images": ["url1"],
      "amenities": ["WiFi", "Parking"],
      "pricePerHour": 5000,
      "currency": "INR",
      "available": true           // Key flag: true if NOT booked
    }
  ]
}
```

**Returns**: Empty array if no halls match criteria or time is blocked.

---

## 🔐 BOOKING-RELATED ENDPOINTS (Interact with Halls)

### 5. Reserve Hall (5-minute Hold)
**Endpoint**: `POST /api/v1/bookings/reserve`

**Authentication**: Required (JWT token)

**Request Body**:
```json
{
  "hallId": "ObjectId",           // Required
  "date": "2024-12-25",           // Required: yyyy-mm-dd
  "slot": "evening",              // Required: "morning" | "evening" | "wholeday"
  "guests": 200,                  // Required: number
  "bookingPurpose": "customer"    // Optional: "customer" | "organizer"
}
```

**Response** (Success):
```json
{
  "reservationId": "ObjectId",
  "expiresIn": 300,               // Seconds (5 minutes)
  "expiresAt": "2024-12-25T10:05:00Z",
  "message": "Hall reserved for 5 minutes"
}
```

**Response** (Failure):
```json
{
  "message": "Hall not available",
  "reason": "BOOKED"  // or other reasons
}
```

---

### 6. Release Reservation
**Endpoint**: `DELETE /api/v1/bookings/reserve/:id`

**Parameters**:
- `:id` (required): Reservation ID

**Authentication**: Required

**Response**:
```json
{
  "message": "Reservation released"
}
```

---

### 7. Finalize Booking (After Reserve)
**Endpoint**: `POST /api/v1/bookings`

**Authentication**: Required

**Request Body**:
```json
{
  "reservationId": "ObjectId",    // Optional: if using reserve flow
  "hallId": "ObjectId",           // Required if no reservationId
  "date": "2024-12-25",           // Required: yyyy-mm-dd
  "slot": "evening",              // Required
  "guests": 200,                  // Required
  "eventType": "Wedding",         // Optional
  "eventName": "Smith-Johnson",   // Optional
  "specialRequirements": "Text",  // Optional
  "bookingPurpose": "customer",   // "customer" | "organizer"
  "menuMode": "package",          // "package" | "custom"
  "selectedMenu": [],             // Menu items array
  "selectedPackage": null,        // Package object
  "menuTotal": 50000,             // Total menu cost
  "decorationScheme": null,       // Decoration object
  "addons": [],                   // Additional items
  "decorationTotal": 10000,       // Decoration cost
  "paymentMethod": "cash"         // "cash" | "online"
}
```

**Response**:
```json
{
  "message": "Booking created",
  "booking": {
    "_id": "ObjectId",
    "hallId": "ObjectId",
    "date": "2024-12-25T00:00:00Z",
    "slot": "evening",
    "guests": 200,
    "hallPrice": 25000,            // Calculated from pricePerHour
    "menuTotal": 50000,
    "decorationTotal": 10000,
    "totalAmount": 85000,
    "status": "CONFIRMED",         // or "PENDING" if online payment
    "bookingPurpose": "customer",
    "confirmedAt": "2024-12-25T10:00:00Z"
  }
}
```

---

## 🛠️ ADMIN HALL ENDPOINTS (v1/admin/halls)

### 8. List All Halls (Admin)
**Endpoint**: `GET /api/v1/admin/halls`

**Authentication**: Required (Admin role)

**Query Parameters**:
- Standard filters (city, etc.)

**Response**: Same as public list endpoint with additional admin fields.

---

### 9. Create Hall
**Endpoint**: `POST /api/v1/admin/halls`

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "name": "Grand Hall",
  "slug": "grand-hall",
  "description": "Description",
  "capacity": 500,
  "location": {
    "address": "123 Street",
    "city": "Mumbai",
    "coordinates": { "lat": 19.0760, "lng": 72.8777 }
  },
  "pricePerHour": 5000,
  "currency": "INR",
  "amenities": ["WiFi", "Parking", "AC"],
  "policies": "Cancellation policy",
  "images": ["url1", "url2"],
  "isActive": true
}
```

**Response**:
```json
{
  "hall": { /* created hall object */ },
  "message": "Created"
}
```

---

### 10. Get Hall Details (Admin)
**Endpoint**: `GET /api/v1/admin/halls/:id`

**Parameters**: `:id` = Hall MongoDB ID

**Response**:
```json
{
  "hall": { /* full hall object */ },
  "message": "OK"
}
```

---

### 11. Update Hall
**Endpoint**: `PATCH /api/v1/admin/halls/:id`

**Authentication**: Required (Admin)

**Request Body**: Any fields to update (partial update)

**Response**:
```json
{
  "hall": { /* updated hall object */ },
  "message": "Updated"
}
```

---

### 12. Delete Hall
**Endpoint**: `DELETE /api/v1/admin/halls/:id`

**Authentication**: Required (Admin)

**Response**:
```json
{
  "message": "Deleted"
}
```

---

### 13. Generate Hall Image Upload URL
**Endpoint**: `POST /api/v1/admin/halls/upload-url`

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "fileExtension": "jpg",     // Required: jpg, png, etc.
  "contentType": "image/jpeg" // Required: MIME type
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://...", // S3 pre-signed URL
    "imageUrl": "https://..."   // Final image URL
  }
}
```

---

## 📊 Price Calculation Logic

### Hall Price Calculation
For a booking, the hall price is calculated as:
```javascript
const multiplier = slot === "wholeday" ? 15 : 5;
const hallPrice = pricePerHour * multiplier;
```

**Examples**:
- Hall with pricePerHour = 5000
  - Morning slot: 5000 × 5 = ₹25,000
  - Evening slot: 5000 × 5 = ₹25,000
  - Wholeday slot: 5000 × 15 = ₹75,000

---

## 🎯 Common Response Codes

| Code | Meaning |
|------|---------|
| 200  | OK - Success |
| 201  | Created - New resource created |
| 400  | Bad Request - Missing/invalid parameters |
| 403  | Forbidden - Not authorized for this operation |
| 404  | Not Found - Hall/Resource doesn't exist |
| 500  | Server Error |

---

## ⚠️ Validation Rules

### Date/Time Requirements
- Date format must be `yyyy-mm-dd`
- Cannot book past dates
- Morning slot: Must be booked before 9:00 AM same day
- Evening slot: Must be booked before 5:00 PM same day

### Slot Blocking
- Prevents double-booking of overlapping slots
- Slot conflicts:
  - `wholeday` blocks all other slots
  - `morning` and `evening` can conflict with `wholeday`
- Only blocks bookings with status: `PENDING`, `CONFIRMED`, `COMPLETED`

### Guest Capacity
- Guests cannot exceed hall capacity
- Minimum 1 guest required

---

## 🔗 Frontend Routes Configuration

```javascript
// From config/routes.js
HALLS: {
  ROOT: '/api/v1/halls',                    // List all
  BY_SLUG: (slug) => `/api/v1/halls/${slug}`,  // Get by slug
  AVAILABILITY: '/api/v1/halls/availability',  // Filter with availability
  BY_ID_AVAILABILITY: (id) => `/api/v1/halls/${id}/availability`, // Check specific hall
}
```

---

## 📝 Notes

1. **Availability Check Before Booking**: Always call availability endpoint before attempting to reserve
2. **5-Minute Hold**: Reserve endpoint creates a temporary hold; finalize within 5 minutes or it expires
3. **Slot Naming**: UI shows "Morning", "Evening", "Whole Day" but API expects lowercase
4. **Admin vs Public**: Admin endpoints require authentication with admin role; public endpoints are accessible to all
5. **Organizer Bookings**: Only eligible users can make organizer bookings; they don't need to select menus
