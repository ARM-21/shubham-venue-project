// Booking slot time definitions
export const SLOT_TIMES = {
  morning: {
    label: 'Morning',
    startHour: 7,
    endHour: 12,
    display: '07:00 AM - 12:00 PM'
  },
  afternoon: {
    label: 'Afternoon',
    startHour: 13,
    endHour: 18,
    display: '01:00 PM - 06:00 PM'
  },
  evening: {
    label: 'Evening',
    startHour: 19,
    endHour: 22.5,
    display: '07:00 PM - 10:30 PM'
  },
  wholeday: {
    label: 'Whole Day',
    startHour: 7,
    endHour: 22.5,
    display: '07:00 AM - 10:30 PM'
  },
  fullday: { // Alias for wholeday
    label: 'Whole Day',
    startHour: 7,
    endHour: 22.5,
    display: '07:00 AM - 10:30 PM'
  }
};

export const BOOKING_LEAD_TIME_MESSAGE = 'Bookings must be made at least 1 day in advance.';

export const SLOT_LABELS = {
  morning: 'Morning (07:00 AM - 12:00 PM)',
  afternoon: 'Afternoon (01:00 PM - 06:00 PM)',
  evening: 'Evening (07:00 PM - 10:30 PM)',
  wholeday: 'Whole Day (07:00 AM - 10:30 PM)',
};

function getKathmanduDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDaysToDateString(yyyyMmDd, days) {
  const [year, month, day] = String(yyyyMmDd).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export const getMinimumCustomerBookingDate = (now = new Date()) => {
  return addDaysToDateString(getKathmanduDateString(now), 1);
};

export const getSlotDisplay = (slot) => {
  return SLOT_TIMES[slot]?.display || 'Time not specified';
};

export const getSlotTimeRange = (slot) => {
  const slotInfo = SLOT_TIMES[slot];
  if (!slotInfo) return null;
  return {
    start: slotInfo.startHour,
    end: slotInfo.endHour,
    display: slotInfo.display
  };
};
