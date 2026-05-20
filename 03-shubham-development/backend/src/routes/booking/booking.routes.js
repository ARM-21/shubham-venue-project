import express from "express";
import Booking from "../../models/Booking.js";
import Hall from "../../models/Hall.js";
import mongoose from "mongoose";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { checkHallAvailability } from "../../services/hall/hall.service.js";
import {
  getSlotPriceMultiplier,
  getConflictSlots,
  BLOCKING_BOOKING_STATUSES,
  validateCustomerBookingDate,
  utcDayRange,
} from "../../utils/bookingPolicy.utils.js";
import { sendBookingConfirmationEmail, sendAdminBookingNotificationEmail } from "../../services/email/email.service.js";
import User from "../../models/User.js";
import { streamBookingInvoice } from "../../services/invoice/bookingInvoice.service.js";
import { createAuthAwareLimiter } from "../../config/rateLimit.config.js";

// 5 reserve attempts per 15 minutes per authenticated user — stops hold-spamming
const reserveLimiter = createAuthAwareLimiter(
  15 * 60 * 1000,
  5,
  "Too many reservation attempts. Please wait 15 minutes before trying again."
);

const router = express.Router();

const HOLD_DURATION_MS = 20 * 60 * 1000; // 20 minutes — covers external payment gateway round-trip

function calculateHallPrice(hall, slot) {
  const multiplier = getSlotPriceMultiplier(slot);
  return (Number(hall?.pricePerHour) || 0) * multiplier;
}

const formatSlot = (slot) => (slot ? `${slot.charAt(0).toUpperCase()}${slot.slice(1)}` : "");

const isOrganizerUser = (user) => {
  if (!user) return false;
  if ((user.role || "").toLowerCase() === "admin") return true;
  return Boolean(user.isOrganizerEligible);
};

