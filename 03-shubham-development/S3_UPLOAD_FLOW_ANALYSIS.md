# S3 Upload Flow Analysis & Event Fix

## ✅ Working Profile Avatar Upload (2-Step Process)

### Frontend Flow: `src/app/(site)/profile/page.jsx`

**Step 1: Get Presigned URL**
```jsx
const { mutate: mutateGetAvatarUrl } = useMutation({
  mutationFn: async (file) => {
    const res = await axiosInstance.post(ROUTES.API.PROFILE.AVATAR_UPLOAD_URL, {
      fileExtension: file.name.substring(file.name.lastIndexOf('.')),
      contentType: file.type
    });
    return res.data; // Returns: data.data = { uploadUrl, publicUrl, key, expiresIn }
  },
  onSuccess: (data, file) => {
    uploadToS3(data.data, file);  // Proceed to step 2
  }
});
```

**Step 2: Upload to S3**
```jsx
const uploadToS3 = useCallback(async (uploadData, file) => {
  try {
    const { uploadUrl, publicUrl, key } = uploadData;
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    
    if (!response.ok) throw new Error('S3 upload failed');
    
    mutateConfirmAvatar({ s3Key: key, publicUrl });  // Proceed to step 3
  } catch (error) {
    toast.error('Failed to upload to storage');
  }
}, [mutateConfirmAvatar]);
```

**Step 3: Confirm Upload (Save to DB)**
```jsx
const { mutate: mutateConfirmAvatar } = useMutation({
  mutationFn: async (payload) => {
    const res = await axiosInstance.post(ROUTES.API.PROFILE.AVATAR_CONFIRM, payload);
    return res.data;
  },
  onSuccess: (data) => {
    const newUser = data.user;
    queryClient.invalidateQueries({ queryKey: ['profile-my'] });
    setUser?.(newUser);
    setAvatarFile(null);
    setAvatarPreview(null);
    toast.success('Avatar uploaded successfully!');
  }
});
```

### Backend Flow: User Avatar

**Endpoint 1: GET PRESIGNED URL**
- **Route**: `POST /api/v1/profile/me/avatar/upload-url`
- **Returns**: 
  ```json
  {
    "success": true,
    "data": {
      "uploadUrl": "https://bucket.s3.../file?X-Amz-Algorithm=...",
      "publicUrl": "https://bucket.s3.../file",
      "key": "user-profiles/avatar_...",
      "expiresIn": 300
    }
  }
  ```

**Endpoint 2: CONFIRM UPLOAD**
- **Route**: `POST /api/v1/profile/me/avatar/confirm`
- **Expects**: `{ s3Key: string, publicUrl: string }`
- **Updates**: User model with `profilePicture` and `s3Key`
- **Returns**: Updated user object

---

## ❌ Broken Event Upload (Missing Confirm Step)

Currently in `src/components/organizer/ProfessionalEventForm.jsx`:

```jsx
const uploadBanner = async () => {
  try {
    // Step 1: Get presigned URL (WORKS)
    const { data } = await axiosInstance.post(ROUTES.API.ADMIN.MENU_UPLOAD_URL, {
      fileExtension: ext,
      contentType: bannerFile.type,
    });

    const { uploadUrl, publicUrl } = data.data;

    // Step 2: Upload to S3 (WORKS)
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': bannerFile.type },
      body: bannerFile,
    });

    // Step 3: Update form (INCOMPLETE - NO CONFIRMATION)
    setValue('bannerUrl', publicUrl, { shouldDirty: true });
    // ❌ Missing: Confirm upload to backend!
    // ❌ Missing: Save s3Key and publicUrl to database!
    // ❌ Missing: Event ID is undefined in route!
  }
};
```

---

## 🔴 The Problem

### Error Message:
```
POST https://shubham-venue.me/organizer-hub/events/undefined
Status: 400
Body: {"success":false,"message":"S3 key and public URL are required"}
```

### Root Causes:

1. **Missing Confirm Endpoint for Events**
   - Profile has: `POST /api/v1/profile/me/avatar/confirm`
   - Events need: `POST /api/v1/organizer/events/:eventId/banner/confirm`

