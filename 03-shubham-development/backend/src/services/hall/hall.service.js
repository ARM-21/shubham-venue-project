import Hall from "../../models/Hall.js";
import Booking from "../../models/Booking.js";
import { httpError } from "../../utils/http.utils.js";


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

/**Booking availability check */
// Keep in sync with Booking.status enum
const BLOCKING_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED"];

function getConflictSlots(slot) {
  if (slot === "wholeday") return ["morning", "afternoon", "evening", "wholeday"];
  if (slot === "morning") return ["morning", "wholeday"];
  if (slot === "afternoon") return ["afternoon", "wholeday"];
  if (slot === "evening") return ["evening", "wholeday"];
  throw httpError(400, "slot must be morning|afternoon|evening|wholeday");
}

function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSlotTimeBlocked(dateValue, slot) {
  const today = new Date();
  const todayStr = toLocalDateString(today);

  if (dateValue < todayStr) {
    return { blocked: true, reason: "PAST_DATE" };
  }

  if (dateValue !== todayStr) {
    return { blocked: false };
  }

  const start = new Date(today);
  if (slot === "evening") {
    start.setHours(17, 0, 0, 0);
  } else if (slot === "afternoon") {
    start.setHours(13, 0, 0, 0);
  } else {
    start.setHours(9, 0, 0, 0);
  }

  if (today >= start) {
    return { blocked: true, reason: "TIME_BLOCKED" };
  }

  return { blocked: false };
}

export async function checkHallAvailability({ hallId, date, slot, guests }) {
  if (!date || typeof date !== "string") throw httpError(400, "date is required (yyyy-mm-dd)");
  if (!slot) throw httpError(400, "slot is required");
  if (!Number.isFinite(Number(guests)) || Number(guests) < 1) throw httpError(400, "guests must be >= 1");

  const timeBlock = isSlotTimeBlocked(date, slot);
  if (timeBlock.blocked) {
    return { available: false, reason: timeBlock.reason };
  }

  const hall = await Hall.findById(hallId).select("capacity isActive isDeleted").lean();
  if (!hall || hall.isDeleted) throw httpError(404, "Hall not found");

  if (!hall.isActive) return { available: false, reason: "HALL_INACTIVE" };

  if (Number(guests) > hall.capacity) return { available: false, reason: "EXCEEDS_CAPACITY" };

  const conflictSlots = getConflictSlots(slot);
  console.log(conflictSlots,hallId, date, slot)

  const blocking = await Booking.findOne({
    hallId,
    date,
    slot: { $in: conflictSlots },
    status: { $in: BLOCKING_STATUSES },
  })
    .select("status slot")
    .lean();
  console.log(blocking)
  if (blocking) {
    return {
      available: false,
      reason: "BOOKED",
      blockingStatus: blocking.status,
      blockingSlot: blocking.slot,
    };
  }

  return { available: true };
}