import Hall from "../../models/Hall.js";
import Booking from "../../models/Booking.js";
import { httpError } from "../../utils/http.utils.js";

// Keep in sync with Booking.status enum
const BLOCKING_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED"];

function getConflictSlots(slot) {
  if (slot === "wholeday") return ["morning", "evening", "wholeday"];
  if (slot === "morning") return ["morning", "wholeday"];
  if (slot === "evening") return ["evening", "wholeday"];
  throw httpError(400, "slot must be morning|evening|wholeday");
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
  } else {
    start.setHours(9, 0, 0, 0);
  }

  if (today >= start) {
    return { blocked: true, reason: "TIME_BLOCKED" };
  }

  return { blocked: false };
}


// Convert "YYYY-MM-DD" into UTC day range [start, nextDayStart)
function utcDayRange(yyyyMmDd) {
  const start = new Date(`${yyyyMmDd}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) return null;

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function checkHallAvailability(req, res) {
  try {
    const { hallId } = req.params;
    const { date, slot, guests } = req.body || {};

    // validation
    if (!date || typeof date !== "string") {
      return res.status(400).json({ message: "date is required (yyyy-mm-dd)" });
    }
    if (!slot || !["morning", "evening", "wholeday"].includes(slot)) {
      return res.status(400).json({ message: "slot must be morning|evening|wholeday" });
    }

    const guestsNum = Number(guests);
    if (!Number.isFinite(guestsNum) || guestsNum < 1) {
      return res.status(400).json({ message: "guests must be a positive number" });
    }

    const timeBlock = isSlotTimeBlocked(date, slot);
    if (timeBlock.blocked) {
      return res.json({ available: false, reason: timeBlock.reason });
    }

    const range = utcDayRange(date);
    
    if (!range) {
      return res.status(400).json({ message: "Invalid date format, use yyyy-mm-dd" });
    }

    // Load hall and check global availability flags
    const hall = await Hall.findById(hallId).select("capacity isActive isDeleted").lean();
    if (!hall || hall.isDeleted) return res.status(404).json({ message: "Hall not found" });

    if (!hall.isActive) {
      return res.json({ available: false, reason: "HALL_INACTIVE" });
    }

    // Capacity check
    if (guestsNum > hall.capacity) {
      return res.json({ available: false, reason: "EXCEEDS_CAPACITY" });
    }

    // Booking conflict check
    const conflicts = getConflictSlots(slot);
    if (!conflicts) {
      return res.status(400).json({ message: "Invalid slot" });
    }

    const blockingBooking = await Booking.findOne({
      hallId,
      date: { $gte: range.start, $lt: range.end }, // Date-type safe day match
      slot: { $in: conflicts },
      status: { $in: BLOCKING_STATUSES },
    })
      .select("_id status slot")
      .lean();

    if (blockingBooking) {
      return res.json({
        available: false,
        reason: "BOOKED",
        blockingStatus: blockingBooking.status, // pending/approved
        blockingSlot: blockingBooking.slot,
      });
    }

    return res.json({ available: true });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function listHallsAvailability(query = {}) {
  const { date, slot, guests } = query;

  if (!date || typeof date !== "string") throw httpError(400, "date is required (yyyy-mm-dd)");
  if (!slot) throw httpError(400, "slot is required");

  const guestsNum = Number(guests);
  if (!Number.isFinite(guestsNum) || guestsNum < 1) throw httpError(400, "guests must be >= 1");

  const timeBlock = isSlotTimeBlocked(date, slot);
  if (timeBlock.blocked) return [];

  const range = utcDayRange(date);
  if (!range) throw httpError(400, "Invalid date format, use yyyy-mm-dd");

  // reuse your base hall filters + apply guests capacity requirement
  const filter = { isDeleted: false, isActive: true, capacity: { $gte: guestsNum } };
  if (query.city) filter["location.city"] = query.city;

  const halls = await Hall.find(filter)
    .select("name slug capacity location images amenities pricePerHour currency")
    .sort({ createdAt: -1 })
    .lean();

  if (!halls.length) return [];

  const hallIds = halls.map((h) => h._id);

  const conflictSlots = getConflictSlots(slot);

  // fetch all blocking bookings for that day for these halls
  const bookings = await Booking.find({
    hallId: { $in: hallIds },
    date: { $gte: range.start, $lt: range.end },
    slot: { $in: conflictSlots },
    status: { $in: BLOCKING_STATUSES },
  })
    .select("hallId")
    .lean();

  const blockedHallSet = new Set(bookings.map((b) => String(b.hallId)));

  // attach availability
  return halls.map((h) => ({
    ...h,
    available: !blockedHallSet.has(String(h._id)),
  }));
}