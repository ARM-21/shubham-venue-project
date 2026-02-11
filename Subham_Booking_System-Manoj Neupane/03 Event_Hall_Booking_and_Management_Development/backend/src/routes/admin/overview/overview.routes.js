import express from "express";
import Booking from "../../../models/Booking.js";

const router = express.Router();

router.get("/overview", async (req, res, next) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [totalBookings, pendingCount, completedCount, revenueSum] = await Promise.all([
      Booking.countDocuments({}),
      Booking.countDocuments({ status: "PENDING" }),
      Booking.countDocuments({ status: "COMPLETED" }),
      Booking.aggregate([
        { $match: { status: { $in: ["CONFIRMED", "COMPLETED"] } } },
        { $group: { _id: null, sum: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const recentRevenue = await Booking.find({
      status: { $in: ["CONFIRMED", "COMPLETED"] },
      createdAt: { $gte: sixMonthsAgo },
    })
      .select("createdAt totalAmount")
      .lean();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const labels = [];
    const points = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      labels.push(monthNames[d.getMonth()]);
      const monthTotal = recentRevenue
        .filter((b) => `${b.createdAt.getFullYear()}-${b.createdAt.getMonth()}` === key)
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      points.push(monthTotal);
    }

    const statusCountsRaw = await Booking.find({}).select("status").lean();
    const statusCounts = statusCountsRaw.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});

    const recentBookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: "userId", select: "first_name last_name email profilePicture" })
      .populate({ path: "hallId", select: "name" })
      .lean();

    const upcoming = await Booking.find({ date: { $gte: now }, status: { $nin: ["CANCELLED"] } })
      .sort({ date: 1 })
      .limit(10)
      .populate({ path: "hallId", select: "name" })
      .lean();

    res.json({
      totals: {
        bookings: totalBookings,
        revenue: Number((revenueSum?.[0]?.sum || 0).toFixed(2)),
        pending: pendingCount,
        completed: completedCount,
      },
      revenue: { labels, points },
      statusCounts,
      recentBookings: recentBookings.map((b) => ({
        id: b._id,
        client: `${b.userId?.first_name || ""} ${b.userId?.last_name || ""}`.trim() || b.userId?.email || "Client",
        hall: b.hallId?.name || "Hall",
        date: b.date,
        amount: b.totalAmount,
        status: b.status?.toLowerCase?.() || "pending",
        statusLabel: b.status || "PENDING",
        profilePicture: b.userId?.profilePicture || null,

      })),
      upcoming: upcoming.map((b) => ({
        title: b.hallId?.name || "Hall",
        time: new Date(b.date).toLocaleString("en-US", { month: "short", day: "numeric" }) + " • " + (b.slot || ""),
        date: b.date,
        status: b.status,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
