# Shubham Venue: A Comprehensive Event & Venue Management Ecosystem

**Shubham Venue** is a full-stack digital solution designed to modernize the traditional, manual process of venue booking and event management. This project represents a significant personal milestone, evolving from a core booking engine into a multi-platform ecosystem that serves customers, administrators, event organizers, and on-ground staff.

The platform is live and showcased as part of my portfolio at [manojn.com.np/projects](https://manojn.com.np/projects).

---

## 🚀 The Platform Journey: A Detailed Evolution

The development of Shubham Venue followed an **Incremental Model**, ensuring each phase was stable and functional before expanding the scope.

### Phase 1: The Foundation (Core Booking & Auth)
The journey began with solving the most critical problem: **Availability and Trust**. 
*   **Secure Entry:** Implemented a dual-authentication system. While traditional email/password was secured with **Bcrypt** hashing, I integrated **Google OAuth 2.0** to provide a frictionless and secure entry point for users.
*   **The Booking Engine:** Developed a real-time availability calendar. Unlike static forms, this engine checks the database for conflicts instantly, ensuring no double-bookings.
*   **User Experience:** Focused on a multi-step booking flow that guides users through venue selection, guest capacity, and catering preferences, making a complex process feel simple.

### Phase 2: The Command Center (Admin & Payments)
To transform the tool into a business-ready platform, I focused on **Operations and Revenue**.
*   **Financial Trust:** Integrated **Esewa** and **Khalti**, the leading payment gateways in Nepal. This involved complex server-side verification to ensure transactions are legitimate before confirming bookings.
*   **Automated Logistics:** Developed a dynamic **PDF Invoicing** system using `pdfkit`. Every successful payment triggers the generation of a professional invoice, sent automatically via email.
*   **Administrative Oversight:** Built a comprehensive dashboard for managing the "behind-the-scenes"—from approving venue listings to monitoring system-wide analytics and revenue trends.

### Phase 3: The Event Lifecycle (Organizers & Ticketing)
The final evolution was expanding from *private bookings* to *public events*.
*   **Organizer Ecosystem:** Created a workflow where users can apply to become organizers. Once approved, they gain access to a suite of tools to host concerts, weddings, or seminars.
*   **The Ticketing Engine:** Built a robust system that generates unique, cryptographically secure **QR Codes** for every ticket. 
*   **Bridging Digital & Physical:** Developed the **Staff Scanner App**. This was the "missing link"—a mobile tool for on-ground staff to scan tickets at the door, preventing fraud and duplicate entries in real-time.

---

## 📂 Project Architecture & Security

The system is built using a **Monorepo-style architecture**, ensuring a clean separation of concerns while maintaining a unified business logic.

```text
.
├── backend/                # Node.js & Express API (The Brain)
│   ├── src/                # Core logic, controllers, and models
│   ├── ONBOARDING_...      # Internal documentation for backend changes
│   └── package.json        # Backend dependencies (Bcrypt, Mongoose, PDFKit)
├── frontend/               # Next.js Web Application (The Face)
│   ├── src/                # React components, hooks, and pages
│   ├── public/             # Static assets and icons
│   └── next.config.mjs     # Next.js configuration
└── qr-scanner/             # React Native / Expo App (The Hands)
    ├── app/                # Expo Router based mobile navigation
    ├── components/         # Mobile-specific UI elements
    └── package.json        # Mobile dependencies (Expo Camera, Secure Store)
```

### 🛡️ Security: Protecting the Ecosystem
A primary focus during development was ensuring the system is secure and secrets are never exposed.

*   **Environment Isolation:** All sensitive credentials—including **MongoDB URIs**, **AWS S3 Keys**, **OAuth Secrets**, and **Payment Gateway API Keys**—are stored in strictly ignored `.env` files. They are never committed to version control.
*   **Role-Based Access Control (RBAC):** The backend enforces strict middleware checks. A "Customer" cannot access "Admin" routes, and "Staff" can only access the scanning endpoints.
*   **Data Protection:** 
    *   **Passwords:** Never stored in plain text; always hashed using **Bcrypt** with a high salt-round count.
    *   **Secure Storage:** On the mobile app, sensitive session tokens are stored using `expo-secure-store`, which utilizes hardware-level encryption (Keychain/Keystore).
*   **Input Validation:** All API endpoints use strict validation to prevent NoSQL injection and Cross-Site Scripting (XSS) attacks.

---

## 🛠️ Technical Stack

| Layer | Technology | Key Libraries |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (React 19) | Tailwind CSS, Framer Motion, TanStack Query, Tiptap |
| **Backend** | Node.js (Express 5) | Mongoose, Bcrypt, PDFKit, Multer (S3), Nodemailer |
| **Mobile** | React Native (Expo 54) | Expo Camera, Expo Secure Store, React Navigation |
| **Database** | MongoDB | Mongoose ODM for structured data modeling |
| **Cloud** | AWS S3 | Secure media storage for venue images and banners |

---

## ✨ Key Features & Milestones

### 🏢 For Customers
*   **Dynamic Discovery:** Filter venues by category, price, and amenities.
*   **Rich Content:** View venues with high-quality images and interactive maps.
*   **Seamless Payments:** Pay via local gateways and receive instant confirmation.

### 👑 For Administrators
*   **Analytics Suite:** Visual charts for revenue, user growth, and booking trends.
*   **Content Moderation:** Full CRUD control over the platform's listings and users.
*   **System Health:** Real-time notifications for critical system events.

### 🎤 For Event Organizers
*   **Markdown Support:** Create beautiful event descriptions with rich-text editing.
*   **Inventory Control:** Set ticket limits and tiers (VIP/General) to prevent overselling.
*   **Data Export:** Download attendee lists in CSV format for external management.

### 📱 For On-Ground Staff
*   **High-Speed Scanning:** Optimized camera integration for rapid ticket validation.
*   **Offline-Ready Logic:** Local scan history to track entries even with intermittent connectivity.
*   **Manual Fallback:** Secure manual entry for damaged QR codes.

---

*This project is a private milestone developed by **Manoj Neupane**. For inquiries or collaborations, please visit [manojn.com.np](https://manojn.com.np).*
