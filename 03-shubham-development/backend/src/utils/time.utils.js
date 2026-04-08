/**
 * Format hour to 12-hour format with AM/PM
 * @param {number} hour - Hour (0-23)
 * @returns {string} - e.g., "5:00 PM", "9:00 AM"
 */
export function formatHourTo12(hour) {
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${meridiem}`;
}

/**
 * Format time range to 12-hour format
 * @param {number} startHour - Start hour (0-23)
 * @param {number} endHour - End hour (0-23)
 * @returns {string} - e.g., "9:00 AM to 5:00 PM"
 */
export function formatTimeRange(startHour, endHour) {
  return `${formatHourTo12(startHour)} to ${formatHourTo12(endHour)}`;
}
