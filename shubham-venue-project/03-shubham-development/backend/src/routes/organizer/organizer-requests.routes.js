import express from "express";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import User from "../../models/User.js";
import AdminNotification from "../../models/AdminNotification.js";
import { sendAdminOrganizerRequestEmail } from "../../services/email/email.service.js";

const router = express.Router();

router.post("/", isAuthenticated, async (req, res, next) => {
  try {
    const user = await User.findById(req.currentUser._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isOrganizerEligible || user.organizerStatus === "approved") {
      return res.status(400).json({ message: "Organizer access already approved" });
    }

    if (user.organizerStatus === "pending") {
      return res.status(400).json({ message: "Organizer request already pending" });
    }

    const note = String(req.body?.note || req.body?.message || "").trim();
    if (note.length > 500) {
      return res.status(400).json({ message: "Note must be 500 characters or less" });
    }

    user.organizerStatus = "pending";
    user.organizerRequestedAt = new Date();
    user.isOrganizerEligible = false;
    if (note) user.organizerNote = note;
    await user.save();

    const requesterName = user.username || user.email.split("@")[0] || " A User";
    const requestedAt = user.organizerRequestedAt
      ? `${user.organizerRequestedAt.toISOString().replace("T", " ").slice(0, 16)} UTC`
      : "";

    try {
      const adminUsers = await User.find({ role: 'admin' })
        .select("_id email notifyBookings")
        .lean();
        console.log("Admin users to notify about organizer request:", adminUsers);

      if (adminUsers.length) {
        const notifications = adminUsers.map((admin) => ({
          adminId: admin._id,
          type: "organizer_request",
          title: "Organizer access request",
          message: `${requesterName} requested organizer access.`,
          requestUserId: user._id,
          requestUserName: requesterName,
          requestUserEmail: user.email,
          note: note || "",
          actionPath: "/admin/users",
        }));

        await AdminNotification.insertMany(notifications);
      }

      const adminEmails = adminUsers
        .filter((admin) => admin.notifyBookings !== false)
        .map((admin) => admin.email)
        .filter(Boolean);

      await sendAdminOrganizerRequestEmail(adminEmails, {
        userName: requesterName,
        userEmail: user.email,
        note,
        requestedAt,
      });
    } catch (notifyErr) {
      console.error("Organizer request notification error:", notifyErr);
    }

    return res.status(201).json({
      message: "Organizer request submitted",
      organizerStatus: user.organizerStatus,
      organizerRequestedAt: user.organizerRequestedAt,
      organizerNote: user.organizerNote || "",
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/me", isAuthenticated, async (req, res, next) => {
  try {
    const user = await User.findById(req.currentUser._id)
      .select("organizerStatus organizerRequestedAt organizerNote isOrganizerEligible")
      .lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      organizerStatus: user.organizerStatus || "none",
      organizerRequestedAt: user.organizerRequestedAt || null,
      organizerNote: user.organizerNote || "",
      isOrganizerEligible: Boolean(user.isOrganizerEligible),
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
