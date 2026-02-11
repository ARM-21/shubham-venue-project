import express from "express";
import User from "../../../models/User.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = (req.query.q || "").trim();

    const filter = {};
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ first_name: regex }, { last_name: regex }, { email: regex }, { username: regex }];
    }

    const [users, total, verifiedCount, adminCount] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("first_name last_name email username role provider isVerified phone profilePicture createdAt")
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

export default router;
