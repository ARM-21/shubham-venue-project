import { listMenus, getMenuBySlug } from "../../services/menu/menu.service.js";


export const getAllMenus = async (req, res, next) => {
  try {
    const menus = await listMenus();
    res.status(200).json(menus);
  }
  catch (err) {
  next(err);
  }
}


export const getMenu = async (req, res, next) => {
  try {
    const menu = await getMenuBySlug(req.params.slug);
    return res.status(200).json(menu);
  } catch (err) {
   next(err);
  }
}