2. **No Event ID Available During Upload**
   - Event ID is `undefined` (event not created yet in new event form)
   - Can't confirm upload without event ID

3. **Incomplete Upload Flow**
   - Only doing 2 steps instead of 3
   - Skipping the database confirmation step

---

## ✅ What Needs to Be Done

### Backend (Create 2 New Endpoints)

#### 1. Event Banner Upload URL Endpoint
**File**: `backend/src/routes/organizer/organizer.routes.js`

```javascript
/**
 * POST /api/v1/organizer/events/banner/upload-url
 * Only authenticated organizers - get presigned URL
 */
router.post("/events/banner/upload-url", isAuthenticated, isOrganizer, async (req, res, next) => {
  try {
    const { fileExtension, contentType } = req.body || {};
    if (!fileExtension || !contentType) {
      return res.status(400).json({ 
        success: false, 
        message: "fileExtension and contentType are required" 
      });
    }

    const data = await generateEventBannerUploadUrl(fileExtension, contentType);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
});
```

**Service**: Create `backend/src/services/event/upload.service.js`
```javascript
import { generateImageUploadUrl } from '../upload/presigned.service.js';

export async function generateEventBannerUploadUrl(fileExtension, contentType) {
  const folder = process.env.AWS_S3_EVENT_FOLDER || "events";
  return generateImageUploadUrl({ 
    folder, 
    filePrefix: "event-banner", 
    fileExtension, 
    contentType, 
    metadataType: "event-banner" 
  });
}
```

#### 2. Event Banner Confirm Endpoint
**File**: `backend/src/routes/organizer/organizer.routes.js`

```javascript
/**
 * POST /api/v1/organizer/events/:eventId/banner/confirm
 * Save S3 key and publicUrl to OrganizerEvent
 */
router.post("/events/:eventId/banner/confirm", isAuthenticated, isOrganizer, async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { s3Key, publicUrl } = req.body || {};
    const organizerId = req.currentUser._id;

    if (!s3Key || !publicUrl) {
      return res.status(400).json({
        success: false,
        message: "S3 key and public URL are required"
      });
    }

    // Verify organizer owns this event
    const event = await OrganizerEvent.findOne({ 
      _id: eventId, 
      organizerId 
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or unauthorized"
      });
    }

    // Get old banner S3 key for cleanup
    const oldS3Key = event.bannerS3Key;

    // Update event with new banner
    const updated = await OrganizerEvent.findByIdAndUpdate(
      eventId,
      {
        bannerUrl: publicUrl,
        bannerS3Key: s3Key,
      },
      { new: true }
    );

    // Delete old banner from S3 if exists
    if (oldS3Key && oldS3Key !== s3Key) {
      await deleteFromS3(oldS3Key).catch(err => console.warn('Failed to delete old banner:', err));
    }

    return res.status(200).json({
      success: true,
      message: "Event banner uploaded successfully",
      event: updated
    });
  } catch (err) {
    return next(err);
  }
});
```

#### 3. Update OrganizerEvent Model
**File**: `backend/src/models/OrganizerEvent.js`

```javascript
const schema = new Schema({
  // ... existing fields ...
  
  bannerUrl: { type: String, trim: true },          // Public URL
  bannerS3Key: { type: String, trim: true },       // S3 key for cleanup
  
  // ... rest of schema ...
});
```

---

### Frontend (Update Event Form)

#### 1. Add Route for Event Banner Endpoints
**File**: `frontend/src/config/routes.js`

```javascript
ORGANIZER: {
  // ... existing routes ...
  EVENT_BANNER_UPLOAD_URL: '/api/v1/organizer/events/banner/upload-url',
  EVENT_BANNER_CONFIRM: (id) => `/api/v1/organizer/events/${id}/banner/confirm`,
}
```

#### 2. Update ProfessionalEventForm
**File**: `frontend/src/components/organizer/ProfessionalEventForm.jsx`

