import express from "express";
import SystemConfig from "../models/SystemConfig.js";

/**ROutes related imports */
import menuRoutes from "./menu/menu.routes.js"
import eventTypeRoutes from "./event/eventType.routes.js"
import eventsRoutes from "./event/events.routes.js"
import dishRoutes from "./menu/dish.routes.js";
import googleAuthRoutes from "./auth/google.auth.routes.js"
import authRoutes from "./auth/auth.routes.js"
import profileRoutes from "./user/profile.routes.js"
import hallRoutes from "./hall/hall.routes.js"
import bookingRoutes from "./booking/booking.routes.js"
import paymentRoutes from "./payment/payment.routes.js"
import ticketRoutes from "./ticket/tickets.routes.js"
import decorationRoutes from "./decoration/decoration.routes.js"
import adminRoutes from "./admin/index.js"
import organizerRequestRoutes from "./organizer/organizer-requests.routes.js"
import organizerRoutes from "./organizer/organizer.routes.js"

const router = express.Router();

router.get("/config", async (req, res, next) => {
	try {
		const config = await SystemConfig.findOne({ key: "default" }).lean();
		return res.json({ maintenanceMode: !!config?.maintenanceMode });
	} catch (err) {
		return next(err);
	}
});


router.use("/auth", authRoutes)
router.use("/auth/google", googleAuthRoutes)
router.use("/profile", profileRoutes)
router.use("/halls", hallRoutes)
router.use("/event-types", eventTypeRoutes)
router.use("/events", eventsRoutes)
router.use("/menus", menuRoutes)
router.use("/dishes", dishRoutes)
router.use("/bookings", bookingRoutes)
router.use("/payments", paymentRoutes)
router.use("/tickets", ticketRoutes)
router.use("/decorations", decorationRoutes)
router.use("/organizer-requests", organizerRequestRoutes)
router.use("/organizer", organizerRoutes)
router.use("/admin", adminRoutes)

export default router;