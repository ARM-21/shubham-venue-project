import express from "express";
import mongoose from "mongoose";
import Booking from "../../../models/Booking.js";
import Payment from "../../../models/Payment.js";
import { sendInvoiceEmail, sendPaymentConfirmationEmail } from "../../../services/email/email.service.js";
import Menu from "../../../models/menu/Menu.js";
import DecorationScheme from "../../../models/DecorationScheme.js";
import User from "../../../models/User.js";
import Hall from "../../../models/Hall.js";
import { sendBookingConfirmationEmail, sendAdminBookingNotificationEmail } from "../../../services/email/email.service.js";
// import { sendInvoiceEmail, sendPaymentConfirmationEmail } from "../../../services/email/nodemailer.service.js";

const router = express.Router();

// POST / -> Create booking for offline customers (admin only)
router.post("/", async (req, res, next) => {
  try {
    const { userEmail, hallId, date, slot, guests } = req.body || {};

    // Validation
    if (!userEmail || !userEmail.includes("@")) {
      return res.status(400).json({ message: "Valid email is required" });
    }
    if (!hallId || !mongoose.Types.ObjectId.isValid(hallId)) {
      return res.status(400).json({ message: "Valid hallId is required" });
    }
    if (!date || typeof date !== "string") {
      return res.status(400).json({ message: "Date is required (yyyy-mm-dd format)" });
    }
    if (!["morning", "afternoon", "evening", "wholeday"].includes(slot)) {
      return res.status(400).json({ message: "Invalid slot" });
    }

    const guestsNum = Number(guests);
    if (!Number.isFinite(guestsNum) || guestsNum < 1) {
      return res.status(400).json({ message: "Guests must be a positive number" });
    }

    // Find or create user
    let user = await User.findOne({ email: userEmail }).select("_id");
    if (!user) {
      user = await User.create({
        email: userEmail,
        role: "customer",
        isActive: true,
      });
    }

    // Validate hall
    const hall = await Hall.findById(hallId).select("_id capacity pricePerHour").lean();
    if (!hall || hall.isDeleted) {
      return res.status(404).json({ message: "Hall not found" });
    }

    if (guestsNum > hall.capacity) {
      return res.status(400).json({ message: "Guest count exceeds hall capacity" });
    }

    // Parse date and check for conflicts
    const dateObj = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: "Invalid date format (use yyyy-mm-dd)" });
    }

    // Define conflict slots
    const conflictSlots = slot === "wholeday"
      ? ["morning", "afternoon", "evening", "wholeday"]
      : slot === "morning"
        ? ["morning", "wholeday"]
        : slot === "afternoon"
          ? ["afternoon", "wholeday"]
          : ["evening", "wholeday"];

    // Check for booking conflicts
    const rangeStart = dateObj;
    const rangeEnd = new Date(rangeStart);
    rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);

    const blocking = await Booking.findOne({
      hallId,
      date: { $gte: rangeStart, $lt: rangeEnd },
      slot: { $in: conflictSlots },
      status: { $in: ["PENDING", "CONFIRMED", "COMPLETED"] },
    }).select("_id slot status").lean();

    if (blocking) {
      return res.status(400).json({ 
        message: "Hall is not available for the selected date and slot" 
      });
    }

    // Calculate hall price
    let multiplier;
    if (slot === "morning") {
      multiplier = 5; // 7 AM - 12 PM
    } else if (slot === "afternoon") {
      multiplier = 5; // 1 PM - 6 PM
    } else if (slot === "evening") {
      multiplier = 3.5; // 7 PM - 10:30 PM
    } else {
      multiplier = 15.5; // 7 AM - 10:30 PM (wholeday)
    }
    const hallPrice = (Number(hall.pricePerHour) || 0) * multiplier;

    // Create booking
    const booking = new Booking({
      userId: user._id,
      hallId,
      date: dateObj,
      slot,
      guests: guestsNum,
      bookingPurpose: "customer",
      hallPrice,
      totalAmount: hallPrice,
      status: "CONFIRMED", // Admin-created bookings start as confirmed
      menuMode: "package",
      selectedMenu: [],
      menuTotal: 0,
      decorationTotal: 0,
    });

    await booking.save();

    // Send confirmation emails
    try {
      const [userDoc, admins] = await Promise.all([
        User.findById(user._id).select("first_name last_name email").lean(),
        User.find({ role: "admin", isActive: true, notifyBookings: { $ne: false } }).select("email").lean(),
      ]);

      const userName = `${userDoc?.first_name || ""} ${userDoc?.last_name || ""}`.trim() || userDoc?.email;
      const bookingDateStr = booking.date.toISOString().slice(0, 10);

      if (userDoc?.email) {
        await sendBookingConfirmationEmail(userDoc.email, userName, {
          bookingId: booking._id,
          date: bookingDateStr,
          venue: hall?._id || "Hall",
          amount: booking.totalAmount,
        });
      }

      const adminEmails = admins.map((a) => a.email).filter(Boolean);
      if (adminEmails.length) {
        await sendAdminBookingNotificationEmail(adminEmails, {
          bookingId: booking._id,
          userName,
          userEmail: userDoc?.email,
          date: bookingDateStr,
          slot: booking.slot,
          hallName: hall?._id || "Hall",
          status: booking.status,
          totalAmount: booking.totalAmount,
        });
      }
    } catch (emailError) {
      console.error("Email notification error:", emailError);
      // Don't fail the booking if emails fail
    }

    return res.status(201).json({
      message: "Booking created successfully",
      booking: {
        id: booking._id,
        userId: booking.userId,
        hallId: booking.hallId,
        date: booking.date,
        slot: booking.slot,
        guests: booking.guests,
        totalAmount: booking.totalAmount,
        status: booking.status,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const nextStatus = (status || "").toUpperCase();
    const allowedTargets = ["CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!allowedTargets.includes(nextStatus)) {
      return res.status(400).json({ message: "status must be CONFIRMED|CANCELLED|COMPLETED" });
    }

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const current = booking.status;
    const canTransition = (from, to) => {
      if (from === "PENDING" && (to === "CONFIRMED" || to === "CANCELLED")) return true;
      if (from === "CONFIRMED" && (to === "CANCELLED" || to === "COMPLETED")) return true;
      if (from === "CANCELLED" && to === "CONFIRMED") return true;
      return false;
    };

    if (!canTransition(current, nextStatus)) {
      return res.status(400).json({ message: `Cannot change status from ${current} to ${nextStatus}` });
    }

    if (["CONFIRMED", "COMPLETED"].includes(nextStatus)) {
      const payment = booking.paymentId
        ? await Payment.findById(booking.paymentId).select("gateway status").lean()
        : await Payment.findOne({ bookingId: booking._id }).sort({ createdAt: -1 }).select("gateway status").lean();

      if (payment && payment.gateway !== "CASH" && payment.status !== "COMPLETED") {
        return res.status(400).json({ message: "Online payment must be completed before approval" });
      }
    }

    booking.status = nextStatus;
    booking.reservedUntil = null;

    if (nextStatus === "CONFIRMED") {
      booking.confirmedAt = new Date();
      booking.cancelledAt = null;
      booking.cancellationReason = null;
    }

    if (nextStatus === "CANCELLED") {
      booking.cancelledAt = new Date();
      booking.cancellationReason = reason || null;
    }

    if (nextStatus === "COMPLETED") {
      booking.cancelledAt = null;
      booking.cancellationReason = null;
    }

    await booking.save();

    if (nextStatus === "CONFIRMED") {
      try {
        const [user, hall, admins] = await Promise.all([
          User.findById(booking.userId).select("first_name last_name email").lean(),
          Hall.findById(booking.hallId).select("name").lean(),
          User.find({ role: "admin", isActive: true, notifyBookings: { $ne: false } }).select("email").lean(),
        ]);

        const userName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email;
        const bookingDateStr = booking.date ? booking.date.toISOString().slice(0, 10) : "";
        await sendBookingConfirmationEmail(user?.email, userName, {
          bookingId: booking._id,
          date: bookingDateStr,
          venue: hall?.name || "Hall",
          amount: booking.totalAmount,
        });

        const adminEmails = admins.map((a) => a.email).filter(Boolean);
        await sendAdminBookingNotificationEmail(adminEmails, {
          bookingId: booking._id,
          userName,
          userEmail: user?.email,
          date: bookingDateStr,
          slot: booking.slot,
          hallName: hall?.name || "Hall",
          status: booking.status,
          totalAmount: booking.totalAmount,
        });
      } catch (notifyErr) {
        console.error("Email notification error (admin confirm):", notifyErr);
      }
    }

    return res.json({ message: "Booking status updated", booking });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, slot, guests, hallId, eventName, eventType, specialRequirements } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const updates = {};

    if (eventName !== undefined) updates.eventName = eventName;
    if (eventType !== undefined) updates.eventType = eventType;
    if (specialRequirements !== undefined) updates.specialRequirements = specialRequirements;
    if (guests !== undefined) {
      const g = Number(guests);
      if (!Number.isFinite(g) || g < 1) return res.status(400).json({ message: "guests must be a positive number" });
      updates.guests = g;
    }

    const nextHallId = hallId && mongoose.Types.ObjectId.isValid(hallId) ? new mongoose.Types.ObjectId(hallId) : booking.hallId;
    const nextSlot = slot || booking.slot;
    const nextDateStr = date || booking.date?.toISOString?.().slice(0, 10);

    if (!["morning", "afternoon", "evening", "wholeday"].includes(nextSlot)) {
      return res.status(400).json({ message: "slot must be morning|afternoon|evening|wholeday" });
    }

    const dateObj = new Date(`${nextDateStr}T00:00:00.000Z`);
    if (Number.isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const conflictSlots = nextSlot === "wholeday"
      ? ["morning", "afternoon", "evening", "wholeday"]
      : nextSlot === "morning"
        ? ["morning", "wholeday"]
        : nextSlot === "afternoon"
          ? ["afternoon", "wholeday"]
          : ["evening", "wholeday"];

    const rangeStart = dateObj;
    const rangeEnd = new Date(rangeStart);
    rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);

    const blocking = await Booking.findOne({
      _id: { $ne: booking._id },
      hallId: nextHallId,
      date: { $gte: rangeStart, $lt: rangeEnd },
      slot: { $in: conflictSlots },
      status: { $in: ["PENDING", "CONFIRMED", "COMPLETED"] },
    }).select("_id status slot").lean();

    if (blocking) {
      return res.status(400).json({ message: "Hall not available for the selected date/slot" });
    }

    updates.hallId = nextHallId;
    updates.slot = nextSlot;
    updates.date = dateObj;

    booking.set(updates);
    await booking.save();

    return res.json({ message: "Booking updated", booking });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/payment", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, gateway } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const nextStatus = (status || "").toUpperCase();
    const allowedStatuses = ["INITIATED", "COMPLETED", "FAILED", "REFUNDED"];
    if (!allowedStatuses.includes(nextStatus)) {
      return res.status(400).json({ message: "status must be INITIATED|COMPLETED|FAILED|REFUNDED" });
    }

    const normalizedGateway = gateway ? String(gateway).toUpperCase() : null;
    if (normalizedGateway) {
      const allowedGateways = ["KHALTI", "ESEWA", "CASH"];
      if (!allowedGateways.includes(normalizedGateway)) {
        return res.status(400).json({ message: "gateway must be KHALTI|ESEWA|CASH" });
      }
    }

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    let payment; // Declare outside try block for access in email sending and response

    // Start transaction for atomic payment and booking updates
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      payment = booking.paymentId ? await Payment.findById(booking.paymentId).session(session) : null;
      if (!payment) {
        payment = await Payment.findOne({ bookingId: booking._id }).sort({ createdAt: -1 }).session(session);
      }

      if (!payment) {
        // Create new payment with provided gateway or default to CASH
        const createGateway = normalizedGateway || "CASH";
        payment = await Payment.create(
          [{
            bookingId: booking._id,
            userId: booking.userId,
            amount: booking.totalAmount,
            gateway: createGateway,
            status: "INITIATED",
          }],
          { session }
        );
        payment = payment[0]; // Create returns array with transaction session
      }

      payment.status = nextStatus;
      // Only update gateway if it was provided by the client
      if (normalizedGateway) {
        payment.gateway = normalizedGateway;
      }
      payment.paidAt = nextStatus === "COMPLETED" ? payment.paidAt || new Date() : null;
      await payment.save({ session });

      if (!booking.paymentId || String(booking.paymentId) !== String(payment._id)) {
        booking.paymentId = payment._id;
        await booking.save({ session });
      }

      await session.commitTransaction();
      
      // Re-fetch payment after transaction commits for response
      payment = await Payment.findById(payment._id);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    // Auto-send invoice email when payment is marked COMPLETED
    if (nextStatus === "COMPLETED" && ["CONFIRMED", "COMPLETED"].includes(booking.status)) {
      try {
        const user = await User.findById(booking.userId).select('email first_name last_name');
        const hall = await Booking.findById(booking._id).populate('hallId', 'name').select('hallId');
        
        if (user && user.email) {
          await sendInvoiceEmail(user.email, `${user.first_name || ''} ${user.last_name || ''}`.trim(), {
            bookingId: String(booking._id),
            venue: hall?.hallId?.name || 'Shubham Venue',
            eventDate: booking.date ? new Date(booking.date).toLocaleDateString('en-NP') : 'TBD',
            slot: booking.slot || 'N/A',
            guests: booking.guests || 0,
            totalAmount: booking.totalAmount || 0,
            paymentStatus: 'COMPLETED',
            bookingStatus: booking.status || 'PENDING'
          }, null);

          await sendPaymentConfirmationEmail(user.email, `${user.first_name || ''} ${user.last_name || ''}`.trim(), {
            bookingId: String(booking._id),
            amount: booking.totalAmount || 0,
            gateway: payment.gateway || 'CASH',
            transactionId: payment.transactionId || 'N/A',
            paidAt: payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-NP') : 'Today'
          });
        }
      } catch (emailError) {
        console.error('Error sending invoice/payment confirmation email:', emailError);
        // Don't fail the booking update if email fails
      }
    }

    return res.json({ message: "Payment updated", payment });
  } catch (err) {
    next(err);
  }
});

