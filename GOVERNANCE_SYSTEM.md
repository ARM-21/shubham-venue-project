# Event Governance System Documentation

## Overview

This comprehensive governance system implements:
- **Trust-based auto-publishing** for organizer events
- **Flagging & investigation system** for admin oversight
- **Complete audit trail** for compliance and accountability
- **Suspension & trust score management** for organizers
- **Reputation scoring** (1-5 scale) based on organizer behavior

---

## Architecture

### Models

#### 1. **AuditLog** (`models/AuditLog.js`)
Tracks every action in the system with forensic detail.

**Key Fields:**
- `entityType`: "event" | "organizer" | "user"
- `action`: created, edited, published, flagged, suspended, approved, etc.
- `performedBy`: Who did it (userId)
- `performedByRole`: "organizer" | "admin" | "system"
- `changes`: {before, after, fields} - tracks what specifically changed
- `ipAddress`, `userAgent`: For security audit
- `metadata`: Additional context (reason, notes, references)

**Indexes:**
- By entityId + createdAt (get entity history)
- By performedBy + createdAt (who did what)
- By organizerId + createdAt (organizer activity)
- By action + createdAt (action timeline)

#### 2. **Flag** (`models/Flag.js`)
Represents a flagged event that requires investigation.

**Key Fields:**
- `eventId`: Reference to flagged event
- `organizerId`: Reference to organizer
- `reason`: suspicious_activity | false_content | policy_violation | spam | fraud | etc.
- `severity`: low | medium | high | critical
- `status`: open | investigating | resolved | dismissed
- `evidence`: Array of evidence URLs (screenshots, etc.)
- `flaggedBy`: Which admin flagged it
- `resolution`: unsuspended_event | suspended_event | warned_organizer | dismissed | escalated

**Indexes:**
- By eventId, organizerId, status, severity (for filtering)
- By severity desc + createdAt (for priority ordering)

#### 3. **FlagResolution** (`models/FlagResolution.js`)
Investigation thread for a flagged event.

**Key Fields:**
- `flagId`: Reference to Flag
- `status`: open | investigating | resolved | dismissed
- `timeline`: Array of investigation actions with timestamps
- `decision`: warning | suspended_7days | suspended_30days | permanent_suspension | dismissed
- `actions`: Array of actions taken (event_suspended, organizer_suspended, etc.)
- `tags`: repeat_offender, high_value_fraud, etc.
- `relatedCases`: Other similar FlagResolutions

**Timeline Entry:**
```javascript
{
  action: "flagged" | "commented" | "evidence_added" | "escalated" | "resolved",
  performedBy: adminId,
  message: "...",
  evidence: ["url1", "url2"],
  timestamp: Date
}
```

#### 4. **OrganizerEvent** (Updated)
Extended with governance fields.

**New Fields:**
- `status`: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "CANCELLED" | "SUSPENDED"
- `approvedBy`: Admin who approved it
- `approvalNotes`: Notes from approval
- `flags`: Array of flag references with status
- `isFlagged`: Boolean for quick filtering
- `suspendedAt`, `suspensionReason`, `suspensionEndDate`: Suspension info
- `publishedAt`, `publishedBy`: When/by whom published

#### 5. **User Model** (Updated)
Added trust and suspension fields.

**New Fields:**
```javascript
trustMetrics: {
  eventsCreated: Number,
  eventsApproved: Number,
  currentFlags: Number,
  resolvedFlags: Number,
  suspensionCount: Number,
  averageRating: Number (1-5),
  trustScore: Number (1-5),
  requiresApproval: Boolean,
  lastUpdatedAt: Date
},

suspensionStatus: "none" | "temporary" | "permanent",
suspendedAt: Date,
suspensionReason: String,
suspensionEndDate: Date,
suspensionHistory: [{
  suspendedAt: Date,
  suspendedUntil: Date,
  reason: String,
  liftedAt: Date,
  liftedBy: adminId
}]
```

---

## Trust Score Calculation

**Formula (1-5 scale):**

```
trustScore = 
  (approvalRate * 0.4) +           // Approval rate (40%)
  (flagFactor * 0.3) +             // Flag history (30%)
  (ratingFactor * 0.2) +           // User ratings (20%)
  (suspensionFactor * 0.1) +       // Suspension history (10%)
  1  // Base score
```

**Thresholds:**
- `trustScore >= 4.0`: Auto-publish events (PUBLISHED immediately)
- `2.5 <= trustScore < 4.0`: PENDING_REVIEW (requires admin approval)
- `trustScore < 2.5`: PENDING_REVIEW (full admin review required)

**Auto-Updates:**
- On event created: +1 eventsCreated, recalculate
- On event approved: +1 eventsApproved, recalculate
- On event flagged: +1 currentFlags, recalculate
- On flag resolved: -1 currentFlags OR +1 resolvedFlags, recalculate
- On organizer suspended: +1 suspensionCount, recalculate

