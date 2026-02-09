export const ROUTES = {
  HOME: '/',
  AUTH: {
    ROOT: '/auth',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin',
    BOOKINGS: '/admin/bookings',
    HALLS: '/admin/halls',
    USERS: '/admin/users',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings',
  },
  SITE: {
    BOOKINGS: '/bookings',
    VENUES: (slug) => (slug ? `/venues/${slug}` : '/venues'),
    VENUE_BOOK: (slug) => `/venues/${slug}/book`,
    MENUS: '/menus',
    MENU_DETAILS: (slug) => `/menus/${slug}`,
    SEARCH_AVAILABILITY: (slug) => (slug ? `/search-availability/${slug}` : '/search-availability'),
    PROFILE: '/profile',
    PAYMENT_VERIFY: '/payment/verify',
  },
  API: {
    AUTH: {
      LOGIN: '/api/v1/auth/login',
      LOGOUT: '/api/v1/auth/logout',
      REGISTER: '/api/v1/auth/register',
      VERIFY_OTP: '/api/v1/auth/verify-otp',
      RESEND_OTP: '/api/v1/auth/resend-otp',
      GOOGLE_LOGIN: '/api/v1/auth/google/login',
    },
    PROFILE: {
      ME: '/api/v1/profile/me',
      UPDATE: '/api/v1/profile/me',
      PASSWORD: '/api/v1/profile/password',
      AVATAR_UPLOAD_URL: '/api/v1/profile/me/avatar/upload-url',
      AVATAR_CONFIRM: '/api/v1/profile/me/avatar/confirm',
    },
    BOOKINGS: {
      ROOT: '/api/v1/bookings',
      RESERVE: '/api/v1/bookings/reserve',
      RESERVE_BY_ID: (id) => `/api/v1/bookings/reserve/${id}`,
      MINE: '/api/v1/bookings/my',
    },
    MENUS: {
      ROOT: '/api/v1/menus',
      BY_SLUG: (slug) => `/api/v1/menus/${slug}`,
    },
    DISHES: {
      ROOT: '/api/v1/dishes',
    },
    HALLS: {
      ROOT: '/api/v1/halls',
      BY_SLUG: (slug) => `/api/v1/halls/${slug}`,
      AVAILABILITY: '/api/v1/halls/availability',
      BY_ID_AVAILABILITY: (id) => `/api/v1/halls/${id}/availability`,
    },
    PAYMENTS: {
      INITIATE: '/api/v1/payments/initiate',
    },
  },
};