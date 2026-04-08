import express from "express";
import { isValidObjectId } from "mongoose";
import {checkHallAvailabilityHandler, getHallBySlugHandler, getHallByIdHandler, listHallsAvailabilityHandler, listHallsHandler } from "../../controllers/hall/hall.controller.js";

const router = express.Router();

router.get("/", listHallsHandler);

router.post("/:hallId/availability", checkHallAvailabilityHandler);
router.get("/availability", listHallsAvailabilityHandler);

// Single handler for both ID and slug - handles both cases
router.get("/:idOrSlug", async (req, res, next) => {
  const param = req.params.idOrSlug;
  
  try {
    if (isValidObjectId(param)) {
      // It's a MongoDB ID
      return await getHallByIdHandler(req, res, next);
    } else {
      // It's a slug
      return await getHallBySlugHandler(req, res, next);
    }
  } catch (err) {
    return next(err);
  }
});

export default router;
