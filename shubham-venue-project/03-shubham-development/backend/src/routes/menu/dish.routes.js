import express from "express";
import { getAllDishes } from "../../controllers/menu/dish.controller.js";

const router = express.Router();

// Placeholder route handlers for dishes
router.get("/", getAllDishes);

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