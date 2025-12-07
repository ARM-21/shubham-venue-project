import express from "express";
import Menu from "../models/menu/Menu.js";
import MenuSection from "../models/menu/MenuSection.js";
import Dish from "../models/menu/Dish.js";
import EventType from "../models/EventType.js";

const router = express.Router();

// Placeholder route handlers for event types
router.get("/", async  (req, res) => {
    const events = await EventType.find();
    res.status(200).json(events);
});

router.get("/:id", (req, res) => {
    res.status(200).json({ message: `Get event type with ID: ${req.params.id}` });
});

router.post("/", (req, res) => {
    res.status(201).json({ message: "Create a new event type" });
});

router.put("/:id", (req, res) => {
    res.status(200).json({ message: `Update event type with ID: ${req.params.id}` });
});

router.delete("/:id", (req, res) => {
    res.status(200).json({ message: `Delete event type with ID: ${req.params.id}` });
});

export default router;