import express from "express";
import { getMenusAndDishes, createMenu, updateDishStatus, updateDishDetails, updateMenuDetails, updateMenuStatus, removeMenu, getMenuDetail, adminMenuUploadUrlHandler, adminDishUploadUrlHandler, getDishesBySection, createDishHandler, deleteDishHandler } from "../../../controllers/admin/menu.controller.js";
import { getSectionsHandler, createSectionHandler, updateSectionHandler, deleteSectionHandler, reorderSectionsHandler, getMenuSections, createMenuSection, updateMenuSection, deleteMenuSection, reorderMenuSections, attachMenuSection, detachMenuSection } from "../../../controllers/admin/menu.section.controller.js";

const router = express.Router();

router.get("/", getMenusAndDishes);
router.post("/", createMenu);
router.post("/upload-url", adminMenuUploadUrlHandler);
router.post("/upload-url/dish", adminDishUploadUrlHandler);
router.get("/sections", getSectionsHandler);
router.post("/sections", createSectionHandler);
router.patch("/sections/:id", updateSectionHandler);
router.delete("/sections/:id", deleteSectionHandler);
router.post("/sections/reorder", reorderSectionsHandler);

// menu specific section routes (use slug)
router.get("/:slug/sections", getMenuSections);
router.post("/:slug/sections", createMenuSection);
router.post("/:slug/sections/attach", attachMenuSection);
router.patch("/:slug/sections/:id", updateMenuSection);
router.delete("/:slug/sections/:id", deleteMenuSection);
router.delete("/:slug/sections/:id/detach", detachMenuSection);
router.post("/:slug/sections/reorder", reorderMenuSections);

// admin: list dishes by section id
router.get("/dishes", getDishesBySection);
router.post("/dishes", createDishHandler);


router.get("/:slug", getMenuDetail);
router.patch("/:id/status", updateMenuStatus);
router.patch("/dishes/:id/status", updateDishStatus);
router.patch("/dishes/:id", updateDishDetails);
router.delete("/dishes/:id", deleteDishHandler);
router.patch("/:id", updateMenuDetails);
router.delete("/:id", removeMenu);

export default router;
