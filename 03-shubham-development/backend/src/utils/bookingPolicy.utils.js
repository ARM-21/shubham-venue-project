import { httpError } from "./http.utils.js";

export const BOOKING_TIME_ZONE = "Asia/Kathmandu";
export const BLOCKING_BOOKING_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED"];
export const CUSTOMER_LEAD_TIME_DAYS = 1;
export const CUSTOMER_LEAD_TIME_MESSAGE = "Bookings must be made at least 1 day in advance.";

export const BOOKING_SLOT_DEFINITIONS = {
  morning: {
    label: "Morning",
    display: "07:00 AM - 12:00 PM",
    startHour: 7,
    endHour: 12,
    priceMultiplier: 5,
  },
  afternoon: {
    label: "Afternoon",
    display: "01:00 PM - 06:00 PM",
    startHour: 13,
    endHour: 18,
    priceMultiplier: 5,
  },
  evening: {
    label: "Evening",
    display: "07:00 PM - 10:30 PM",
    startHour: 19,
    endHour: 22.5,
    priceMultiplier: 3.5,
  },
  wholeday: {
    label: "Whole Day",
    display: "07:00 AM - 10:30 PM",
    startHour: 7,
    endHour: 22.5,
    priceMultiplier: 15.5,
  },
};

export const BOOKING_SLOTS = Object.keys(BOOKING_SLOT_DEFINITIONS);

export function assertValidSlot(slot) {
  if (!BOOKING_SLOTS.includes(slot)) {
    throw httpError(400, "slot must be morning|afternoon|evening|wholeday");
  }
}

export function getSlotPriceMultiplier(slot) {
  assertValidSlot(slot);
  return BOOKING_SLOT_DEFINITIONS[slot].priceMultiplier;
}

export function getConflictSlots(slot) {
  assertValidSlot(slot);
  if (slot === "wholeday") return ["morning", "afternoon", "evening", "wholeday"];
  return [slot, "wholeday"];
}

export function getKathmanduDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function addDaysToDateString(yyyyMmDd, days) {
  const [year, month, day] = String(yyyyMmDd).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getMinimumCustomerBookingDate(now = new Date()) {
  return addDaysToDateString(getKathmanduDateString(now), CUSTOMER_LEAD_TIME_DAYS);
}

export function validateCustomerBookingDate(dateValue, now = new Date()) {
  if (!dateValue || typeof dateValue !== "string") {
    throw httpError(400, "date is required (yyyy-mm-dd)");
  }

  const range = utcDayRange(dateValue);
  if (!range) throw httpError(400, "Invalid date format, use yyyy-mm-dd");

  const today = getKathmanduDateString(now);
  const minimumDate = getMinimumCustomerBookingDate(now);

  if (dateValue < today) {
    return {
      blocked: true,
      reason: "PAST_DATE",
      message: "Past dates cannot be booked.",
      minimumDate,
    };
  }

  if (dateValue < minimumDate) {
    return {
      blocked: true,
      reason: "LEAD_TIME_REQUIRED",
      message: CUSTOMER_LEAD_TIME_MESSAGE,
      minimumDate,
    };
  }

  return { blocked: false, minimumDate };
}

export function utcDayRange(yyyyMmDd) {
  const start = new Date(`${yyyyMmDd}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) return null;

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}
