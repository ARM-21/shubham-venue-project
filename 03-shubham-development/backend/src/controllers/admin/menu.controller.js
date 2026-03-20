import Dish from "../../models/menu/Dish.js";
import { listMenus, createMenu as createMenuService, updateMenu, deleteMenu, getMenuBySlug } from "../../services/menu/menu.service.js";
import { updateDish, createDish, deleteDish } from "../../services/menu/dish.service.js";
import { generateMenuImageUploadUrl, generateDishImageUploadUrl } from "../../services/menu/admin/menu.upload.service.js";
import { httpError } from "../../utils/http.utils.js";
import { Mongoose } from "mongoose";

export const getMenusAndDishes = async (req, res, next) => {
  try {
    let menus = [];
    try {
      menus = await listMenus();
    } catch (err) {
      // treat missing menus as empty instead of failing the whole request
      if (err?.statusCode !== 404) throw err;
      menus = [];
    }

    const dishes = await Dish.find().populate("section").sort({ createdAt: -1 }).lean();

    const sectionsMap = new Map();
    menus.forEach((menu) => {
      (menu.sections || []).forEach((item) => {
        const title = item?.section?.title;
        if (title) sectionsMap.set(title, { id: String(item.section?._id || title), title });
      });
    });
    dishes.forEach((dish) => {
      const title = dish?.section?.title;
      if (title && !sectionsMap.has(title)) {
        sectionsMap.set(title, { id: String(dish.section?._id || title), title });
      }
    });

    const stats = {
      totalMenus: menus.length,
      activeMenus: menus.filter((m) => m.isActive !== false).length,
      inactiveMenus: menus.filter((m) => m.isActive === false).length,
      totalDishes: dishes.length,
      activeDishes: dishes.filter((d) => d.isActive !== false).length,
    };

    return res.json({ menus, dishes, sections: Array.from(sectionsMap.values()), stats });
  } catch (err) {
    return next(err);
  }
};

export const getDishesBySection = async (req, res, next) => {
  try {
    const { section } = req.query || {};
    console.log("Section query:", section);
    if (!section) throw httpError(400, "Section id is required");
    const dishes = await Dish.find({ section: new String(section) }).sort({ createdAt: -1 }).lean();
    return res.json({ data: dishes });
  } catch (err) {
    return next(err);
  }
};

export const updateMenuStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) throw httpError(400, "Menu id is required");
    const updated = await updateMenu(id, { isActive: req.body?.isActive !== false });
    return res.json({ menu: updated });
  } catch (err) {
    return next(err);
  }
};

export const updateDishStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) throw httpError(400, "Dish id is required");
    const updated = await Dish.findByIdAndUpdate(
      id,
      { isActive: req.body?.isActive !== false },
      { new: true, runValidators: true },
    );
    if (!updated) throw httpError(404, "Dish not found");
    return res.json({ dish: updated });
  } catch (err) {
    return next(err);
  }
};

export const updateDishDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) throw httpError(400, "Dish id is required");

    const { name, description, price, unitLabel, image, isVegetarian, section } = req.body || {};
    const patch = {};

    if (name !== undefined) {
      const trimmed = String(name || "").trim();
      if (!trimmed) throw httpError(400, "Dish name cannot be empty");
      patch.name = trimmed;
      patch.slug = trimmed.toLowerCase().split(/\s+/).join("-");
    }

    if (description !== undefined) {
      patch.description = String(description || "").trim();
    }

    if (price !== undefined) {
      const val = Number(price);
      if (!Number.isFinite(val) || val < 0) throw httpError(400, "Price must be a non-negative number");
      patch.price = val;
    }

    if (unitLabel !== undefined) {
      patch.unitLabel = String(unitLabel || "").trim();
    }

    if (image !== undefined) {
      const url = String(image || "").trim();
      if (url && !url.startsWith("http")) throw httpError(400, "Image must be a valid URL");
      patch.image = url;
    }

    if (isVegetarian !== undefined) {
      patch.isVegetarian = Boolean(isVegetarian);
    }

    if (section !== undefined) {
      patch.section = section;
    }

    if (!Object.keys(patch).length) throw httpError(400, "No update fields provided");

    const updated = await updateDish(id, patch);
    return res.json({ dish: updated });
  } catch (err) {
    return next(err);
  }
};

