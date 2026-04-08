/**
 * Calculate the hour multiplier for a given slot
 * Used for pricing calculation: hallPrice = pricePerHour * multiplier
 * 
 * Slot times:
 * - Morning: 7 AM - 12 PM (5 hours)
 * - Afternoon: 1 PM - 6 PM (5 hours)
 * - Evening: 7 PM - 10:30 PM (3.5 hours)
 * - Whole Day: 7 AM - 10:30 PM (15.5 hours)
 */
export const getSlotMultiplier = (slot) => {
  switch (slot) {
    case 'morning':
      return 5;
    case 'afternoon':
      return 5;
    case 'evening':
      return 3.5;
    case 'wholeday':
      return 15.5;
    default:
      return 5;
  }
};

/**
 * Calculate hall price based on pricePerHour and slot
 */
export const calculateHallPrice = (pricePerHour, slot) => {
  const multiplier = getSlotMultiplier(slot);
  return (Number(pricePerHour) || 0) * multiplier;
};
