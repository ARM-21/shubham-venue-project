import EventType from "../../models/EventType.js";
import { httpError } from "../../utils/http.utils.js";

export async function listEventTypes(filter = {}) {
  return EventType.find(filter).sort({ createdAt: -1 });
}

export async function getEventTypeById(id) {
  const doc = await EventType.findById(id);
  if (!doc) throw httpError(404, "Event type not found");
  return doc;
}

export async function createEventType(payload) {
  return EventType.create(payload);
}

export async function updateEventType(id, patch) {
  const updated = await EventType.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
  if (!updated) throw httpError(404, "Event type not found");
  return updated;
}

export async function deleteEventType(id) {
  const deleted = await EventType.findByIdAndDelete(id);
  if (!deleted) throw httpError(404, "Event type not found");
  return deleted;
}