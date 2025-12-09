import express from "express";
import Dish from "../models/menu/Dish.js";

const router = express.Router();

// Placeholder route handlers for dishes
router.get("/", async (req, res) => {
    const dishes = await Dish.find().populate("section").lean();
    res.status(200).json(dishes);
});

router.get("/:id", (req, res) => {
    res.status(200).json({ message: `Get dish with ID: ${req.params.id}` });
});

router.post("/", (req, res) => {
    res.status(201).json({ message: "Create a new dish" });
});

router.put("/:id", (req, res) => {
    res.status(200).json({ message: `Update dish with ID: ${req.params.id}` });
});

router.delete("/:id", (req, res) => {
    res.status(200).json({ message: `Delete dish with ID: ${req.params.id}` });
});

export default router;