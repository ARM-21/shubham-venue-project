import express from "express";
import mongoose from "mongoose";
import { isAuthenticated, isOrganizer } from "../../middleware/auth.middleware.js";
import Booking from "../../models/Booking.js";
import Hall from "../../models/Hall.js";
import OrganizerEvent from "../../models/OrganizerEvent.js";
import TicketType from "../../models/TicketType.js";
import Ticket from "../../models/Ticket.js";

const router = express.Router();

const BOOKING_ELIGIBLE_STATUSES = ["CONFIRMED", "COMPLETED"];
const EVENT_STATUSES = ["DRAFT", "PUBLISHED", "CANCELLED"];

function parseBoolean(value, fallback) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return fallback;
}

function deriveEventTimeRange(dateValue, slot) {
  const base = new Date(dateValue);
  if (Number.isNaN(base.getTime())) return { startDateTime: null, endDateTime: null };

  const start = new Date(base);
  const end = new Date(base);

  if (slot === "morning") {
    start.setHours(9, 0, 0, 0);
    end.setHours(13, 0, 0, 0);
  } else if (slot === "evening") {
    start.setHours(17, 0, 0, 0);
    end.setHours(21, 0, 0, 0);
  } else {
    start.setHours(9, 0, 0, 0);
    end.setHours(21, 0, 0, 0);
  }

  return { startDateTime: start, endDateTime: end };
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

router.get("/bookings", isAuthenticated, isOrganizer, async (req, res, next) => {
  try {
    const { status, eligibleForEvent } = req.query || {};
    console.log(status, eligibleForEvent)
    const filter = { userId: req.currentUser._id };

    if (status && ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(status)) {
      filter.status = status;
    }

    if (String(eligibleForEvent) === "true") {
      filter.status = { $in: BOOKING_ELIGIBLE_STATUSES };
      filter.date = { $gte: startOfToday() };
    }

    const bookings = await Booking.find(filter)
      .sort({ date: -1 })
      .select("hallId date slot status eventName eventType guests totalAmount createdAt")
      .populate({ path: "hallId", select: "name slug capacity" })
      .lean();

    if (String(eligibleForEvent) !== "true") {
      return res.json({ bookings });
    }

    if (!bookings.length) return res.json({ bookings: [] });

    const bookingIds = bookings.map((b) => b._id);
    const existingEvents = await OrganizerEvent.find({ bookingId: { $in: bookingIds } })
      .select("bookingId")
      .lean();

    const usedBookingIds = new Set(existingEvents.map((e) => String(e.bookingId)));
    const eligible = bookings.filter((b) => !usedBookingIds.has(String(b._id)));

    return res.json({ bookings: eligible });
  } catch (err) {
    return next(err);
  }
});

router.get("/events", isAuthenticated, isOrganizer, async (req, res, next) => {
  try {
    const { status } = req.query || {};
    const filter = { organizerId: req.currentUser._id };

    if (status && EVENT_STATUSES.includes(status)) {
      filter.status = status;
    }

    const events = await OrganizerEvent.find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: "hallId", select: "name slug capacity" })
      .populate({ path: "bookingId", select: "date slot status" })
      .lean();

    return res.json({ events });
  } catch (err) {
    return next(err);
  }
});

