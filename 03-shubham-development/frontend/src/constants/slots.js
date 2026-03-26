// Booking slot time definitions
export const SLOT_TIMES = {
  morning: {
    label: 'Morning',
    startHour: 9,
    endHour: 13,
    display: '9:00 AM - 1:00 PM'
  },
  evening: {
    label: 'Evening',
    startHour: 17,
    endHour: 21,
    display: '5:00 PM - 9:00 PM'
  },
  wholeday: {
    label: 'Full Day',
    startHour: 9,
    endHour: 21,
    display: '9:00 AM - 9:00 PM'
  },
  fullday: { // Alias for wholeday
    label: 'Full Day',
    startHour: 9,
    endHour: 21,
    display: '9:00 AM - 9:00 PM'
  }
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