export const createDishHandler = async (req, res, next) => {
  try {
    const { name, description, price, unitLabel, image, isVegetarian, section } = req.body || {};
    if (!name || !String(name).trim()) throw httpError(400, 'Dish name is required');
    const payload = {
      name: String(name).trim(),
      description: String(description || '').trim(),
      price: price !== undefined ? Number(price) : undefined,
      unitLabel: String(unitLabel || '').trim(),
      image: String(image || '').trim(),
      isVegetarian: !!isVegetarian,
      section: section || null,
    };
    const created = await createDish(payload);
    return res.status(201).json({ dish: created });
  } catch (err) {
    return next(err);
  }
};

export const deleteDishHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) throw httpError(400, "Dish id is required");
    const deleted = await deleteDish(id);
    return res.json({ dish: deleted });
  } catch (err) {
    return next(err);
  }
};

export const updateMenuDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) throw httpError(400, "Menu id is required");

    const { name, description, pricePerPerson, heroImage } = req.body || {};
    const patch = {};

    if (name !== undefined) {
      if (!String(name).trim()) throw httpError(400, "Menu name cannot be empty");
      patch.name = String(name).trim();
      patch.slug = patch.name.toLowerCase().split(/\s+/).join("-");
    }

    if (description !== undefined) {
      patch.description = String(description || "").trim();
    }

    if (pricePerPerson !== undefined) {
      const price = Number(pricePerPerson);
      if (!Number.isFinite(price) || price < 0) throw httpError(400, "Price per person must be a non-negative number");
      patch.pricePerPerson = price;
    }

    if (heroImage !== undefined) {
      const url = String(heroImage || "").trim();
      if (url && !url.startsWith("http")) throw httpError(400, "Hero image must be a valid URL");
      patch.heroImage = url;
    }

    if (!Object.keys(patch).length) {
      throw httpError(400, "No update fields provided");
    }

    const updated = await updateMenu(id, patch);
    return res.json({ menu: updated });
  } catch (err) {
    return next(err);
  }
};

export const createMenu = async (req, res, next) => {
  try {
    const { name, description, pricePerPerson, heroImage } = req.body || {};

    if (!name || !String(name).trim()) throw httpError(400, "Menu name is required");
    const price = Number(pricePerPerson);
    if (!Number.isFinite(price) || price < 0) throw httpError(400, "Price per person must be a non-negative number");

    const payload = {
      name: String(name).trim(),
      description: String(description || "").trim(),
      pricePerPerson: price,
      heroImage: String(heroImage || "").trim(),
    };

    const created = await createMenuService(payload);
    return res.status(201).json({ menu: created });
  } catch (err) {
    return next(err);
  }
};



export const adminMenuUploadUrlHandler = async (req, res, next) => {
  try {
    const { fileExtension, contentType } = req.body || {};
    if (!fileExtension || !contentType) throw httpError(400, "fileExtension and contentType are required");
    const data = await generateMenuImageUploadUrl(fileExtension, contentType);
    return res.json({ data });
  } catch (err) {
    return next(err);
  }
};

export const adminDishUploadUrlHandler = async (req, res, next) => {
  try {
    const { fileExtension, contentType } = req.body || {};
    if (!fileExtension || !contentType) throw httpError(400, "fileExtension and contentType are required");
    const data = await generateDishImageUploadUrl(fileExtension, contentType);
    return res.json({ data });
  } catch (err) {
    return next(err);
  }
};

export const getMenuDetail = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug) throw httpError(400, "Menu slug is required");
    const menu = await getMenuBySlug(slug);
    return res.json({ menu });
  } catch (err) {
    return next(err);
  }
};

export const removeMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) throw httpError(400, "Menu id is required");
    const deleted = await deleteMenu(id);
    return res.json({ menu: deleted });
  } catch (err) {
    return next(err);
  }
};
