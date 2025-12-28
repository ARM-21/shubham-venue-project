import express from "express";
import { getHallBySlugHandler, listHallsHandler } from "../../controllers/hall/hall.controller.js";

const router = express.Router();


router.get("/", listHallsHandler);


router.get("/:slug", getHallBySlugHandler);

export default router;