```jsx
const uploadBanner = async () => {
  if (!bannerFile || !initialData?._id) {
    toast.error("Event must be saved before uploading banner");
    return;
  }
  
  try {
    setBannerUploading(true);
    setBannerError(null);

    // Step 1: Get presigned URL
    const ext = `.${bannerFile.name.split('.').pop()}`;
    const { data } = await axiosInstance.post(
      ROUTES.API.ORGANIZER.EVENT_BANNER_UPLOAD_URL, 
      {
        fileExtension: ext,
        contentType: bannerFile.type,
      }
    );

    const { uploadUrl, publicUrl, key } = data?.data;
    if (!uploadUrl || !publicUrl || !key) {
      throw new Error('Upload URL not received');
    }

    // Step 2: Upload to S3
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': bannerFile.type },
      body: bannerFile,
    });
    
    if (!response.ok) throw new Error('S3 upload failed');

    // Step 3: Confirm upload to backend
    const confirmRes = await axiosInstance.post(
      ROUTES.API.ORGANIZER.EVENT_BANNER_CONFIRM(initialData._id),
      {
        s3Key: key,
        publicUrl: publicUrl
      }
    );

    // Update form with confirmed URL
    setValue('bannerUrl', confirmRes.data.event.bannerUrl, { shouldDirty: true });
    setBannerFile(null);
    setBannerPreview(confirmRes.data.event.bannerUrl);
    
    toast.success('Banner uploaded successfully');
  } catch (err) {
    const message = err?.response?.data?.message || err.message || 'Upload failed';
    toast.error(message);
    setBannerError(message);
  } finally {
    setBannerUploading(false);
  }
};
```

---

## 📋 Implementation Checklist

### Backend
- [ ] Create event banner upload URL endpoint
- [ ] Create event banner confirm endpoint  
- [ ] Create event upload service (uses shared presigned service)
- [ ] Update OrganizerEvent model (add bannerS3Key field)
- [ ] Add S3 cleanup function for old banners
- [ ] Add authorization check (organizer owns event)

### Frontend
- [ ] Add event banner routes to config
- [ ] Update ProfessionalEventForm uploadBanner function
- [ ] Pass event ID to upload flow
- [ ] Call confirm endpoint with s3Key and publicUrl
- [ ] Update form with confirmed URL

### Database Migration
- [ ] Add bannerS3Key field to OrganizerEvent collection

---

## 🔄 Complete Event Banner Upload Flow

```
1. User selects banner image in form
   ↓
2. Form is saved to DB (event ID is generated)
   ↓
3. User clicks "Upload Banner" button
   ↓
4. Frontend: POST /api/v1/organizer/events/banner/upload-url
   ← Returns: { uploadUrl, publicUrl, key, expiresIn }
   ↓
5. Frontend: PUT to S3 using presigned URL
   ← S3 receives file
   ↓
6. Frontend: POST /api/v1/organizer/events/:eventId/banner/confirm
   ← Backend saves bannerUrl and bannerS3Key to database
   ↓
7. Form updates with confirmed banner URL
   ↓
8. Success! Banner is now persisted in DB and S3
```

---

## Key Differences: Profile vs Events

| Aspect | Profile (✅ Working) | Events (❌ Broken) |
|--------|------------|---------|
| **Get URL Endpoint** | `/api/v1/profile/me/avatar/upload-url` | Missing |
| **Confirm Endpoint** | `/api/v1/profile/me/avatar/confirm` | Missing |
| **DB Field for Key** | `User.s3Key` | Missing (OrganizerEvent.bannerS3Key) |
| **Cleanup** | Yes, old avatar deleted | None |
| **Authorization** | Only own profile | Check organizer owns event |
| **When to Upload** | Any time | After event is created |
| **Confirmation Step** | 3-step process ✓ | Only 2 steps ✗ |

---

## Why It Failed Before

**Error**: `PUT https://shubham-venue.me/organizer-hub/events/undefined`

**Reason**: Frontend tried to call event confirm on a non-existent event (ID was undefined because event form is for NEW events that don't have an ID yet)

**Solution**: Upload banner AFTER event is created, not during form creation

