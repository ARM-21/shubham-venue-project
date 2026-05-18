import DecorationScheme from "../../models/DecorationScheme.js";
import DecorationAddon from "../../models/DecorationAddon.js";
import { httpError } from "../../utils/http.utils.js";

function cleanText(value) {
  return String(value || "").trim();
}

function cleanPrice(value, label = "Price") {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw httpError(400, `${label} must be a non-negative number`);
  }
  return number;
}

function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeFeatures(features) {
  if (Array.isArray(features)) {
    return features.map(cleanText).filter(Boolean);
  }
  return cleanText(features)
    .split("\n")
    .map(cleanText)
    .filter(Boolean);
}

function normalizeAddonIds(addons) {
  if (!Array.isArray(addons)) return [];
  return addons.map(cleanText).filter(Boolean);
}

export const listAdminDecorations = async (req, res, next) => {
  try {
    const [schemes, addons] = await Promise.all([
      DecorationScheme.find()
        .populate("includedAddons")
        .sort({ createdAt: -1 })
        .lean(),
      DecorationAddon.find().sort({ createdAt: -1 }).lean(),
    ]);

    return res.json({
      schemes,
      addons,
      stats: {
        totalSchemes: schemes.length,
        activeSchemes: schemes.filter((item) => item.isActive !== false).length,
        totalAddons: addons.length,
        activeAddons: addons.filter((item) => item.isActive !== false).length,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const createDecorationScheme = async (req, res, next) => {
  try {
    const { name, description, price, features, imageUrl, includedAddons, isActive } = req.body || {};
    const title = cleanText(name);
    if (!title) throw httpError(400, "Decoration theme name is required");

    const scheme = await DecorationScheme.create({
      name: title,
      description: cleanText(description),
      price: cleanPrice(price),
      features: normalizeFeatures(features),
      imageUrl: cleanText(imageUrl),
      includedAddons: normalizeAddonIds(includedAddons),
      isActive: isActive !== false,
    });

    const populated = await DecorationScheme.findById(scheme._id).populate("includedAddons").lean();
    return res.status(201).json({ scheme: populated });
  } catch (err) {
    return next(err);
  }
};

export const updateDecorationScheme = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) throw httpError(400, "Decoration theme id is required");

    const patch = {};
    const { name, description, price, features, imageUrl, includedAddons, isActive } = req.body || {};

    if (name !== undefined) {
      const title = cleanText(name);
      if (!title) throw httpError(400, "Decoration theme name cannot be empty");
      patch.name = title;
    }
    if (description !== undefined) patch.description = cleanText(description);
    if (price !== undefined) patch.price = cleanPrice(price);
    if (features !== undefined) patch.features = normalizeFeatures(features);
    if (imageUrl !== undefined) patch.imageUrl = cleanText(imageUrl);
    if (includedAddons !== undefined) patch.includedAddons = normalizeAddonIds(includedAddons);
    if (isActive !== undefined) patch.isActive = isActive !== false;

    if (!Object.keys(patch).length) throw httpError(400, "No update fields provided");

    const scheme = await DecorationScheme.findByIdAndUpdate(id, patch, { new: true, runValidators: true })
      .populate("includedAddons")
      .lean();
    if (!scheme) throw httpError(404, "Decoration theme not found");
    return res.json({ scheme });
  } catch (err) {
    return next(err);
  }
};

export const updateDecorationSchemeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scheme = await DecorationScheme.findByIdAndUpdate(
      id,
      { isActive: req.body?.isActive !== false },
      { new: true, runValidators: true },
    )
      .populate("includedAddons")
      .lean();
    if (!scheme) throw httpError(404, "Decoration theme not found");
    return res.json({ scheme });
  } catch (err) {
    return next(err);
  }
};

export const deleteDecorationScheme = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scheme = await DecorationScheme.findByIdAndDelete(id).lean();
    if (!scheme) throw httpError(404, "Decoration theme not found");
    return res.json({ scheme });
  } catch (err) {
    return next(err);
  }
};

export const createDecorationAddon = async (req, res, next) => {
  try {
    const { key, name, description, price, isActive } = req.body || {};
    const title = cleanText(name);
    if (!title) throw httpError(400, "Add-on name is required");

    const addon = await DecorationAddon.create({
      key: slugify(key || title),
      name: title,
      description: cleanText(description),
      price: cleanPrice(price),
      isActive: isActive !== false,
    });
    return res.status(201).json({ addon });
  } catch (err) {
    return next(err);
  }
};

export const updateDecorationAddon = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) throw httpError(400, "Add-on id is required");

    const patch = {};
    const { key, name, description, price, isActive } = req.body || {};

    if (key !== undefined) {
      const nextKey = slugify(key);
      if (!nextKey) throw httpError(400, "Add-on key cannot be empty");
      patch.key = nextKey;
    }
    if (name !== undefined) {
      const title = cleanText(name);
      if (!title) throw httpError(400, "Add-on name cannot be empty");
      patch.name = title;
    }
    if (description !== undefined) patch.description = cleanText(description);
    if (price !== undefined) patch.price = cleanPrice(price);
    if (isActive !== undefined) patch.isActive = isActive !== false;

    if (!Object.keys(patch).length) throw httpError(400, "No update fields provided");

    const addon = await DecorationAddon.findByIdAndUpdate(id, patch, { new: true, runValidators: true }).lean();
    if (!addon) throw httpError(404, "Add-on not found");
    return res.json({ addon });
  } catch (err) {
    return next(err);
  }
};

export const updateDecorationAddonStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const addon = await DecorationAddon.findByIdAndUpdate(
      id,
      { isActive: req.body?.isActive !== false },
      { new: true, runValidators: true },
    ).lean();
    if (!addon) throw httpError(404, "Add-on not found");
    return res.json({ addon });
  } catch (err) {
    return next(err);
  }
};

export const deleteDecorationAddon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const addon = await DecorationAddon.findByIdAndDelete(id).lean();
    if (!addon) throw httpError(404, "Add-on not found");
    await DecorationScheme.updateMany({ includedAddons: id }, { $pull: { includedAddons: id } });
    return res.json({ addon });
  } catch (err) {
    return next(err);
  }
};
