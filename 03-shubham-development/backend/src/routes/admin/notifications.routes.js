import express from "express";
import AdminNotification from "../../models/AdminNotification.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 8));
    const unreadOnly = String(req.query.unreadOnly || "false") === "true";
    const filter = { adminId: req.currentUser._id };
    if (unreadOnly) filter.isRead = false;

    const [items, total, unreadCount] = await Promise.all([
      AdminNotification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AdminNotification.countDocuments(filter),
      AdminNotification.countDocuments({ adminId: req.currentUser._id, isRead: false }),
    ]);

    return res.json({
      items,
      total,
      unreadCount,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    return next(err);
  }
});

router.patch("/read-all", async (req, res, next) => {
  try {
    await AdminNotification.updateMany({ adminId: req.currentUser._id, isRead: false }, { isRead: true });
    return res.json({ message: "Notifications marked as read" });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id/read", async (req, res, next) => {
  try {
    const notification = await AdminNotification.findOneAndUpdate(
      { _id: req.params.id, adminId: req.currentUser._id },
      { isRead: true },
      { new: true },
    ).lean();

    if (!notification) return res.status(404).json({ message: "Notification not found" });
    return res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    return next(err);
  }
});

export default router;