// Send invoice email manually
router.post("/:id/send-invoice", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id).populate('hallId', 'name');
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (!["CONFIRMED", "COMPLETED"].includes(booking.status)) {
      return res.status(400).json({ message: "Invoice can only be sent after admin approval" });
    }

    const payment = await Payment.findOne({ bookingId: booking._id }).sort({ createdAt: -1 });
    if (!payment || payment.status !== "COMPLETED") {
      return res.status(400).json({ message: "Invoice can only be sent for completed payments" });
    }

    const user = await User.findById(booking.userId).select('email first_name last_name');
    if (!user || !user.email) {
      return res.status(400).json({ message: "User email not found" });
    }

    await sendInvoiceEmail(user.email, `${user.first_name || ''} ${user.last_name || ''}`.trim(), {
      bookingId: String(booking._id),
      venue: booking.hallId?.name || 'Shubham Venue',
      eventDate: booking.date ? new Date(booking.date).toLocaleDateString('en-NP') : 'TBD',
      slot: booking.slot || 'N/A',
      guests: booking.guests || 0,
      totalAmount: booking.totalAmount || 0,
      paymentStatus: 'COMPLETED',
      bookingStatus: booking.status || 'PENDING'
    }, null);

    return res.json({ message: "Invoice sent successfully to customer email" });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const deleted = await Booking.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Booking not found" });

    return res.json({ message: "Booking deleted" });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const {
      status,
      hallId,
      dateFrom,
      dateTo,
      q,
      page = 1,
      limit = 20,
    } = req.query || {};

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const match = {};
    const statusUpper = (status || "").toUpperCase();
    if (["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(statusUpper)) {
      match.status = statusUpper;
    }

    if (hallId && mongoose.Types.ObjectId.isValid(hallId)) {
      match.hallId = new mongoose.Types.ObjectId(hallId);
    }

    if (dateFrom || dateTo) {
      match.date = {};
      if (dateFrom) {
        const fromDate = new Date(`${dateFrom}T00:00:00.000Z`);
        if (Number.isNaN(fromDate.getTime())) return res.status(400).json({ message: "Invalid dateFrom" });
        match.date.$gte = fromDate;
      }
      if (dateTo) {
        const toDate = new Date(`${dateTo}T23:59:59.999Z`);
        if (Number.isNaN(toDate.getTime())) return res.status(400).json({ message: "Invalid dateTo" });
        match.date.$lte = toDate;
      }
    }

    const search = (q || "").trim();
    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
        match._id = new mongoose.Types.ObjectId(search);
      } else {
        const users = await User.find({
          $or: [
            { first_name: search },
            { last_name: search },
            { email: search },
          ],
        })
          .collation({ locale: "en", strength: 2 })
          .select("_id")
          .lean();

        const userIds = users.map((u) => u._id);
        if (!userIds.length) {
          return res.json({ items: [], page: pageNum, limit: limitNum, total: 0, pages: 1 });
        }
        match.userId = { $in: userIds };
      }
    }

    const [items, total] = await Promise.all([
      Booking.find(match)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate({ path: "userId", select: "first_name last_name email profilePicture" })
        .populate({ path: "hallId", select: "name" })
        .populate({ path: "paymentId", select: "status gateway amount paidAt" })
        .lean(),
      Booking.countDocuments(match),
    ]);

    const normalized = items.map((b) => ({
      id: b._id,
      hall: { id: b.hallId?._id, name: b.hallId?.name },
      user: {
        id: b.userId?._id,
        firstName: b.userId?.first_name,
        lastName: b.userId?.last_name,
        email: b.userId?.email,
        profilePicture: b.userId?.profilePicture,
      },
      date: b.date,
      slot: b.slot,
      guests: b.guests,
      totalAmount: b.totalAmount,
      status: b.status,
      createdAt: b.createdAt,
      payment: b.paymentId
        ? {
            id: b.paymentId?._id,
            status: b.paymentId?.status,
            gateway: b.paymentId?.gateway,
            amount: b.paymentId?.amount,
            paidAt: b.paymentId?.paidAt,
          }
        : null,
    }));

    return res.json({
      items: normalized,
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.max(1, Math.ceil(total / limitNum)),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id)
      .populate({ path: "userId", select: "first_name last_name email phone profilePicture" })
      .populate({ path: "hallId", select: "name capacity price" })
      .populate({ path: "paymentId", select: "status gateway amount paidAt transactionId" })
      .lean();

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const decoration = booking.decorationScheme?.schemeId && mongoose.Types.ObjectId.isValid(booking.decorationScheme.schemeId)
      ? await DecorationScheme.findById(booking.decorationScheme.schemeId).select("name price slug _id").lean()
      : null;

    let menuDoc = null;
    if (booking.menuMode === "package") {
      const pkgId = booking.selectedMenu?.[0]?.itemId;
      if (pkgId && mongoose.Types.ObjectId.isValid(pkgId)) {
        menuDoc = await Menu.findById(pkgId).select("name pricePerPerson slug _id").lean();
      }
    }

    const payments = await Payment.find({ bookingId: booking._id })
      .sort({ createdAt: -1 })
      .select("status gateway amount paidAt transactionId createdAt")
      .lean();

    return res.json({
      id: booking._id,
      user: booking.userId,
      hall: booking.hallId,
      date: booking.date,
      slot: booking.slot,
      guests: booking.guests,
      eventType: booking.eventType,
      eventName: booking.eventName,
      specialRequirements: booking.specialRequirements,
      totalAmount: booking.totalAmount,
      status: booking.status,
      menu: {
        mode: booking.menuMode,
        selection: booking.selectedMenu,
        total: booking.menuTotal,
        package: menuDoc
          ? { id: menuDoc._id, name: menuDoc.name, slug: menuDoc.slug, pricePerPerson: menuDoc.pricePerPerson }
          : null,
      },
      decorations: {
        scheme: decoration
          ? { id: decoration._id, name: decoration.name, slug: decoration.slug, price: decoration.price }
          : booking.decorationScheme || null,
        addons: booking.addons || [],
        total: booking.decorationTotal,
      },
      pricing: {
        hallPrice: booking.hallPrice,
        menuTotal: booking.menuTotal,
        decorationTotal: booking.decorationTotal,
        totalAmount: booking.totalAmount,
      },
      reservedUntil: booking.reservedUntil,
      confirmedAt: booking.confirmedAt,
      cancelledAt: booking.cancelledAt,
      cancellationReason: booking.cancellationReason,
      createdAt: booking.createdAt,
      payment: booking.paymentId || null,
      payments,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