---

## Event Publishing Flow

### For High-Trust Organizer (trustScore >= 4.0)

```
Organizer creates event
  ↓
System calculates trust score
  ↓
TrustScore >= 4.0? → YES
  ↓
Event status = PUBLISHED
Event publishedAt = now
Event publishedBy = organizerId
  ↓
Immediate visibility → Users can see it
  ↓
BUT: Can still be FLAGGED at any time
```

### For Low-Trust Organizer (trustScore < 4.0)

```
Organizer creates event
  ↓
System calculates trust score
  ↓
TrustScore < 4.0? → YES
  ↓
Event status = PENDING_REVIEW
  ↓
Admin receives notification
Admin reviews event details
  ↓
Admin approves? → YES → PUBLISHED
Admin rejects? → NO → CANCELLED (with reason)
```

### Event Can Be Flagged Anytime

```
Event PUBLISHED or PENDING_REVIEW
  ↓
Admin suspects fraud/policy violation
  ↓
Admin flags event
  ↓
If severity = CRITICAL/HIGH → Event auto-suspended
If severity = LOW/MEDIUM → Remains published, under investigation
  ↓
Investigation timeline started
Admin adds evidence & comments
  ↓
Admin resolves with decision:
  - Warning (organizer warned, event restored)
  - Suspended_7days (organizer suspended temporarily)
  - Permanent_suspension (organizer banned)
  - Dismissed (false flag, event restored)
```

---

## Flagging & Investigation System

### 1. Flag an Event (Admin)

```javascript
POST /admin/flags
{
  eventId: "...",
  reason: "suspicious_activity",
  severity: "high",
  description: "Event details don't match hall capacity...",
  evidence: ["screenshot_url_1", "screenshot_url_2"]
}
```

**What happens:**
1. Flag created with status = "open"
2. FlagResolution thread created
3. Event marked as isFlagged = true
4. If HIGH/CRITICAL severity → Event auto-suspended
5. Organizer metrics updated (+1 currentFlags)
6. Audit log entry created
7. Admin notified

### 2. Investigate (Admin)

```javascript
GET /admin/flags/:flagId
// Returns: Flag + FlagResolution thread with full history

POST /admin/flags/:flagId/comments
{
  message: "Found duplicate events by same organizer",
  evidence: ["url_1", "url_2"]
}
// Adds comment to investigation timeline
```

### 3. Resolve Flag (Admin)

```javascript
PATCH /admin/flags/:flagId/resolve
{
  decision: "suspended_7days",  // or "warning", "dismissed"
  reason: "Fraudulent event details",
  suspensionDays: 7
}
```

**Resolution outcomes:**

| Decision | Action | Result |
|----------|--------|--------|
| `warning` | Organizer warned | Trust score recalculated, event restored |
| `suspended_7days` | Organizer suspended | All events suspended, organizer locked for 7 days |
| `suspended_30days` | Organizer suspended | All events suspended, organizer locked for 30 days |
| `permanent_suspension` | Organizer permanently banned | All events suspended, cannot create new events |
| `dismissed` | False flag | Event restored, flag resolved, +1 resolvedFlags |

---

## Admin Routes Reference

### Flags Management
```
GET  /admin/flags/dashboard          # Overview stats
POST /admin/flags                    # Flag an event
GET  /admin/flags                   # Get all flags (searchable, filterable)
GET  /admin/flags/:flagId           # Get flag + investigation thread
POST /admin/flags/:flagId/comments  # Add evidence/comment to investigation
PATCH /admin/flags/:flagId/resolve  # Resolve with decision
POST /admin/flags/:flagId/dismiss   # Dismiss flag (false positive)
GET  /admin/organizers/:id/flags    # Get organizer's flag history
```

### Organizer Event Management
```
GET  /admin/organizer-events                        # All events (by any organizer)
GET  /admin/organizer-events/pending               # Pending approval events
GET  /admin/organizer-events/:eventId/audit        # Event audit trail
POST /admin/organizer-events/:eventId/approve      # Approve pending event
POST /admin/organizer-events/:eventId/reject       # Reject pending event
POST /admin/organizer-events/:eventId/suspend      # Suspend published event
```

### Organizer Reputation
```
GET  /admin/organizers                              # All organizers + reputation
GET  /admin/organizers/:id/reputation              # Reputation dashboard
GET  /admin/organizers/:id/events                  # Their events
GET  /admin/organizers/:id/audit-trail             # Full activity log
POST /admin/organizers/:id/suspend                 # Suspend organizer
POST /admin/organizers/:id/unsuspend               # Lift suspension
PATCH /admin/organizers/:id/trust-score            # Adjust trust score manually
POST /admin/organizers/:id/warning                 # Send warning
GET  /admin/stats/suspensions                      # Suspension statistics
```

