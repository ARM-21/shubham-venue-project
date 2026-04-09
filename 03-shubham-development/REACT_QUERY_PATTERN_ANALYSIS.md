# React Query Pattern Analysis - Shubham Venue Project

## Current Project Structure

### Folder Organization
```
frontend/src/
├── @api/          # Layer 1: API Call Functions (Fetchers & Mutators)
│   ├── organizer/
│   ├── customer/
│   ├── profile/
│   └── ...
├── @queries/      # Layer 2: React Query Hooks (useQuery wrappers)
│   ├── organizer/
│   ├── customer/
│   ├── profile.js
│   └── ...
└── components/    # Layer 3: UI Components (use hooks from @queries)
```

---

## 1. API Layer (`@api` folder)

### Pattern: Separation of Concerns

**Fetchers** - For GET requests:
```javascript
// @api/organizer/event-detail-fetcher.js
export const ORGANIZER_EVENT_QUERY_KEY = "organizer-event";

export async function organizerEventDetailFetcher(id) {
  if (!id) throw new Error("Event ID required");
  const res = await axiosInstance.get(ROUTES.API.ORGANIZER.EVENT(id));
  return res.data;
}
```

**Mutators** - For POST/PUT/PATCH requests:
```javascript
// @api/profile/profile-mutators.js
export async function profileUpdateMutator(payload) {
  if (!payload) throw new Error("Profile data required");
  const res = await axiosInstance.put(ROUTES.API.PROFILE.UPDATE, payload);
  return res.data;
}
```

### Key Features:
- ✅ Error handling with meaningful error messages
- ✅ Query key constants for cache invalidation
- ✅ Consistent naming convention: `*Fetcher` and `*Mutator`
- ✅ Parameter validation before API calls

---

## 2. React Query Hooks Layer (`@queries` folder)

### Query Hooks Pattern

```javascript
// @queries/organizer/events.js
import { useQuery } from "@tanstack/react-query";

export function useQueryOrganizerEvent(id, options) {
  return useQuery({
    queryKey: [ORGANIZER_EVENT_QUERY_KEY, id],
    queryFn: async () => organizerEventDetailFetcher(id),
    enabled: !!id,                          // Conditional fetching
    staleTime: 3 * 60 * 1000,             // 3 minutes
    gcTime: 10 * 60 * 1000,               // 10 minutes (formerly cacheTime)
    ...options,                            // Allow override
  });
}
```

### Caching Strategy:
| Resource | Stale Time | GC Time |
|----------|-----------|---------|
| Events List | 2 minutes | 5 minutes |
| Event Details | 3 minutes | 10 minutes |
| Halls Public | 5 minutes | 5 minutes |

### Key Features:
- ✅ `enabled` flag for conditional queries
- ✅ Consistent naming: `useQuery*`
- ✅ Configurable through `options` param
- ✅ Proper cache management

---

## 3. Component Layer (Usage Pattern)

### ❌ Current Issue in EventManagement.jsx

```javascript
// CURRENT (Manual State Management)
const [userUploads, setUserUploads] = useState([]);
const [loadingUploads, setLoadingUploads] = useState(false);

const fetchUserUploads = async () => {
  try {
    setLoadingUploads(true);
    const response = await axiosInstance.get("/api/v1/profile/uploads", {
      params: { type: "banner" },
    });
    setUserUploads(response.data?.uploads || []);
  } catch (error) {
    console.log("Could not fetch...");
    setUserUploads([]);
  } finally {
    setLoadingUploads(false);
  }
};
```

### ✅ Correct Pattern (React Query)

```javascript
// Should follow the established pattern:
// 1. Fetcher in @api/organizer/user-uploads-fetcher.js
export async function userUploadsFetcher(type = 'banner') {
  const res = await axiosInstance.get("/api/v1/profile/uploads", {
    params: { type },
  });
  return res.data?.uploads || [];
}

// 2. Hook in @queries/organizer/uploads.js
export function useQueryUserUploads(type = 'banner', options) {
  return useQuery({
    queryKey: ['user-uploads', type],
    queryFn: () => userUploadsFetcher(type),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

// 3. Component Usage
const { data: userUploads = [], isLoading: loadingUploads } = 
  useQueryUserUploads('banner', { enabled: showImageSelector });
```

---

## 4. Benefits of This Pattern

| Aspect | Manual State | React Query |
|--------|-------------|------------|
| **Caching** | Manual | Automatic |
| **Deduplication** | Manual | Automatic |
| **Loading States** | Manual | Built-in (isLoading, isPending) |
| **Error Handling** | Manual try/catch | Built-in error state |
| **Background Refetch** | Manual | Configurable |
| **Memory Management** | Manual cleanup | Automatic GC |
| **Code Reusability** | Limited | High (one hook, use everywhere) |

---

## 5. Current Implementation Status

### ✅ Established:
- @api folder structure with fetchers/mutators
- @queries folder with useQuery hooks
- Consistent naming conventions
- Query key constants for cache management
- Proper cache timing strategies

### ⚠️ Partial Implementation:
- Only SELECT queries (useQuery) are being used
- Most components still use manual axiosInstance calls
- No useMutation hooks in place yet (but infrastructure ready)

### ❌ Missing:
- useMutation hooks for create/update/delete operations
- Component-level usage of @queries hooks
- EventManagement.jsx still uses manual state

---

## 6. How to Implement Mutations (Next Steps)

```javascript
// @api/organizer/event-mutators.js
export async function eventUpdateMutator(id, data) {
  const res = await axiosInstance.put(
    ROUTES.API.ORGANIZER.EVENT(id),
    data
  );
  return res.data;
}

// @queries/organizer/events.js
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMutationUpdateOrganizerEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => eventUpdateMutator(id, data),
    onSuccess: (data, { id }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: [ORGANIZER_EVENTS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [ORGANIZER_EVENT_QUERY_KEY, id],
      });
    },
  });
}

// Component Usage
const mutation = useMutationUpdateOrganizerEvent();
const handleSave = async (data) => {
  try {
    await mutation.mutateAsync({ id: eventId, data });
    toast.success("Event updated!");
  } catch (error) {
    toast.error(error.message);
  }
};
```

---

## 7. Action Items for EventManagement.jsx

1. **Create the fetcher** in `@api/organizer/user-uploads-fetcher.js`
2. **Create the query hook** in `@queries/organizer/uploads.js`
3. **Replace manual state** with React Query hook
4. **Remove useEffect** (React Query handles initial fetch)
5. **Use isLoading** directly from query result

---

## Summary

Your project follows a **3-layer React Query architecture**:

```
┌─ @api (Functions) ──────────────────────┐
│  - organizerEventDetailFetcher()        │
│  - profileUpdateMutator()               │
│  - Validation & Error handling          │
└──────────────────────────────────────────┘
           ↓
┌─ @queries (Hooks) ──────────────────────┐
│  - useQueryOrganizerEvent()             │
│  - useQueryProfile()                    │
│  - Cache configuration                  │
└──────────────────────────────────────────┘
           ↓
┌─ components (UI) ───────────────────────┐
│  - Use hooks to manage data             │
│  - Render based on state                │
│  - Dispatch actions                     │
└──────────────────────────────────────────┘
```

This is a **production-grade architecture** that provides:
- ✅ Clean separation of concerns
- ✅ Reusable data fetching logic
- ✅ Automatic caching & deduplication
- ✅ Consistent error handling
- ✅ Scalable to many components
