import express from "express";
import Payment from "../../../models/Payment.js";

const router = express.Router();

// GET /admin/reports/summary
router.get("/summary", async (req, res, next) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // totals
    const [totalTransactions, pendingCount, revenueAgg] = await Promise.all([
      Payment.countDocuments({}),
      Payment.countDocuments({ status: { $in: ["INITIATED"] } }),
      Payment.aggregate([
        { $match: { status: "COMPLETED" } },
        { $group: { _id: null, sum: { $sum: "$amount" } } },
      ]),
    ]);

    const revenueTotal = Number((revenueAgg?.[0]?.sum || 0).toFixed(2));

    // revenue per month (last 6 months)
    const recentPayments = await Payment.find({ status: "COMPLETED", createdAt: { $gte: sixMonthsAgo } })
      .select("createdAt amount")
      .lean();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const labels = [];
    const points = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      labels.push(monthNames[d.getMonth()]);
      const monthTotal = recentPayments
        .filter((p) => `${p.createdAt.getFullYear()}-${p.createdAt.getMonth()}` === key)
        .reduce((s, p) => s + (p.amount || 0), 0);
      points.push(monthTotal);
    }

    // recent transactions (limit 5)
    const recent = await Payment.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: "userId", select: "first_name last_name email profilePicture" })
      .populate({ path: "bookingId", populate: { path: "hallId", select: "name" } })
      .lean();

    const recentTransactions = recent.map((p) => ({
      id: p._id,
      transactionId: p.transactionId,
      client: p.userId ? `${p.userId.first_name || ""} ${p.userId.last_name || ""}`.trim() || p.userId.email : "Client",
      event: p.bookingId?.hallId?.name || p.bookingId?.eventName || "Event",
      date: p.createdAt,
      amount: p.amount,
      status: p.status,
      invoiceUrl: p.invoiceUrl || null,
    }));

    return res.json({
      totals: { transactions: totalTransactions, revenue: revenueTotal, pending: pendingCount },
      revenue: { labels, points },
      recentTransactions,
    });
  } catch (err) {
    return next(err);
  }
});

// GET /admin/reports/transactions
router.get("/transactions", async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, startDate, endDate } = req.query || {};
    const q = {};
    if (status) {
      // accept paid/pending/overdue etc
      const map = {
        paid: "COMPLETED",
        pending: "INITIATED",
        overdue: "INITIATED",
      };
      q.status = map[status.toLowerCase()] || status.toUpperCase();
    }

    if (startDate || endDate) {
      q.createdAt = {};
      if (startDate) q.createdAt.$gte = new Date(startDate);
      if (endDate) q.createdAt.$lte = new Date(endDate);
    }

    const pg = Math.max(1, Number(page));
    const lim = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pg - 1) * lim;

    const [items, total] = await Promise.all([
      Payment.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .populate({ path: "userId", select: "first_name last_name email profilePicture" })
        .populate({ path: "bookingId", populate: { path: "hallId", select: "name" } })
        .lean(),
      Payment.countDocuments(q),
    ]);

    const transactions = items.map((p) => ({
      id: p._id,
      transactionId: p.transactionId,
      client: p.userId ? `${p.userId.first_name || ""} ${p.userId.last_name || ""}`.trim() || p.userId.email : "Client",
      event: p.bookingId?.hallId?.name || p.bookingId?.eventName || "Event",
      date: p.createdAt,
      amount: p.amount,
      status: p.status,
      invoiceUrl: p.invoiceUrl || null,
    }));

    return res.json({ transactions, total, page: pg, limit: lim });
  } catch (err) {
    return next(err);
  }
});

export default router;
