import Menu from "../../models/menu/Menu.js";
import MenuSection from "../../models/menu/MenuSection.js";
import { httpError } from "../../utils/http.utils.js";


export async function listMenus() {
  const menus = await Menu.find().populate({ path: "sections.section" }).populate({ path: "sections.dishes", select: "-section" }).sort({ createdAt: -1 }).lean();
  console.log("Menus found:", menus.length);
  if (!menus || menus.length === 0) throw httpError(404, "No menus found");
  return menus;
}

export async function listMenusWithDishes() {
  const menuswithDishes = await Menu.find().populate({ path: "sections.section" }).populate({ path: "sections.dishes", select: "-section" }).sort({ createdAt: -1 }).lean();
  if (!menuswithDishes || menuswithDishes.length === 0) throw httpError(404, "No menus found");

  return menuswithDishes;

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