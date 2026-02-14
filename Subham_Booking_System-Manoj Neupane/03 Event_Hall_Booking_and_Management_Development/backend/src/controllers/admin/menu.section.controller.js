import Menu from "../../models/menu/Menu.js";
import { createSection, listSections, updateSection, deleteSection, reorderSections } from "../../services/menu/section.service.js";
import { getMenuBySlug } from "../../services/menu/menu.service.js";
import { httpError } from "../../utils/http.utils.js";

export const getMenuSections = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug) throw httpError(400, "Menu slug is required");
    const menu = await Menu.findOne({ slug }).populate({ path: "sections.section" }).populate({ path: "sections.dishes", select: "-section" }).lean();
    if (!menu) throw httpError(404, "Menu not found");
    return res.json({ sections: menu.sections || [] });
  } catch (err) {
    return next(err);
  }
};

export const createMenuSection = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug) throw httpError(400, "Menu slug is required");
    const { title, description } = req.body || {};

    // ensure menu exists
    const menu = await Menu.findOne({ slug });
    if (!menu) throw httpError(404, "Menu not found");

    // create a global section document
    const section = await createSection({ title, description });

    // attach to menu
    menu.sections = menu.sections || [];
    menu.sections.unshift({ section: section._id, dishes: [] });
    await menu.save();

    return res.status(201).json({ section });
  } catch (err) {
    return next(err);
  }
};

export const updateMenuSection = async (req, res, next) => {
  try {
    const { slug, id } = req.params;
    if (!id) throw httpError(400, "Section id is required");
    const payload = req.body || {};

    // Update global section title/description when provided
    const sectionPatch = {};
    if (payload.title !== undefined) sectionPatch.title = String(payload.title || "").trim();
    if (payload.description !== undefined) sectionPatch.description = String(payload.description || "").trim();
    let updatedSection = null;
    if (Object.keys(sectionPatch).length) {
      updatedSection = await updateSection(id, sectionPatch);
    }

    // If menu-specific fields provided, update the Menu's section entry
    if (slug && (payload.dishes !== undefined || payload.selectLimit !== undefined)) {
      const menu = await Menu.findOne({ slug });
      if (!menu) throw httpError(404, "Menu not found");

      const idx = (menu.sections || []).findIndex((s) => String(s.section) === String(id));
      if (idx === -1) throw httpError(404, "Section not found in menu");

      if (Array.isArray(payload.dishes)) {
        menu.sections[idx].dishes = payload.dishes.map((d) => d);
      }
      if (payload.selectLimit !== undefined) {
        menu.sections[idx].selectLimit = Number(payload.selectLimit) || 0;
      }

      await menu.save();

      const updatedMenu = await Menu.findOne({ slug }).populate({ path: "sections.section" }).populate({ path: "sections.dishes", select: "-section" }).lean();
      const returned = (updatedMenu.sections || []).find((s) => String(s.section._id || s.section) === String(id));
      return res.json({ section: returned, global: updatedSection });
    }

    return res.json({ section: updatedSection });
  } catch (err) {
    return next(err);
  }
};

export const deleteMenuSection = async (req, res, next) => {
  try {
    const { slug, id } = req.params;
    if (!id) throw httpError(400, "Section id is required");

    // If a menu slug is provided, only detach the section reference from that menu.
    // Do NOT delete the global section document here because other menus may use it.
    if (slug) {
      const menu = await Menu.findOne({ slug });
      if (!menu) throw httpError(404, 'Menu not found');

      await Menu.updateOne({ slug }, { $pull: { sections: { section: id } } });
      const updated = await Menu.findOne({ slug }).populate({ path: 'sections.section' }).populate({ path: 'sections.dishes', select: '-section' }).lean();
      return res.json({ sections: updated.sections || [] });
    }

    // No slug: this is a global delete of the section document
    const deleted = await deleteSection(id);
    return res.json({ section: deleted });
  } catch (err) {
    return next(err);
  }
};

