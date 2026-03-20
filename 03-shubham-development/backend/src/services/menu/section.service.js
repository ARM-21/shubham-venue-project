import MenuSection from "../../models/menu/MenuSection.js";
import { httpError } from "../../utils/http.utils.js";

export async function listSections() {
  const sections = await MenuSection.find().sort({ order: 1, createdAt: -1 }).lean();
  return sections || [];
}

export async function createSection(payload = {}) {
  if (!payload.title || !String(payload.title).trim()) throw httpError(400, "Section title is required");
  const last = await MenuSection.findOne().sort({ order: -1 }).lean();
  const order = last ? (last.order || 0) + 1 : 0;
  const doc = await MenuSection.create({ ...payload, order });
  return doc;
}

export async function updateSection(id, patch = {}) {
  if (!id) throw httpError(400, "Section id is required");
  const updated = await MenuSection.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
  if (!updated) throw httpError(404, "Section not found");
  return updated;
}

export async function deleteSection(id) {
  if (!id) throw httpError(400, "Section id is required");
  const deleted = await MenuSection.findByIdAndDelete(id);
  if (!deleted) throw httpError(404, "Section not found");
  return deleted;
}

export async function reorderSections(newOrder = []) {
  if (!Array.isArray(newOrder)) throw httpError(400, "newOrder must be an array of section ids");
  const bulk = newOrder.map((id, idx) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: idx } } } }));
  if (!bulk.length) return [];
  await MenuSection.bulkWrite(bulk);
  return listSections();
}
