import express from "express";
import {
  createDecorationAddon,
  createDecorationScheme,
  deleteDecorationAddon,
  deleteDecorationScheme,
  listAdminDecorations,
  updateDecorationAddon,
  updateDecorationAddonStatus,
  updateDecorationScheme,
  updateDecorationSchemeStatus,
} from "../../../controllers/admin/decoration.controller.js";

const router = express.Router();

router.get("/", listAdminDecorations);

router.post("/schemes", createDecorationScheme);
router.patch("/schemes/:id/status", updateDecorationSchemeStatus);
router.patch("/schemes/:id", updateDecorationScheme);
router.delete("/schemes/:id", deleteDecorationScheme);

router.post("/addons", createDecorationAddon);
router.patch("/addons/:id/status", updateDecorationAddonStatus);
router.patch("/addons/:id", updateDecorationAddon);
router.delete("/addons/:id", deleteDecorationAddon);

export default router;