export const reorderMenuSections = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { order } = req.body || {};
    if (!slug) throw httpError(400, "Menu slug is required");
    if (!Array.isArray(order)) throw httpError(400, "Order must be an array");

    const menu = await Menu.findOne({ slug });
    if (!menu) throw httpError(404, "Menu not found");

    // Accept either an array of ids (['id1','id2']) or array of objects ([{ _id, order }])
    const normalizedIds = order
      .map((it) => {
        if (!it) return null;
        if (typeof it === 'string') return String(it);
        if (typeof it === 'object') {
          if (it._id) return String(it._id);
          if (it.id) return String(it.id);
          if (it.section) return String(it.section);
        }
        return null;
      })
      .filter(Boolean);

    const map = new Map((menu.sections || []).map((s) => [String(s.section), s]));
    const newSections = normalizedIds.map((id) => map.get(String(id))).filter(Boolean);
    // If we couldn't map any ids back to existing menu sections, don't clear the sections
    if (newSections.length === 0) {
      return res.json({ sections: menu.sections || [] });
    }

    menu.sections = newSections;
    await menu.save();

    return res.json({ sections: menu.sections || [] });
  } catch (err) {
    return next(err);
  }
};

export const attachMenuSection = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { sectionId } = req.body || {};
    if (!slug) throw httpError(400, 'Menu slug is required');
    if (!sectionId) throw httpError(400, 'sectionId is required');

    const menu = await Menu.findOne({ slug });
    if (!menu) throw httpError(404, 'Menu not found');

    const already = (menu.sections || []).some((s) => String(s.section) === String(sectionId));
    if (already) return res.status(200).json({ message: 'Section already attached' });

    menu.sections = menu.sections || [];
    menu.sections.push({ section: sectionId, dishes: [] });
    await menu.save();

    const updated = await Menu.findOne({ slug }).populate({ path: 'sections.section' }).populate({ path: 'sections.dishes', select: '-section' }).lean();
    return res.status(201).json({ sections: updated.sections || [] });
  } catch (err) {
    return next(err);
  }
};

export const detachMenuSection = async (req, res, next) => {
  try {
    const { slug, id } = req.params;
    if (!slug) throw httpError(400, 'Menu slug is required');
    if (!id) throw httpError(400, 'Section id is required');

    await Menu.updateOne({ slug }, { $pull: { sections: { section: id } } });

    const updated = await Menu.findOne({ slug }).populate({ path: 'sections.section' }).populate({ path: 'sections.dishes', select: '-section' }).lean();
    return res.json({ sections: updated.sections || [] });
  } catch (err) {
    return next(err);
  }
};

// --- Global section handlers (admin) ---

export const getSectionsHandler = async (req, res, next) => {
  try {
    const sections = await listSections();
    return res.json({ sections });
  } catch (err) {
    return next(err);
  }
};

export const createSectionHandler = async (req, res, next) => {
  try {
    const { title, description } = req.body || {};
    const created = await createSection({ title, description });
    return res.status(201).json({ section: created });
  } catch (err) {
    return next(err);
  }
};

export const updateSectionHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patch = req.body || {};
    const updated = await updateSection(id, patch);
    return res.json({ section: updated });
  } catch (err) {
    return next(err);
  }
};

export const deleteSectionHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await deleteSection(id);
    return res.json({ section: deleted });
  } catch (err) {
    return next(err);
  }
};

export const reorderSectionsHandler = async (req, res, next) => {
  try {
    const { order } = req.body || {};
    const updated = await reorderSections(order || []);
    return res.json({ sections: updated });
  } catch (err) {
    return next(err);
  }
};

// combined default export of menu-specific and global handlers
export default {
  getMenuSections,
  createMenuSection,
  updateMenuSection,
  deleteMenuSection,
  reorderMenuSections,
  attachMenuSection,
  detachMenuSection,
  getSectionsHandler,
  createSectionHandler,
  updateSectionHandler,
  deleteSectionHandler,
  reorderSectionsHandler,
};
