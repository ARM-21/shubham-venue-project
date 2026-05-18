import Menu from "../../models/menu/Menu.js";
import { httpError } from "../../utils/http.utils.js";


export async function listMenus() {
  const menus = await Menu.find({ isActive: true })
    .populate({ path: "sections.section" })
    .populate({ path: "sections.dishes", select: "-section" })
    .sort({ createdAt: -1 })
    .lean();
  return menus || [];
}

export async function getMenuBySlug(slug) {
  const doc = await Menu.findOne({ slug }).populate({ path: "sections.section" }).populate({ path: "sections.dishes", select: "-section" }).lean();
  if (!doc) throw httpError(404, "Menu not found");
  return doc;
}

export async function createMenu(payload) {
  return Menu.create(payload);
}

export async function updateMenu(id, patch) {
  const updated = await Menu.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
  if (!updated) throw httpError(404, "Menu not found");
  return updated;
}

export async function deleteMenu(id) {
  const deleted = await Menu.findByIdAndDelete(id);
  if (!deleted) throw httpError(404, "Menu not found");
  return deleted;
}