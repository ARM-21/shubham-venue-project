import Dish from "../../models/menu/Dish.js";
import { httpError } from "../../utils/httpError.js";

export async function listDishes() {
  return Dish.find().sort({ createdAt: -1 });
}

export async function getDishById(id) {
  const doc = await Dish.findById(id);
  if (!doc) throw httpError(404, "Dish not found");
  return doc;
}

export async function createDish(payload) {
  return Dish.create(payload);
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