router.post("/events", isAuthenticated, isOrganizer, async (req, res, next) => {
  try {
    const {
      bookingId,
      name,
      eventName,
      type,
      description,
      isPublic,
      bannerUrl,
      accessCode,
      startDateTime,
      endDateTime,
    } = req.body || {};

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Valid bookingId is required" });
    }

    const eventTitle = String(eventName || name || "").trim();
    if (!eventTitle) return res.status(400).json({ message: "Event name is required" });

    const booking = await Booking.findOne({ _id: bookingId, userId: req.currentUser._id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (!BOOKING_ELIGIBLE_STATUSES.includes(booking.status)) {
      return res.status(400).json({ message: "Booking is not eligible for event creation" });
    }

    if (booking.date && booking.date < startOfToday()) {
      return res.status(400).json({ message: "Booking date is in the past" });
    }

    const existingEvent = await OrganizerEvent.findOne({ bookingId: booking._id }).select("_id");
    if (existingEvent) {
      return res.status(409).json({ message: "An event already exists for this booking" });
    }

    const isPublicValue = parseBoolean(isPublic, true);
    const accessCodeValue = String(accessCode || "").trim();
    if (!isPublicValue && accessCodeValue.length < 4) {
      return res.status(400).json({ message: "Private events require an accessCode (min 4 chars)" });
    }

    let startValue = startDateTime ? new Date(startDateTime) : null;
    let endValue = endDateTime ? new Date(endDateTime) : null;

    if (startDateTime && Number.isNaN(startValue.getTime())) {
      return res.status(400).json({ message: "Invalid startDateTime" });
    }
    if (endDateTime && Number.isNaN(endValue.getTime())) {
      return res.status(400).json({ message: "Invalid endDateTime" });
    }

    if (!startValue || !endValue) {
      const derived = deriveEventTimeRange(booking.date, booking.slot);
      if (!startValue) startValue = derived.startDateTime;
      if (!endValue) endValue = derived.endDateTime;
    }

    if (startValue && endValue && startValue >= endValue) {
      return res.status(400).json({ message: "startDateTime must be before endDateTime" });
    }

    const eventDoc = await OrganizerEvent.create({
      organizerId: req.currentUser._id,
      bookingId: booking._id,
      hallId: booking.hallId,
      name: eventTitle,
      type: String(type || booking.eventType || "").trim(),
      description: String(description || "").trim(),
      isPublic: isPublicValue,
      accessCode: isPublicValue ? null : accessCodeValue,
      bannerUrl: String(bannerUrl || "").trim(),
      startDateTime: startValue,
      endDateTime: endValue,
      status: "DRAFT",
    });

    return res.status(201).json({ message: "Event created", event: eventDoc });
  } catch (err) {
    return next(err);
  }
});

router.get("/events/:id", isAuthenticated, isOrganizer, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const event = await OrganizerEvent.findOne({
      _id: req.params.id,
      organizerId: req.currentUser._id,
    })
      .populate({ path: "hallId", select: "name slug capacity" })
      .populate({ path: "bookingId", select: "date slot status" })
      .lean();

    if (!event) return res.status(404).json({ message: "Event not found" });

    return res.json({ event });
  } catch (err) {
    return next(err);
  }
});

router.patch("/events/:id", isAuthenticated, isOrganizer, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const event = await OrganizerEvent.findOne({
      _id: req.params.id,
      organizerId: req.currentUser._id,
    });

    if (!event) return res.status(404).json({ message: "Event not found" });

    const {
      name,
      eventName,
      type,
      description,
      isPublic,
      bannerUrl,
      accessCode,
      startDateTime,
      endDateTime,
      status,
    } = req.body || {};

    const update = {};

    const nextName = String(eventName || name || "").trim();
    if (nextName) update.name = nextName;

    if (typeof type !== "undefined") update.type = String(type || "").trim();
    if (typeof description !== "undefined") update.description = String(description || "").trim();
    if (typeof bannerUrl !== "undefined") update.bannerUrl = String(bannerUrl || "").trim();

    const isPublicValue = typeof isPublic === "undefined" ? null : parseBoolean(isPublic, event.isPublic);
    if (isPublicValue !== null) {
      update.isPublic = isPublicValue;
      if (isPublicValue) {
        update.accessCode = null;
      }
    }

    if (typeof accessCode !== "undefined") {
      const accessCodeValue = String(accessCode || "").trim();
      const targetPublic = isPublicValue !== null ? isPublicValue : event.isPublic;
      if (!targetPublic && accessCodeValue.length < 4) {
        return res.status(400).json({ message: "Private events require an accessCode (min 4 chars)" });
      }
      update.accessCode = targetPublic ? null : accessCodeValue;
    }

    if (typeof startDateTime !== "undefined") {
      const nextStart = new Date(startDateTime);
      if (Number.isNaN(nextStart.getTime())) {
        return res.status(400).json({ message: "Invalid startDateTime" });
      }
      update.startDateTime = nextStart;
    }

    if (typeof endDateTime !== "undefined") {
      const nextEnd = new Date(endDateTime);
      if (Number.isNaN(nextEnd.getTime())) {
        return res.status(400).json({ message: "Invalid endDateTime" });
      }
      update.endDateTime = nextEnd;
    }

    if (typeof status !== "undefined") {
      if (!EVENT_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      update.status = status;
    }

    const nextStart = update.startDateTime || event.startDateTime;
    const nextEnd = update.endDateTime || event.endDateTime;
    if (nextStart && nextEnd && nextStart >= nextEnd) {
      return res.status(400).json({ message: "startDateTime must be before endDateTime" });
    }

    const nextPublic = typeof update.isPublic === "boolean" ? update.isPublic : event.isPublic;
    const nextStatus = update.status || event.status;

    if (nextStatus === "PUBLISHED" && nextPublic) {
      const typeCount = await TicketType.countDocuments({ eventId: event._id });
      if (typeCount < 1) {
        return res.status(400).json({ message: "Add at least one ticket type before publishing" });
      }
    }

    const updated = await OrganizerEvent.findByIdAndUpdate(event._id, update, { new: true })
      .populate({ path: "hallId", select: "name slug capacity" })
      .populate({ path: "bookingId", select: "date slot status" })
      .lean();

    return res.json({ message: "Event updated", event: updated });
  } catch (err) {
    return next(err);
  }
});