// POST /reserve -> create a 5-minute hold
router.post("/reserve", isAuthenticated, reserveLimiter, async (req, res, next) => {
  try {
    const { hallId, date, slot, guests, bookingPurpose } = req.body || {};
    if (!hallId || !date || !slot || !guests) {
      return res.status(400).json({ message: "hallId, date, slot, guests are required" });
    }

    const normalizedPurpose = bookingPurpose === "organizer" ? "organizer" : "customer";
    if (normalizedPurpose === "organizer" && !isOrganizerUser(req.currentUser)) {
      return res.status(403).json({ message: "Organizer access required for this booking" });
    }

    // Non-DB validation (date policy, format) before opening a session
    const datePolicy = validateCustomerBookingDate(date);
    if (datePolicy.blocked) {
      return res.status(400).json({ message: datePolicy.message, reason: datePolicy.reason });
    }
    const range = utcDayRange(date);
    if (!range) return res.status(400).json({ message: "Invalid date format (use yyyy-mm-dd)" });
    const conflicts = getConflictSlots(slot);
    if (!conflicts) return res.status(400).json({ message: "Invalid slot" });

    const guestsNum = Number(guests);

    // Wrap the conflict-check + insert in a transaction so no two concurrent
    // requests can both pass the "slot free" check and both create a PENDING hold.
    const session = await mongoose.startSession();
    let reservation;
    try {
      await session.withTransaction(async () => {
        const hall = await Hall.findById(hallId)
          .select("capacity isActive isDeleted")
          .session(session)
          .lean();

        if (!hall || hall.isDeleted) {
          const err = new Error("Hall not found"); err.statusCode = 404; throw err;
        }
        if (!hall.isActive) {
          const err = new Error("Hall is not available"); err.statusCode = 400; err.reason = "HALL_INACTIVE"; throw err;
        }
        if (guestsNum > hall.capacity) {
          const err = new Error("Guest count exceeds hall capacity"); err.statusCode = 400; err.reason = "EXCEEDS_CAPACITY"; throw err;
        }

        const blocking = await Booking.findOne({
          hallId,
          date: { $gte: range.start, $lt: range.end },
          slot: { $in: conflicts },
          status: { $in: BLOCKING_BOOKING_STATUSES },
        })
          .select("_id slot status")
          .session(session)
          .lean();

        if (blocking) {
          const err = new Error("Hall not available for the selected date and slot");
          err.statusCode = 400;
          err.reason = blocking.status === "PENDING" ? "HOLD" : "BOOKED";
          err.blockingSlot = blocking.slot;
          throw err;
        }

        const expiresAt = new Date(Date.now() + HOLD_DURATION_MS);
        [reservation] = await Booking.create(
          [{
            userId: req.currentUser._id,
            hallId,
            date: new Date(date),
            slot,
            guests: guestsNum,
            bookingPurpose: normalizedPurpose,
            status: "PENDING",
            reservedUntil: expiresAt,
            totalAmount: 0,
          }],
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    return res.json({
      reservationId: reservation._id,
      expiresIn: Math.floor(HOLD_DURATION_MS / 1000),
      expiresAt: reservation.reservedUntil,
      message: "Hall reserved for 5 minutes",
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message, reason: err.reason, blockingSlot: err.blockingSlot });
    }
    return next(err);
  }
});

// DELETE /reserve/:id -> release hold
router.delete("/reserve/:id", isAuthenticated, async (req, res, next) => {
  try {
    const reservation = await Booking.findOne({
      _id: req.params.id,
      userId: req.currentUser._id,
      status: "PENDING",
      reservedUntil: { $ne: null },
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    await reservation.deleteOne();
    return res.json({ message: "Reservation released" });
  } catch (err) {
    return next(err);
  }
});

// POST / -> finalize booking (cash or online)
router.post("/", isAuthenticated, async (req, res, next) => {
  try {
    const {
      reservationId,
      hallId,
      date,
      slot,
      guests,
      eventType,
      eventName,
      specialRequirements,
      bookingPurpose,
      menuMode = "package",
      selectedMenu = [],
      selectedPackage = null,
      menuTotal,
      decorationScheme = null,
      addons = [],
      decorationTotal = 0,
      paymentMethod = "cash",
    } = req.body || {};

    const menuModeValue = menuMode === "custom" ? "custom" : "package";
    let selectedMenuValue = Array.isArray(selectedMenu) ? selectedMenu : [];

    const requestedPurpose = bookingPurpose === "organizer" ? "organizer" : "customer";
    if (requestedPurpose === "organizer" && !isOrganizerUser(req.currentUser)) {
      return res.status(403).json({ message: "Organizer access required for this booking" });
    }

    if (!hallId || !date || !slot || !guests) {
      return res.status(400).json({ message: "hallId, date, slot, guests are required" });
    }

    const hall = await Hall.findById(hallId);
    if (!hall || hall.isDeleted || !hall.isActive) {
      return res.status(404).json({ message: "Hall not found or inactive" });
    }

    let bookingDoc;

    if (reservationId) {
      bookingDoc = await Booking.findOne({
        _id: reservationId,
        userId: req.currentUser._id,
        status: "PENDING",
      });

      if (!bookingDoc) {
        return res.status(404).json({ message: "Reservation not found or expired" });
      }

      if (bookingDoc.reservedUntil && bookingDoc.reservedUntil < new Date()) {
        return res.status(400).json({ message: "Reservation expired" });
      }

      if (
        bookingDoc.hallId.toString() !== hallId ||
        bookingDoc.slot !== slot ||
        new Date(bookingDoc.date).toISOString().slice(0, 10) !== date
      ) {
        return res.status(400).json({ message: "Reservation details mismatch" });
      }
    } else {
      const availability = await checkHallAvailability({ hallId, date, slot, guests: Number(guests) });
      if (!availability.available) {
        return res.status(400).json({ message: "Hall not available", reason: availability.reason });
      }
    }

    const finalPurpose = bookingDoc?.bookingPurpose || requestedPurpose;
    const organizerBooking = finalPurpose === "organizer";

    if (!organizerBooking && menuModeValue === "custom" && (!selectedMenuValue || selectedMenuValue.length === 0)) {
      return res.status(400).json({ message: "Please select at least one menu item" });
    }

    if (organizerBooking) {
      selectedMenuValue = [];
    }

    const guestsNum = Number(guests);

    if (!organizerBooking && menuModeValue === "package" && (!selectedMenuValue || selectedMenuValue.length === 0) && selectedPackage) {
      const pricePerPerson = Number(selectedPackage.pricePerPerson || 0);
      selectedMenuValue = [{
        itemId: selectedPackage._id || selectedPackage.packageId || "package",
        name: selectedPackage.name || "Package",
        quantity: guestsNum,
        pricePerUnit: pricePerPerson,
        total: pricePerPerson * guestsNum,
      }];
    }

    const totalMenu = organizerBooking
      ? 0
      : Number.isFinite(Number(menuTotal))
        ? Number(menuTotal)
        : selectedMenuValue.reduce((sum, item) => sum + Number(item?.total || 0), 0);

    const hallPrice = calculateHallPrice(hall, slot);
    const totalDecoration = organizerBooking ? 0 : Number(decorationTotal || 0);
    const totalAmount = hallPrice + totalMenu + totalDecoration;

    const decorationPayload = organizerBooking
      ? null
      : decorationScheme
      ? {
          schemeId: decorationScheme._id || decorationScheme.schemeId || null,
          name: decorationScheme.name,
          price: decorationScheme.price,
        }
      : null;

    const addonsValue = organizerBooking ? [] : (Array.isArray(addons) ? addons : []);

    const finalMenuMode = organizerBooking ? "package" : menuModeValue;

    const isCash = (paymentMethod || "").toLowerCase() === "cash";
    const nextStatus = isCash ? "PENDING" : "PENDING"; // cash stays PENDING until admin confirms; online stays PENDING until gateway verifies
    const confirmedAt = null;

    if (bookingDoc) {
      bookingDoc.status = nextStatus;
      bookingDoc.reservedUntil = null;
      bookingDoc.guests = guestsNum;
      bookingDoc.bookingPurpose = finalPurpose;
      bookingDoc.eventType = eventType;
      bookingDoc.eventName = eventName;
      bookingDoc.specialRequirements = specialRequirements;
      bookingDoc.menuMode = finalMenuMode;
      bookingDoc.selectedMenu = selectedMenuValue;
      bookingDoc.menuTotal = totalMenu;
      bookingDoc.decorationScheme = decorationPayload;
      bookingDoc.addons = addonsValue;
      bookingDoc.decorationTotal = totalDecoration;
      bookingDoc.hallPrice = hallPrice;
      bookingDoc.totalAmount = totalAmount;
      bookingDoc.confirmedAt = confirmedAt;
      bookingDoc.cancelledAt = null;
      bookingDoc.cancellationReason = null;
      await bookingDoc.save();
    } else {
      bookingDoc = await Booking.create({
        userId: req.currentUser._id,
        hallId,
        date: new Date(date),
        slot,
        guests: guestsNum,
        bookingPurpose: finalPurpose,
        eventType,
        eventName,
        specialRequirements,
        menuMode: finalMenuMode,
        selectedMenu: selectedMenuValue,
        menuTotal: totalMenu,
        decorationScheme: decorationPayload,
        addons: addonsValue,
        decorationTotal: totalDecoration,
        hallPrice,
        totalAmount,
        status: nextStatus,
        confirmedAt,
        cancelledAt: null,
        cancellationReason: null,
      });
    }

    // Fire-and-forget email notifications
    const bookingDateStr = bookingDoc.date ? bookingDoc.date.toISOString().slice(0, 10) : date;
    const userName = `${req.currentUser.first_name || ""} ${req.currentUser.last_name || ""}`.trim() || req.currentUser.email;
    try {
      if (bookingDoc.status === "CONFIRMED") {
        await sendBookingConfirmationEmail(req.currentUser.email, userName, {
          bookingId: bookingDoc._id,
          date: bookingDateStr,
          venue: hall.name,
          amount: bookingDoc.totalAmount,
        });
      }

      const adminUsers = await User.find({ role: "admin", isActive: true, notifyBookings: { $ne: false } }).select("email").lean();
      console.log("Admin users to notify about booking:", adminUsers.map((u) => u.email));
      const adminEmails = adminUsers.map((u) => u.email).filter(Boolean);
      await sendAdminBookingNotificationEmail(adminEmails, {
        bookingId: bookingDoc._id,
        userName,
        userEmail: req.currentUser.email,
        date: bookingDateStr,
        slot: formatSlot(bookingDoc.slot),
        hallName: hall.name,
        status: bookingDoc.status,
        totalAmount: bookingDoc.totalAmount,
      });
    } catch (notifyErr) {
      console.error("Email notification error (booking create):", notifyErr);
    }

    return res.status(201).json({ message: "Booking created", booking: bookingDoc });
  } catch (err) {
    return next(err);
  }
});

// GET /my -> list current user's bookings (most recent first)
router.get("/my", isAuthenticated, async (req, res, next) => {
  try {
    const { status, limit = 20, page = 1 } = req.query || {};
    const lim = Math.min(Number(limit) || 20, 100);
    const skip = Math.max((Number(page) - 1) * lim, 0);

    const filter = { userId: req.currentUser._id };
    if (status && ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(status)) {
      filter.status = status;
    }

      const [items, total] = await Promise.all([
        Booking.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(lim)
          .select("hallId date slot status totalAmount menuTotal decorationTotal hallPrice reservedUntil guests eventName eventType createdAt updatedAt paymentId")
          .populate({ path: "hallId", select: "name slug" })
          .populate({ path: "paymentId", select: "gateway status paidAt transactionId amount currency invoiceUrl" })
          .lean(),
        Booking.countDocuments(filter),
      ]);

    return res.json({
      items,
      page: Number(page) || 1,
      limit: lim,
      total,
      totalPages: Math.ceil(total / lim) || 1,
    });
  } catch (err) {
    return next(err);
  }
});

// GET /:id -> simple fetch (for redirect targets)
router.get("/:id", isAuthenticated, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.currentUser._id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    return res.json({ booking });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id/invoice", isAuthenticated, async (req, res, next) => {
  try {
    await streamBookingInvoice({ bookingId: req.params.id, currentUser: req.currentUser, res });
  } catch (err) {
    return next(err);
  }
});

export default router;
