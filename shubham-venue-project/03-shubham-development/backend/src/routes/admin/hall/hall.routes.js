import express from "express";
import {
  adminListHallsHandler,
  adminCreateHallHandler,
  adminUpdateHallHandler,
  adminHallUploadUrlHandler,
} from "../../../controllers/admin/hall.controller.js";

const router = express.Router();

router.post("/upload-url", adminHallUploadUrlHandler);
router.get("/", adminListHallsHandler);
router.post("/", adminCreateHallHandler);
router.patch("/:id", adminUpdateHallHandler);

export default router;
