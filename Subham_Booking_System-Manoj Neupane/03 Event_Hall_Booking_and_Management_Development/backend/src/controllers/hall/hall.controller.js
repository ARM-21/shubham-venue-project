import { listHalls, getHallBySlug } from "../../services/hall/hall.service.js";

export const listHallsHandler = async (req, res, next) => {
  try {
    const halls = await listHalls(req.query);
    return res.json({ halls });
  } catch (err) {
    return next(err);
  }
};

export const getHallBySlugHandler = async (req, res, next) => {
  try {
    const hall = await getHallBySlug(req.params.slug);
    return res.json({ hall });
  } catch (err) {
    return next(err);
  }
};