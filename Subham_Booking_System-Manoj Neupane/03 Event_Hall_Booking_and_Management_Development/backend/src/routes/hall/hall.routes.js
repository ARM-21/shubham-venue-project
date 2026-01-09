import express from "express";
import {checkHallAvailabilityHandler, getHallBySlugHandler, listHallsAvailabilityHandler, listHallsHandler } from "../../controllers/hall/hall.controller.js";

const router = express.Router();


router.get("/", listHallsHandler);

router.post("/:hallId/availability", checkHallAvailabilityHandler);
router.get("/availability", listHallsAvailabilityHandler);
router.get("/:slug", getHallBySlugHandler);

export default router;
