import { success } from "../../utils/http.utils.js";
import { listHalls, getHallBySlug, checkHallAvailability } from "../../services/hall/hall.service.js";
import { listHallsAvailability } from "../booking/booking.controller.js";

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

export const checkHallAvailabilityHandler = async (req, res, next) => {
  try {
    const data = await checkHallAvailability({
      hallId: req.params.hallId,
      date: req.body?.date,
      slot: req.body?.slot,
      guests: Number(req.body?.guests),
    });

    return success(res, data, "OK");
  } catch (err) {
    return next(err);
  }
};

export const listHallsAvailabilityHandler = async (req, res, next) => {
  try {
    const halls = await listHallsAvailability(req.query);
    return success(res, { halls }, "OK", 200);
  } catch (err) {
    return next(err);
  }
};
