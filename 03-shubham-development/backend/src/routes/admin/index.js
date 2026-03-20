import express from "express";
import { isAuthenticated, isAdmin } from "../../middleware/auth.middleware.js";
import bookingAdminRoutes from "./booking/booking.routes.js";
import userAdminRoutes from "./user/user.routes.js";
import overviewAdminRoutes from "./overview/overview.routes.js";
import reportsAdminRoutes from "./reports/reports.routes.js";
import hallAdminRoutes from "./hall/hall.routes.js";
import menuAdminRoutes from "./menus/menu.routes.js";
import settingsRoutes from "./settings.routes.js";
import notificationRoutes from "./notifications.routes.js";

const router = express.Router();

// protect all admin routes
router.use(isAuthenticated, isAdmin);

router.use("/bookings", bookingAdminRoutes);
router.use("/users", userAdminRoutes);
router.use("/halls", hallAdminRoutes);
router.use("/menus", menuAdminRoutes);
router.use("/settings", settingsRoutes);
router.use("/reports", reportsAdminRoutes);
router.use("/notifications", notificationRoutes);
router.use("/", overviewAdminRoutes);

export default router;
