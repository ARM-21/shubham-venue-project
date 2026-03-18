import { success } from "../../utils/http.utils.js";
import { createEventType, deleteEventType, getEventTypeById, listEventTypes, updateEventType } from "../../services/event/eventType.service.js";

function buildAudienceFilter(audience) {
    if (!audience) return {};
    if (audience === "organizer") return { audience: { $in: ["organizer", "both"] } };
    if (audience === "customer") return { audience: { $in: ["customer", "both"] } };
    if (audience === "both") return { audience: "both" };
    return {};
}

export const getAllEvents = async (req, res, next) => {
    try {
        const audience = String(req.query?.audience || "").toLowerCase();
        const filter = buildAudienceFilter(audience);
        const events = await listEventTypes(filter);
        return success(res, { events }, "Events fetched successfully", 200);
    } catch (err) {
        return next(err);
    }
};

export const getEventType = async (req, res, next) => {
    try {
        const eventType = await getEventTypeById(req.params.id);
        return success(res, { eventType }, "Event type fetched", 200);
    } catch (err) {
        return next(err);
    }
};

export const createEventTypeHandler = async (req, res, next) => {
    try {
        const { name, description = "", audience = "customer", defaultMenuId = null, price = 0 } = req.body || {};
        if (!name || !String(name).trim()) {
            return res.status(400).json({ message: "Event type name is required" });
        }

        const payload = {
            name: String(name).trim(),
            description: String(description || "").trim(),
            audience: ["customer", "organizer", "both"].includes(audience) ? audience : "customer",
            defaultMenuId: defaultMenuId || null,
            price: Number(price) || 0,
            createdBy: req.currentUser?._id || null,
        };

        const eventType = await createEventType(payload);
        return success(res, { eventType }, "Event type created", 201);
    } catch (err) {
        return next(err);
    }
};

export const updateEventTypeHandler = async (req, res, next) => {
    try {
        const patch = { ...req.body };
        if (patch.name !== undefined && !String(patch.name).trim()) {
            return res.status(400).json({ message: "Event type name is required" });
        }
        if (patch.name !== undefined) patch.name = String(patch.name).trim();
        if (patch.description !== undefined) patch.description = String(patch.description || "").trim();
        if (patch.audience !== undefined && !["customer", "organizer", "both"].includes(patch.audience)) {
            return res.status(400).json({ message: "Invalid audience" });
        }
        if (patch.price !== undefined) patch.price = Number(patch.price) || 0;

        const eventType = await updateEventType(req.params.id, patch);
        return success(res, { eventType }, "Event type updated", 200);
    } catch (err) {
        return next(err);
    }
};

export const deleteEventTypeHandler = async (req, res, next) => {
    try {
        await deleteEventType(req.params.id);
        return success(res, {}, "Event type deleted", 200);
    } catch (err) {
        return next(err);
    }
};