router.get("/events/:id/ticket-types", isAuthenticated, isOrganizer, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const event = await OrganizerEvent.findOne({
      _id: req.params.id,
      organizerId: req.currentUser._id,
    }).select("_id hallId");

    if (!event) return res.status(404).json({ message: "Event not found" });

    const ticketTypes = await TicketType.find({ eventId: event._id }).sort({ createdAt: 1 }).lean();

    return res.json({ ticketTypes });
  } catch (err) {
    return next(err);
  }
});

router.post("/events/:id/ticket-types", isAuthenticated, isOrganizer, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const event = await OrganizerEvent.findOne({
      _id: req.params.id,
      organizerId: req.currentUser._id,
    }).select("_id hallId");

    if (!event) return res.status(404).json({ message: "Event not found" });

    const name = String(req.body?.name || "").trim();
    const price = Number(req.body?.price);
    const quantityTotal = Number(req.body?.quantityTotal);

    if (!name) return res.status(400).json({ message: "Ticket name is required" });
    if (!Number.isFinite(price) || price < 0) return res.status(400).json({ message: "Invalid ticket price" });
    if (!Number.isFinite(quantityTotal) || quantityTotal < 1) {
      return res.status(400).json({ message: "quantityTotal must be at least 1" });
    }

    const hall = await Hall.findById(event.hallId).select("capacity").lean();
    if (!hall) return res.status(400).json({ message: "Hall not found for event" });

    const existingTypes = await TicketType.find({ eventId: event._id }).select("quantityTotal").lean();
    const existingTotal = existingTypes.reduce((sum, t) => sum + Number(t.quantityTotal || 0), 0);

    if (existingTotal + quantityTotal > Number(hall.capacity || 0)) {
      return res.status(400).json({ message: "Total ticket quantity exceeds hall capacity" });
    }

    const ticketType = await TicketType.create({
      eventId: event._id,
      name,
      price,
      quantityTotal,
      quantitySold: 0,
    });

    return res.status(201).json({ message: "Ticket type created", ticketType });
  } catch (err) {
    return next(err);
  }
});

