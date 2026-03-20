import express from "express";
import { listDecorationSchemes, listDecorationAddons } from "../../controllers/decoration/decoration.controller.js";

const router = express.Router();

router.get("/schemes", listDecorationSchemes);
router.get("/addons", listDecorationAddons);

export default router;
