import Hall from "../../models/Hall.js";
import Booking from "../../models/Booking.js";
import { httpError } from "../../utils/http.utils.js";
import {
  BLOCKING_BOOKING_STATUSES,
  BOOKING_SLOTS,
  CUSTOMER_LEAD_TIME_MESSAGE,
  getConflictSlots,
  utcDayRange,
  validateCustomerBookingDate,
} from "../../utils/bookingPolicy.utils.js";


export async function listHalls(query = {}) {
  const filter = { isDeleted: false, isActive: true };

  if (query.city) filter["location.city"] = query.city;
  if (query.minCapacity) filter.capacity = { $gte: Number(query.minCapacity) };

  const halls = await Hall.find(filter).select("-__v").sort({ createdAt: -1 });
  return halls;
}

export async function getHallBySlug(slug) {
  if (!slug) throw httpError(400, "Hall slug is required");

  const hall = await Hall.findOne({ slug, isDeleted: false });

  if (!hall || hall.isActive === false) {
    throw httpError(404, "Hall not found");
  }

  return hall;
}

export async function getHallById(hallId) {
  if (!hallId) throw httpError(400, "Hall ID is required");

  const hall = await Hall.findById(hallId).select("-__v");

  if (!hall || hall.isActive === false || hall.isDeleted === true) {
    throw httpError(404, "Hall not found");
  }

  return hall;
}

export async function checkHallAvailability({ hallId, date, slot, guests }) {
  if (!date || typeof date !== "string") throw httpError(400, "date is required (yyyy-mm-dd)");
  if (!slot) throw httpError(400, "slot is required");
  if (!Number.isFinite(Number(guests)) || Number(guests) < 1) throw httpError(400, "guests must be >= 1");

  const conflictSlots = getConflictSlots(slot);

  const requestedDatePolicy = validateCustomerBookingDate(date);

  const range = utcDayRange(date);
  if (!range) throw httpError(400, "Invalid date format, use yyyy-mm-dd");

  const hall = await Hall.findById(hallId).select("capacity isActive isDeleted").lean();
  if (!hall || hall.isDeleted) throw httpError(404, "Hall not found");

  if (!hall.isActive) return { available: false, reason: "HALL_INACTIVE", availableSlots: [] };

  if (Number(guests) > hall.capacity) return { available: false, reason: "EXCEEDS_CAPACITY", availableSlots: [] };

  if (requestedDatePolicy.blocked) {
    return {
      available: false,
      reason: requestedDatePolicy.reason,
      message: requestedDatePolicy.message || CUSTOMER_LEAD_TIME_MESSAGE,
      minimumDate: requestedDatePolicy.minimumDate,
      availableSlots: [],
    };
  }

  const blockingBookings = await Booking.find({
    hallId,
    date: { $gte: range.start, $lt: range.end },
    status: { $in: BLOCKING_BOOKING_STATUSES },
  })
    .select("status slot")
    .lean();

  const availableSlots = BOOKING_SLOTS.filter((candidateSlot) => {
    const candidateConflicts = getConflictSlots(candidateSlot);
    return !blockingBookings.some((booking) => candidateConflicts.includes(booking.slot));
  });

  const blocking = blockingBookings.find((booking) => conflictSlots.includes(booking.slot));

  if (blocking) {
    return {
      available: false,
      reason: "BOOKED",
      blockingStatus: blocking.status,
      blockingSlot: blocking.slot,
      availableSlots,
    };
  }

  return { available: true, availableSlots };
}
