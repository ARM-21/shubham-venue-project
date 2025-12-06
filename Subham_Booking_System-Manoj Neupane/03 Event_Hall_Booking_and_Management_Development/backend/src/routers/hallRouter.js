import express from "express";
import { listHalls, getHall } from "../controllers/hallController.js";

const router = express.Router();


router.get("/", listHalls);


router.get("/:slug", getHall);

export default router;
