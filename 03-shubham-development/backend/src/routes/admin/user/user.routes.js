import express from "express";
import User from "../../../models/User.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = (req.query.q || "").trim();

    const filter = {};
    const { role, provider, isVerified, isActive, organizerStatus, organizerEnabled } = req.query;

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ first_name: regex }, { last_name: regex }, { email: regex }, { username: regex }];
    }

    const allowedRoles = ["customer", "admin"];
    if (role && allowedRoles.includes(role)) {
      filter.role = role;
    }

    const allowedProviders = ["local", "google"];
    if (provider && allowedProviders.includes(provider)) {
      filter.provider = provider;
    }

    if (typeof isVerified !== "undefined") {
      filter.isVerified = String(isVerified) === "true";
    }

    if (typeof isActive !== "undefined") {
      filter.isActive = String(isActive) === "true";
    }

    const allowedOrganizerStatuses = ["none", "pending", "approved", "rejected"];
    if (organizerStatus && allowedOrganizerStatuses.includes(organizerStatus)) {
      filter.organizerStatus = organizerStatus;
    }

    if (typeof organizerEnabled !== "undefined") {
      filter.isOrganizerEligible = String(organizerEnabled) === "true";
    }

    const [users, total, verifiedCount, adminCount] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select(
          "first_name last_name email username role provider isVerified phone profilePicture createdAt isActive organizerStatus organizerRequestedAt organizerNote isOrganizerEligible",
        )
        .lean(),
      User.countDocuments(filter),
      User.countDocuments({ ...filter, isVerified: true }),
      User.countDocuments({ ...filter, role: "admin" }),
    ]);

    const normalized = users.map((u) => {
      const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || u.email;
      return {
        id: u._id,
        name,
        email: u.email,
        username: u.username,
        role: u.role || "customer",
        provider: u.provider || "local",
        isVerified: Boolean(u.isVerified),
        isActive: u.isActive !== false,
        organizerStatus: u.organizerStatus || "none",
        organizerEnabled: Boolean(u.isOrganizerEligible),
        isOrganizerEligible: Boolean(u.isOrganizerEligible),
        organizerNote: u.organizerNote || "",
        organizerRequestedAt: u.organizerRequestedAt,
        phone: u.phone || "",
        profilePicture: u.profilePicture || "",
        createdAt: u.createdAt,
      };
    });

    res.json({
      users: normalized,
      total,
      verified: verifiedCount,
      admins: adminCount,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select(
        "first_name last_name email username role provider isVerified phone profilePicture createdAt updatedAt isActive organizerStatus organizerNote organizerRequestedAt isOrganizerEligible",
      )
      .lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || user.email;

    res.json({
      user: {
        id: user._id,
        name,
        email: user.email,
        username: user.username,
        role: user.role,
        provider: user.provider,
        isVerified: Boolean(user.isVerified),
        isActive: user.isActive !== false,
        organizerStatus: user.organizerStatus || "none",
        organizerEnabled: Boolean(user.isOrganizerEligible),
        isOrganizerEligible: Boolean(user.isOrganizerEligible),
        organizerNote: user.organizerNote || "",
        organizerRequestedAt: user.organizerRequestedAt,
        phone: user.phone || "",
        profilePicture: user.profilePicture || "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    if (typeof req.body.isActive !== "boolean") {
      return res.status(400).json({ message: "isActive boolean is required" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true }).select("_id isActive");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User status updated", isActive: user.isActive });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/reset-password", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("_id email provider");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.provider === "google") {
      return res.status(400).json({ message: "Password is managed by Google for this account" });
    }
    // TODO: integrate email service to send reset link
    res.json({ message: "Password reset link dispatched" });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/role", async (req, res, next) => {
  try {
    const allowedRoles = ["customer", "admin"];
    const { role } = req.body;
    if (!allowedRoles.includes(role)) return res.status(400).json({ message: "Invalid role" });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("_id role");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Role updated", role: user.role });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/organizer", async (req, res, next) => {
  try {
    const { status = "approved", note = "" } = req.body;
    const allowed = ["pending", "approved", "rejected", "none"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid organizer status" });

    const update = {
      organizerStatus: status,
      organizerNote: note,
      organizerRequestedAt: status === "pending" ? new Date() : null,
      isOrganizerEligible: status === "approved",
    };

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("_id organizerStatus role isOrganizerEligible");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      message: "Organizer status updated",
      organizerStatus: user.organizerStatus,
      role: user.role,
      isOrganizerEligible: user.isOrganizerEligible,
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
