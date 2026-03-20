import Dish from "../../models/menu/Dish.js";
import { httpError } from "../../utils/http.utils.js";

export async function listDishes() {
  return Dish.find().sort({ createdAt: -1 });
}

export async function getDishById(id) {
  const doc = await Dish.findById(id);
  if (!doc) throw httpError(404, "Dish not found");
  return doc;
}

export async function createDish(payload) {
  try {
    const created = await Dish.create(payload);
    return created;
  } catch (err) {
    const isDupKey = err && (err.code === 11000 || (err.name === 'MongoServerError' && err.code === 11000));
    if (isDupKey) {
      throw httpError(409, 'Dish with the same name or slug already exists');
    }
    throw err;
  }
}

export async function updateDish(id, patch) {
  const updated = await Dish.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
  if (!updated) throw httpError(404, "Dish not found");
  return updated;
}

export async function deleteDish(id) {
  const deleted = await Dish.findByIdAndDelete(id);
  if (!deleted) throw httpError(404, "Dish not found");
  return deleted;
}