router.patch("/ticket-types/:ticketTypeId", isAuthenticated, isOrganizer, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.ticketTypeId)) {
      return res.status(400).json({ message: "Invalid ticket type id" });
    }

    const ticketType = await TicketType.findById(req.params.ticketTypeId);
    if (!ticketType) return res.status(404).json({ message: "Ticket type not found" });

    const event = await OrganizerEvent.findOne({
      _id: ticketType.eventId,
      organizerId: req.currentUser._id,
    }).select("_id hallId");

    if (!event) return res.status(404).json({ message: "Event not found" });

    const update = {};

    if (typeof req.body?.name !== "undefined") {
      const name = String(req.body.name || "").trim();
      if (!name) return res.status(400).json({ message: "Ticket name is required" });
      update.name = name;
    }

    if (typeof req.body?.price !== "undefined") {
      const price = Number(req.body.price);
      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({ message: "Invalid ticket price" });
      }
      if (ticketType.quantitySold > 0 && price !== ticketType.price) {
        return res.status(400).json({ message: "Cannot change price after tickets are sold" });
      }
      update.price = price;
    }

    if (typeof req.body?.quantityTotal !== "undefined") {
      const quantityTotal = Number(req.body.quantityTotal);
      if (!Number.isFinite(quantityTotal) || quantityTotal < 1) {
        return res.status(400).json({ message: "quantityTotal must be at least 1" });
      }
      if (quantityTotal < ticketType.quantitySold) {
        return res.status(400).json({ message: "quantityTotal cannot be less than quantitySold" });
      }
      update.quantityTotal = quantityTotal;
    }

    if (typeof req.body?.isActive === "boolean") {
      update.isActive = req.body.isActive;
    }

    const hall = await Hall.findById(event.hallId).select("capacity").lean();
    if (!hall) return res.status(400).json({ message: "Hall not found for event" });

    if (typeof update.quantityTotal !== "undefined") {
      const existingTypes = await TicketType.find({ eventId: event._id }).select("_id quantityTotal").lean();
      const existingTotal = existingTypes.reduce((sum, t) => {
        if (String(t._id) === String(ticketType._id)) return sum;
        return sum + Number(t.quantityTotal || 0);
      }, 0);

      if (existingTotal + update.quantityTotal > Number(hall.capacity || 0)) {
        return res.status(400).json({ message: "Total ticket quantity exceeds hall capacity" });
      }
    }

    const updated = await TicketType.findByIdAndUpdate(ticketType._id, update, { new: true }).lean();

    return res.json({ message: "Ticket type updated", ticketType: updated });
  } catch (err) {
    return next(err);
  }
});

router.get("/events/:id/attendees", isAuthenticated, isOrganizer, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const event = await OrganizerEvent.findOne({
      _id: req.params.id,
      organizerId: req.currentUser._id,
    }).select("_id");

    if (!event) return res.status(404).json({ message: "Event not found" });

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      Ticket.find({ eventId: event._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "ownerUserId", select: "first_name last_name email phone" })
        .populate({ path: "ticketTypeId", select: "name price" })
        .lean(),
      Ticket.countDocuments({ eventId: event._id }),
    ]);

    const attendees = tickets.map((ticket) => ({
      id: ticket._id,
      ticketType: ticket.ticketTypeId || null,
      attendee: ticket.ownerUserId || null,
      status: ticket.status,
      qrCodeValue: ticket.qrCodeValue,
      checkedInAt: ticket.checkedInAt || null,
      createdAt: ticket.createdAt,
    }));

    return res.json({
      attendees,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/events/:id/checkin", isAuthenticated, isOrganizer, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const event = await OrganizerEvent.findOne({
      _id: req.params.id,
      organizerId: req.currentUser._id,
    }).select("_id");

    if (!event) return res.status(404).json({ message: "Event not found" });

    const qrCodeValue = String(req.body?.qrCodeValue || "").trim();
    if (!qrCodeValue) return res.status(400).json({ message: "qrCodeValue is required" });

    const ticket = await Ticket.findOne({ eventId: event._id, qrCodeValue });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (ticket.status !== "ACTIVE") {
      return res.status(400).json({ message: "Ticket is not active" });
    }

    if (ticket.checkedInAt) {
      return res.status(409).json({ message: "Ticket already checked in" });
    }

    ticket.checkedInAt = new Date();
    await ticket.save();

    return res.json({ message: "Check-in successful", checkedInAt: ticket.checkedInAt });
  } catch (err) {
    return next(err);
  }
});

export default router;
