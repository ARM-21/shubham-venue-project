# Shubham Venue UI Relayout Implementation Plan

## Summary

This plan covers a page-by-page UI relayout for Shubham Venue while preserving existing business logic, API contracts, auth flow, ticketing, organizer permissions, and booking behavior.

The redesign direction is clean premium hospitality: maroon, gold, ivory, white, practical layouts, clear CTAs, useful states, and human copy. Avoid generic AI-looking sections, excessive gradients, glass effects, decorative blobs, and icon-heavy UI. Use professional emojis only where they improve scanning.

## Global Implementation Rules

- Protect `frontend/src/app/(site)/layout.jsx` and `frontend/src/components/navbar/Navbar.jsx`.
- Do not change navbar scroll behavior, active route state, auth dropdown, logo, `Book Now`, `Sign In`, or mobile menu unless intentionally requested.
- Public pages must keep a readable first viewport under the transparent navbar with enough top spacing or a dark/image-led header.
- Organizer pages must preserve `frontend/src/app/organizer-hub/layout.jsx`, `OrganizerNav`, auth redirect, and role/eligibility behavior.
- Keep current hooks, mutations, routes, payment handlers, QR/ticket logic, S3 upload logic, and organizer APIs intact.
- Prefer scoped page/component classes over global CSS changes.
- Replace plain loading text with skeletons, and replace generic empty/error states with useful user-facing messages.

## Implementation Order

1. Event details page
2. Blogs listing page
3. Blog detail page
4. About page
5. Contact page
6. My tickets page
7. My profile page
8. Organizer dashboard
9. Organizer events listing
10. Organizer create/edit event form
11. Organizer event management page
12. Organizer analytics page
13. Organizer settings page

Work one page at a time. After each page, check desktop, tablet, and mobile before moving on.

## 1. Event Details Page

Target files:

- `frontend/src/app/(site)/events/[eventId]/page.jsx`
- `frontend/src/app/(site)/events/[eventId]/components/*`

Layout direction: event decision page.

- Use a dark/image-led hero with event title, banner, date, time, venue, and ticket status.
- Use a two-column desktop layout: event content on the left, sticky ticket panel on the right.
- Use a single-column mobile layout with ticket panel near the ticket section.
- Sections: About this event, date/time/location, tickets, venue, organizer, related events if data exists.
- Ticket panel should show ticket types, price, availability, action state, and clear CTA: `Book Ticket`.
- Use simple metadata rows: 📅 Date, ⏰ Time, 📍 Venue, 🎟️ Tickets.

Preserve:

- `useQueryEventDetailPublic`
- access code flow
- `handleBuyTicket`
- free ticket, eSewa, and Khalti logic
- login redirect behavior
- existing ticket data shape

Acceptance checks:

- Protected event access code still works.
- Free ticket issue still refetches event.
- Khalti/eSewa redirects still work.
- Sold-out or unavailable tickets disable booking clearly.
- Navbar remains readable on first viewport.

## 2. Blogs Page

Target file:

- `frontend/src/app/(site)/blogs/page.jsx`

Layout direction: editorial guide.

- Replace equal card grid with editorial structure.
- Header: `Stories, Guides & Event Tips`.
- Show first article as featured if articles exist.
- Show remaining articles as clean rows or lightweight cards.
- Keep category chips only if data already supports categories. Otherwise avoid fake filters.
- Add polished loading, error, and empty states.

Preserve:

- `useQueryBlogsPublic`
- blog handle/query behavior
- `/blogs/:articleHandle` navigation
- existing article image/title/excerpt/date shape

Acceptance checks:

- Empty blog list shows `📝 No articles published yet`.
- Article links still navigate correctly.
- No extra API filtering is introduced.

## 3. Blog Detail Page

Target file:

- `frontend/src/app/(site)/blogs/[articleHandle]/page.jsx`

Layout direction: calm reading page.

- Use readable article width, strong title, metadata, and large image if available.
- Keep content focused and quiet, not landing-page styled.
- Add bottom CTA to `Explore Venues` or `Browse Events`.
- Show latest/related articles only if current data exists.

Preserve:

- article handle route
- current fetch logic
- rich text/content rendering