### Organizer Event Creation
```
POST /organizer/events              # Create event (auto-publishes or pending)
GET  /organizer/events              # Get their events
```

---

## Audit Trail System

### Automatic Logging
Every action creates an AuditLog entry capturing:
- WHO did it (userId, role)
- WHAT they did (action enum)
- WHEN (timestamp)
- WHAT CHANGED (before/after comparison)
- WHERE from (IP, user agent)
- WHY (reason/notes in metadata)

### Query Audit Trail

```javascript
// Get event history
GET /admin/organizer-events/:eventId/audit
// Returns: All changes to this event with timestamps

// Get organizer activity
GET /admin/organizers/:organizerId/audit-trail
// Returns: All activities by this organizer + their events

// Export audit data (for compliance)
GET /admin/audit/export?startDate=...&endDate=...
// Returns: CSV/JSON of audit trail for legal/compliance
```

---

## Middleware

### Audit Middleware (`middleware/audit.middleware.js`)

Intercepts all requests and logs successful operations.

**Usage in Controllers:**
```javascript
import { setAudit } from "../../middleware/audit.middleware.js";

// In controller action:
setAudit(req, {
  entityType: "event",
  entityId: eventId,
  action: "published",
  relatedOrganizerId: event.organizerId,
  metadata: {
    trustScore: 4.2,
    reason: "Auto-published due to high trust"
  }
});

// Audit log is automatically created after successful response
```

---

## Services

### Trust Score Service (`services/trustScore.service.js`)

**Key Functions:**
```javascript
calculateTrustScore(organizerId)           // Calculate trust score
updateTrustScore(organizerId)              // Update in DB + get result
onEventCreated(organizerId)                // +1 eventsCreated
onEventApproved(organizerId)               // +1 eventsApproved
onEventFlagged(organizerId)                // +1 currentFlags
onFlagResolved(organizerId, resolution)    // -1 currentFlags
suspendOrganizer(organizerId, reason, days)   // Suspend organizer
liftSuspension(organizerId, liftedById)       // Lift suspension
getOrganizerReputation(organizerId)           // Get full reputation data
```

---

## Example Workflows

### Scenario 1: New Organizer (Low Trust)
```
1. Organizer A registers, trustScore = 2.5 (default)
2. Creates first event
3. System: trustScore < 4.0 → status = PENDING_REVIEW
4. Admin receives notification
5. Admin reviews event details
6. Admin: "Looks good" → Approves event
7. Event → PUBLISHED
8. Event published counter +1
9. trustScore recalculated (likely 2.7 now)
```

### Scenario 2: High-Trust Organizer
```
1. Organizer B has trustScore = 4.3
2. Creates event (wedding)
3. System: trustScore >= 4.0 → Auto-publishes
4. Event immediately visible to customers
5. But admin can still flag it if suspicious
6. If admin flags with CRITICAL severity:
   - Event → SUSPENDED immediately
   - Investigation thread starts
   - Admin reviews evidence
7. If fraud confirmed: Organizer → permanent_suspension
   - All events suspended
   - trustScore → 1 (minimum)
   - Cannot create new events
```

### Scenario 3: Serial Fraudster
```
1. Organizer C: 12 flags, 3 suspensions
2. Getting caught repeatedly
3. trustScore = 1.2 (near minimum)
4. Every event goes to PENDING_REVIEW
5. Admin sees: "Suspicious pattern - repeat offender"
6. Admin can preemptively suspend or warn
7. Audit trail shows: 3 suspensions, 8 resolved correctly, 4 still pending
8. Evidence: All previous false/fraudulent events logged
```

---

## Integration Checklist

- [ ] Import all models in db connection
- [ ] Add governance routes to main router
- [ ] Create organizer routes for event creation
- [ ] Update event controller to use trust score logic
- [ ] Add audit middleware to app.mjs
- [ ] Create admin dashboard components (frontend)
- [ ] Add notifications for admins when flags created
- [ ] Email notifications for organizer suspension
- [ ] Automatic suspension check on login (if suspended)
- [ ] Frontend: Show approval status to organizers
- [ ] Frontend: Show trust score in admin dashboard

---

## Best Practices

1. **Audit Everything**: Never skip audit logging - it's your legal protection
2. **Clear Reasons**: Always provide reason/notes when suspending or rejecting
3. **Document Evidence**: Attach screenshots/URLs when flagging
4. **Investigation Timeline**: Keep comments detailed for auditing purposes
5. **Fair Process**: Multiple admin review for permanent suspensions
6. **Transparency**: Show organizer their trust score and recent flags
7. **Consistent Penalties**: Document what violations lead to what penalties
8. **Regular Reviews**: Periodically review trust calculations for fairness

