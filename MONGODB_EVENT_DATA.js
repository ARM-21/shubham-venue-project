

[
    {
  organizerId: ObjectId("69709ea0ee70c8d5a8581b21"),
  bookingId: ObjectId("507f1f77bcf86cd799439011"),
  hallId: ObjectId("507f1f77bcf86cd799439021"),
  name: "The Grand Wedding 2024",
  type: "Destination Wedding",
  description: "Celebrate the union of two families in a luxurious setting. This elegant wedding includes a grand reception, traditional ceremonies, and premium catering for 300 guests.",
  isPublic: true,
  accessCode: null,
  bannerUrl: "https://images.unsplash.com/photo-1519741497674-611481863552",
  
  // Core Event Timing
  startDateTime: new Date("2024-12-15T18:00:00Z"),
  endDateTime: new Date("2024-12-16T02:00:00Z"),
  eventDate: new Date("2024-12-15"),
  
  // Registration Period
  registrationStartDate: new Date("2024-10-15"),
  registrationEndDate: new Date("2024-12-01"),
  
  // Professional Event Details
  eventCategory: "WEDDING",
  tags: ["luxury", "wedding", "celebration", "family", "formal"],
  maxAttendees: 350,
  expectedAttendees: 300,
  targetAudience: "Families, relatives, close friends of bride and groom",
  dressCode: "black_tie",
  ageRestriction: "All ages welcome",
  
  // Services & Requirements
  catering: true,
  decoration: true,
  requiresTicket: false,
  specialRequirements: "Vegetarian and non-vegetarian catering. Wheelchair accessible. Prayer room available.",
  
  // Location
  location: {
    city: "Kathmandu",
    state: "Bagmati",
    country: "Nepal",
    coordinates: {
      latitude: 27.7172,
      longitude: 85.3240
    }
  },
  
  // Additional Details
  additionalDetails: {
    "photography_allowed": "Yes",
    "videography_allowed": "Yes",
    "gift_registry": "https://example.com/wedding-registry",
    "dress_code_details": "Formal evening attire",
    "parking": "Free valet parking available"
  },
  
  status: "PUBLISHED",
  createdAt: new Date("2024-09-15T10:00:00Z"),
  updatedAt: new Date("2024-09-15T10:00:00Z")
},
    {
  organizerId: ObjectId("69709ea0ee70c8d5a8581b21"),
  bookingId: ObjectId("507f1f77bcf86cd799439012"),
  hallId: ObjectId("507f1f77bcf86cd799439022"),
  name: "TechInnovate 2024 - Annual Conference",
  type: "Professional Conference",
  description: "Join industry leaders and innovators at TechInnovate 2024. Three days of keynote presentations, panel discussions, networking sessions, and hands-on workshops covering AI, cloud computing, and digital transformation.",
  isPublic: true,
  accessCode: null,
  bannerUrl: "https://images.unsplash.com/photo-1540575467063-178f50002cbc",
  
  // Core Event Timing
  startDateTime: new Date("2024-11-20T08:30:00Z"),
  endDateTime: new Date("2024-11-22T18:00:00Z"),
  eventDate: new Date("2024-11-20"),
  
  // Registration Period
  registrationStartDate: new Date("2024-09-01"),
  registrationEndDate: new Date("2024-11-15"),
  
  // Professional Event Details
  eventCategory: "CONFERENCE",
  tags: ["technology", "innovation", "networking", "conference", "professional"],
  maxAttendees: 1000,
  expectedAttendees: 850,
  targetAudience: "Tech professionals, CIOs, CTOs, software engineers, IT managers",
  dressCode: "business",
  ageRestriction: "18+",
  
  // Services & Requirements
  catering: true,
  decoration: false,
  requiresTicket: true,
  specialRequirements: "WiFi 1Gbps required. High-speed internet for presentations. Sound system with simultaneous translation for 3 languages.",
  
  // Location
  location: {
    city: "Kathmandu",
    state: "Bagmati",
    country: "Nepal",
    coordinates: {
      latitude: 27.7245,
      longitude: 85.3270
    }
  },
  
  // Additional Details
  additionalDetails: {
    "number_of_tracks": "5",
    "total_sessions": "45",
    "keynote_speakers": "8",
    "workshop_capacity": "50 per session",
    "certificate_provided": "Yes",
    "networking_lunch": "Daily",
    "after_party": "Evening of Day 1"
  },
  
  status: "PUBLISHED",
  createdAt: new Date("2024-08-01T09:00:00Z"),
  updatedAt: new Date("2024-08-15T14:30:00Z")
}
    ,{
  organizerId: ObjectId("507f1f77bcf86cd799439003"),
  bookingId: ObjectId("507f1f77bcf86cd799439013"),
  hallId: ObjectId("507f1f77bcf86cd799439023"),
  name: "XYZ Corp Annual Leadership Summit",
  type: "Executive Retreat",
  description: "Exclusive leadership summit for company executives and senior managers. Focus on strategic planning, team building, and company vision for the next fiscal year.",
  isPublic: false,
  accessCode: "XYZCORP2024",
  bannerUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978",
  
  // Core Event Timing
  startDateTime: new Date("2025-01-10T09:00:00Z"),
  endDateTime: new Date("2025-01-12T17:00:00Z"),
  eventDate: new Date("2025-01-10"),
  
  // Registration Period
  registrationStartDate: new Date("2024-12-01"),
  registrationEndDate: new Date("2025-01-05"),
  
  // Professional Event Details
  eventCategory: "CORPORATE",
  tags: ["executive", "private", "leadership", "strategy", "team-building"],
  maxAttendees: 150,
  expectedAttendees: 140,
  targetAudience: "Company executives, directors, senior management (Invitation only)",
  dressCode: "business_casual",
  ageRestriction: "21+",
  
  // Services & Requirements
  catering: true,
  decoration: true,
  requiresTicket: false,
  specialRequirements: "Confidential event - NDA required. Private conference room with breakout areas. Secure WiFi network.",
  
  // Location
  location: {
    city: "Kathmandu",
    state: "Bagmati",
    country: "Nepal",
    coordinates: {
      latitude: 27.7190,
      longitude: 85.3250
    }
  },
  
  // Additional Details
  additionalDetails: {
    "invitations_sent": "150",
    "confidentiality_level": "High",
    "agenda_type": "Strategic Planning",
    "breakout_sessions": "3",
    "gala_dinner": "Day 1 Evening",
    "team_activities": "Yes"
  },
  
  status: "DRAFT",
  createdAt: new Date("2024-11-01T10:00:00Z"),
  updatedAt: new Date("2024-11-20T16:30:00Z")
},

    {
  organizerId: ObjectId("69709ea0ee70c8d5a8581b21"),
  bookingId: ObjectId("507f1f77bcf86cd799439016"),
  hallId: ObjectId("507f1f77bcf86cd799439026"),
  name: "Charity Gala Night - Build Our Future",
  type: "Charitable Fundraiser",
  description: "Elegant gala dinner and fundraiser supporting the Build Our Future charity. Proceeds go towards education initiatives for underprivileged children. Includes silent auction, live entertainment, and special dinner.",
  isPublic: true,
  accessCode: null,
  bannerUrl: "https://images.unsplash.com/photo-1519671482677-e2e5d5ffc84f",
  
  // Core Event Timing
  startDateTime: new Date("2025-03-22T19:00:00Z"),
  endDateTime: new Date("2025-03-23T00:30:00Z"),
  eventDate: new Date("2025-03-22"),
  
  // Registration Period
  registrationStartDate: new Date("2025-02-01"),
  registrationEndDate: new Date("2025-03-17"),
  
  // Professional Event Details
  eventCategory: "FUNDRAISER",
  tags: ["charity", "fundraiser", "gala", "education", "community"],
  maxAttendees: 300,
  expectedAttendees: 280,
  targetAudience: "Philanthropists, donors, supporters of education, corporate executives",
  dressCode: "black_tie",
  ageRestriction: "16+",
  
  // Services & Requirements
  catering: true,
  decoration: true,
  requiresTicket: true,
  specialRequirements: "Silent auction setup. Security for high-value items. Professional MC. Live band.",
  
  // Location
  location: {
    city: "Kathmandu",
    state: "Bagmati",
    country: "Nepal",
    coordinates: {
      latitude: 27.7165,
      longitude: 85.3245
    }
  },
  
  // Additional Details
  additionalDetails: {
    "silent_auction_items": "50+",
    "live_entertainment": "Band + Singer",
    "charity_partner": "Build Our Future NGO",
    "minimum_donation": "NPR 5000",
    "tax_deductible": "Yes",
    "funds_target": "NPR 1,000,000"
  },
  
  status: "PUBLISHED",
  createdAt: new Date("2025-01-01T10:00:00Z"),
  updatedAt: new Date("2025-01-15T12:00:00Z")
},{
  organizerId: ObjectId("507f1f77bcf86cd799439005"),
  bookingId: ObjectId("507f1f77bcf86cd799439015"),
  hallId: ObjectId("507f1f77bcf86cd799439025"),
  name: "Digital Marketing Masterclass 2025",
  type: "Professional Training",
  description: "Comprehensive one-day seminar covering the latest trends in digital marketing. Topics include social media strategy, content marketing, SEO, analytics, and paid advertising.",
  isPublic: true,
  accessCode: null,
  bannerUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978",
  
  // Core Event Timing
  startDateTime: new Date("2025-02-15T09:00:00Z"),
  endDateTime: new Date("2025-02-15T17:00:00Z"),
  eventDate: new Date("2025-02-15"),
  
  // Registration Period
  registrationStartDate: new Date("2025-01-15"),
  registrationEndDate: new Date("2025-02-10"),
  
  // Professional Event Details
  eventCategory: "EDUCATIONAL",
  tags: ["training", "marketing", "digital", "education", "professional-development"],
  maxAttendees: 200,
  expectedAttendees: 180,
  targetAudience: "Marketing professionals, business owners, entrepreneurs, marketing students",
  dressCode: "casual",
  ageRestriction: null,
  
  // Services & Requirements
  catering: true,
  decoration: false,
  requiresTicket: true,
  specialRequirements: "Laptops recommended. WiFi required. Presentation slides and materials will be provided.",
  
  // Location
  location: {
    city: "Kathmandu",
    state: "Bagmati",
    country: "Nepal",
    coordinates: {
      latitude: 27.7175,
      longitude: 85.3255
    }
  },
  
  // Additional Details
  additionalDetails: {
    "course_modules": "6",
    "duration_hours": "8",
    "lunch_included": "Yes",
    "certificates": "Yes",
    "course_materials": "Digital PDF",
    "lifetime_access_to_recordings": "Yes",
    "follow_up_sessions": "3 online sessions"
  },
  
  status: "DRAFT",
  createdAt: new Date("2024-12-01T09:00:00Z"),
  updatedAt: new Date("2024-12-10T14:00:00Z")
}, {
  organizerId: ObjectId("507f1f77bcf86cd799439004"),
  bookingId: ObjectId("507f1f77bcf86cd799439014"),
  hallId: ObjectId("507f1f77bcf86cd799439024"),
  name: "SmartHome Pro 2024 - Product Launch",
  type: "Product Presentation",
  description: "Unveiling the next-generation SmartHome Pro device. Live demonstrations, hands-on experience, exclusive preview for media partners and industry analysts.",
  isPublic: true,
  accessCode: null,
  bannerUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
  
  // Core Event Timing
  startDateTime: new Date("2024-12-20T16:00:00Z"),
  endDateTime: new Date("2024-12-20T21:00:00Z"),
  eventDate: new Date("2024-12-20"),
  
  // Registration Period
  registrationStartDate: new Date("2024-11-20"),
  registrationEndDate: new Date("2024-12-18"),
  
  // Professional Event Details
  eventCategory: "PRODUCT_LAUNCH",
  tags: ["launch", "technology", "product", "innovation", "networking"],
  maxAttendees: 500,
  expectedAttendees: 450,
  targetAudience: "Media, tech journalists, industry analysts, investors, early adopters",
  dressCode: "business_casual",
  ageRestriction: null,
  
  // Services & Requirements
  catering: true,
  decoration: true,
  requiresTicket: true,
  specialRequirements: "High-tech presentation setup. Product display stations. Photo and video opportunities. Press release area.",
  
  // Location
  location: {
    city: "Kathmandu",
    state: "Bagmati",
    country: "Nepal",
    coordinates: {
      latitude: 27.7200,
      longitude: 85.3260
    }
  },
  
  // Additional Details
  additionalDetails: {
    "live_streaming": "Yes",
    "media_passes": "Available",
    "product_demo_stations": "10",
    "vip_preview": "4:00 PM - 5:00 PM",
    "public_event": "5:30 PM onwards",
    "press_conference": "5:00 PM"
  },
  
  status: "PUBLISHED",
  createdAt: new Date("2024-10-15T11:00:00Z"),
  updatedAt: new Date("2024-10-25T13:45:00Z")
}
]
