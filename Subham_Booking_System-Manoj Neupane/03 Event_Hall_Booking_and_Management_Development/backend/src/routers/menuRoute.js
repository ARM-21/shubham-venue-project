import express from "express";
import Menu from "../models/menu/Menu.js";
import MenuSection from "../models/menu/MenuSection.js";
import Dish from "../models/menu/Dish.js";

const router = express.Router();

// Placeholder route handlers for event types
router.get("/",  async (req, res) => {
   const menus = await Menu.find().populate({path: "sections.section"}).populate({path: "sections.dishes", select:"-section"}).lean();
    res.status(200).json(menus);
});

router.get("/:id", async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id)
      .populate("sections.section")
      .populate("sections.dishes")
      .lean();
    if (!menu) return res.status(404).json({ message: "Menu not found" });
    return res.status(200).json(menu);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
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