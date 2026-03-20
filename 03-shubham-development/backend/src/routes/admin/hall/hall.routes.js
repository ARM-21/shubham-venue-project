import express from "express";
import {
  adminListHallsHandler,
  adminCreateHallHandler,
  adminUpdateHallHandler,
  adminHallUploadUrlHandler,
  adminDeleteHallHandler,
  adminGetHallHandler,
} from "../../../controllers/admin/hall.controller.js";

const router = express.Router();

router.post("/upload-url", adminHallUploadUrlHandler);
router.get("/", adminListHallsHandler);
router.post("/", adminCreateHallHandler);
router.get("/:id", adminGetHallHandler);
router.patch("/:id", adminUpdateHallHandler);
router.delete("/:id", adminDeleteHallHandler);

export default router;
