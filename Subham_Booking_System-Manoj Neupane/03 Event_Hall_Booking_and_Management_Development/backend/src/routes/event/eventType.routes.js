import express from "express";
import { isAuthenticated, isAdmin } from "../../middleware/auth.middleware.js";
import {
    createEventTypeHandler,
    deleteEventTypeHandler,
    getAllEvents,
    getEventType,
    updateEventTypeHandler,
} from "../../controllers/event/eventType.controller.js";

const router = express.Router();

router.get("/", getAllEvents);

router.get("/:id", getEventType);
router.post("/", isAuthenticated, isAdmin, createEventTypeHandler);
router.put("/:id", isAuthenticated, isAdmin, updateEventTypeHandler);
router.delete("/:id", isAuthenticated, isAdmin, deleteEventTypeHandler);

export default router;