Acceptance checks:

- Article content still renders safely.
- Missing article shows friendly not-found state.
- Images have useful alt text.

## 4. About Page

Target file:

- `frontend/src/app/(site)/about/page.jsx`

Layout direction: local trust page.

- Hero headline: `Designed for meaningful events in Waling.`
- Use warm intro copy about families, businesses, organizers, weddings, parties, meetings, and support.
- Sections: story, 🎯 mission, what we offer, why people choose us, trust numbers, event types, CTA.
- Keep existing stats unless they are clearly unsupported. Do not invent new numbers.
- Use restrained visual blocks, not oversized decorative cards.

Acceptance checks:

- CTA links to contact and venues.
- Content feels specific to Shubham Venue, not generic luxury copy.
- Navbar spacing remains safe.

## 5. Contact Page

Target file:

- `frontend/src/app/(site)/contact/page.jsx`

Layout direction: enquiry page.

- Desktop: two columns with contact info/support categories on left and form on right.
- Mobile: intro, form, then contact details.
- Form fields: name, email, enquiry type, message.
- Enquiry types: Venue booking, Ticket support, Event planning, Organizer enquiry, Other.
- Use clear button text: `Send Message`.
- Use professional support rows: 📍 Address, 📞 Phone, 📩 Email, ⏰ Hours.

Preserve:

- any existing form submit logic if present
- existing contact data only; do not invent new phone/email values

Acceptance checks:

- Inputs have labels and focus states.
- Success/error states use human copy.
- No fake map SDK load is added unless already supported.

## 6. My Tickets Page

Target file:

- `frontend/src/app/(site)/tickets/page.jsx`

Layout direction: customer ticket dashboard.

- Replace dramatic luxury header with practical account dashboard header.
- Use tabs or segmented controls for ticket status: All, Active, Cancelled, Refunded.
- Show tickets as scannable rows/cards with event name, date, venue, ticket type, status, QR/entry code, and actions.
- Keep QR visible but not oversized on desktop; mobile should stack cleanly.
- Empty state: `🎟️ No tickets yet`, with `Browse Events` CTA.

Preserve:

- `useQueryTicketsMy`
- status filter behavior
- QR rendering
- QR download
- copy entry code
- refresh behavior

Acceptance checks:

- QR download still works.
- Clipboard copy still works.
- Status filter still refetches/filters correctly.
- Footer remains hidden as currently configured for `/tickets`.

## 7. My Profile Page

Target file:

- `frontend/src/app/(site)/profile/page.jsx`

Layout direction: account settings.

- Use a profile summary header with avatar/initials, name, email, and role.
- Group content into personal information, avatar, security, and account actions.
- Keep forms clean with visible labels and field-level errors.
- Show missing field hints, for example phone number helper text.
- Keep password modal simple and readable.

Preserve:

- `useQueryProfileMy`
- profile update mutation
- password update mutation
- avatar upload URL flow
- direct S3 upload and avatar confirm
- auth context update
- logout behavior

Acceptance checks:

- Profile update still updates React Query and auth user.
- Avatar upload still validates file type and size.
- Password validation still uses existing utility.
- Footer remains hidden as currently configured for `/profile`.

## 8. Organizer Dashboard

Target file:

- `frontend/src/app/organizer-hub/page.jsx`

Layout direction: practical organizer command center.

- Keep organizer application/status flow intact.
- Approved organizers see welcome header, create event CTA, metrics, recent events, recent bookings, and trust/reputation if available.
- Non-approved users see a clean application/status panel with clear next step.
- Use measured dashboard cards, not flashy SaaS gradients.

Preserve:

- `useQueryOrganizerStatus`
- `useQueryOrganizerEvents`
- `useQueryOrganizerBookings`
- `useQueryOrganizerAnalytics`
- `useQueryOrganizerReputation`
- organizer request mutation
- existing `ROUTES.SITE.ORGANIZER_EVENT_NEW`

Acceptance checks:

- Pending/rejected/approved states still render correctly.
- Application submission still invalidates status query.
- Organizer layout/sidebar remains intact.

## 9. Organizer Events Page

Target file:

