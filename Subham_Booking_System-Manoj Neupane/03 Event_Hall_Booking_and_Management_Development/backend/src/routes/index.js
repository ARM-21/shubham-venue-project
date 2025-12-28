import express from "express";

/**ROutes related imports */
import menuRoutes from "./menu/menu.routes.js"
import eventTypeRoutes from "./event/eventType.routes.js"
import dishRoutes from "./menu/dish.routes.js";
import googleAuthRoutes from "./auth/google.auth.routes.js"
import authRoutes from "./auth/auth.routes.js"
import profileRoutes from "./user/profile.routes.js"
import hallRoutes from "./hall/hall.routes.js"

const router = express.Router();


router.use("/auth", authRoutes)
router.use("/auth/google", googleAuthRoutes)
router.use("/profile", profileRoutes)
router.use("/halls", hallRoutes)
router.use("/event-types", eventTypeRoutes)
router.use("/menus", menuRoutes)
router.use("/dishes", dishRoutes)

export default router;