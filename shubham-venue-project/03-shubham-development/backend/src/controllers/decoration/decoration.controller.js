import DecorationScheme from "../../models/DecorationScheme.js";
import DecorationAddon from "../../models/DecorationAddon.js";

export const listDecorationSchemes = async (req, res, next) => {
  try {
    const schemes = await DecorationScheme.find({ isActive: true })
      .populate({ path: "includedAddons", match: { isActive: true } })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ schemes });
  } catch (err) {
    return next(err);
  }
};

export const listDecorationAddons = async (req, res, next) => {
  try {
    const addons = await DecorationAddon.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    return res.json({ addons });
  } catch (err) {
    return next(err);
  }
};