- `frontend/src/app/organizer-hub/events/page.jsx`

Layout direction: event management table/list.

- Desktop: table with event title, date, venue, status, tickets sold if available, and actions.
- Mobile: stacked cards with the same information.
- Add search/filter UI only if backed by existing local state or API params.
- Empty state: `Create your first event`.

Preserve:

- event query hook
- existing actions/routes for view, edit, attendees, tickets, delete/cancel if supported
- existing status logic

Acceptance checks:

- Existing event actions still navigate.
- Mobile has no horizontal table overflow.
- Status badges use readable text, not color only.

## 10. Organizer Create/Edit Event Form

Target files:

- `frontend/src/app/organizer-hub/events/new/page.jsx`
- `frontend/src/components/organizer/ProfessionalEventForm.jsx`

Layout direction: guided event setup.

- Organize form into sections: basic details, date/time, venue/location, tickets/pricing, image/media, description, preview/publish.
- Use progressive section spacing, not one huge form wall.
- Keep helper text short and practical.
- Upload area should explain image use: listing and event detail banner.

Preserve:

- existing fields
- validation
- create/update mutations
- image upload behavior
- status/draft/publish behavior if present

Acceptance checks:

- Form still submits with existing payload.
- Validation errors appear near fields.
- Existing image upload and preview still work.

## 11. Organizer Event Management Page

Target files:

- `frontend/src/app/organizer-hub/events/[eventId]/page.jsx`
- `frontend/src/components/organizer/event-detail/*`

Layout direction: event operations page.

- Header with event name, status, date, and quick actions.
- Dashboard-like sections: overview, metrics, ticket inventory, guest manifest, entry/check-in, cancellations.
- Keep operational tools visually clear and separated.
- Use table/list hybrid for guests and tickets.

Preserve:

- event detail query and mutations
- QR/check-in logic
- guest detail modal
- ticket inventory logic
- cancellation tools
- current component exports in `event-detail/index.js`

Acceptance checks:

- Guest modal still opens.
- Check-in tools still work.
- Cancellation flow still preserves confirmations and permissions.
- Mobile layout avoids squeezed tables.

## 12. Organizer Analytics Page

Target file:

- `frontend/src/app/organizer-hub/analytics/page.jsx`

Layout direction: calm reporting dashboard.

- Show summary metrics first.
- Then show event performance, ticket sales, and booking trends if data exists.
- Revenue appears only if backend already provides it.
- Empty state should explain that analytics appear after events receive bookings.

Preserve:

- existing analytics query hooks and data shape
- organizer auth/eligibility behavior

Acceptance checks:

- No fake revenue or invented analytics values.
- Loading state uses skeleton metrics.
- Empty state is useful for new organizers.

## 13. Organizer Settings Page

Target file:

- `frontend/src/app/organizer-hub/settings/page.jsx`

Layout direction: organizer account settings.

- Sections: organizer profile, public details, contact information, account/security, preferences if supported.
- Keep form groups compact and readable.
- Use clear save/cancel actions.

Preserve:

- existing settings fetch/update logic
- current user/organizer permissions
- any existing avatar/logo upload flow

Acceptance checks:

- Settings save still calls the same API.
- Field errors remain visible.
- Layout works in organizer shell on mobile and desktop.

## Shared Component Opportunities

Create small shared components only if they reduce real duplication:

- `StatusBadge`
- `PageIntro`
- `EmptyState`
- `SkeletonRow`
- `FormSection`
- `MetricCard`

Keep shared components local to the area if they are not needed globally. Do not rewrite the whole design system.

## Testing Checklist

After each page:

- Check desktop, tablet, and mobile.
- Confirm navbar/header is unchanged on public pages.
- Confirm organizer sidebar/top nav is unchanged on organizer pages.
- Confirm auth redirects still work.
- Confirm API hooks still use the same params.
- Confirm forms still submit.
- Confirm buttons have `cursor-pointer` and disabled buttons use `cursor-not-allowed`.
- Confirm loading, empty, and error states render.
- Run `git diff --check`.

Final checks:

- Run frontend lint when `eslint-plugin-react-hooks` dependency is available.
- Run frontend build when local sandbox/server permissions allow it.
