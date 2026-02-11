import Hall from "../../../models/Hall.js";
import { httpError } from "../../../utils/http.utils.js";

const slugifyName = (name = "") => name.trim().toLowerCase().replace(/\s+/g, "-");

export async function adminListHalls(query = {}) {
  const filter = {};
  if (!query.includeDeleted) filter.isDeleted = false;
  if (query.onlyActive) filter.isActive = { $ne: false };

  const halls = await Hall.find(filter).select("-__v").sort({ createdAt: -1 });
  return halls;
}

export async function adminCreateHall(payload = {}) {
  if (!payload.name) throw httpError(400, "Hall name is required");
  if (!Number.isFinite(Number(payload.capacity))) throw httpError(400, "Capacity is required");

  const hall = new Hall({
    name: payload.name,
    slug: payload.slug || slugifyName(payload.name),
    description: payload.description || "",
    capacity: Number(payload.capacity),
    location: payload.location || {},
    amenities: Array.isArray(payload.amenities) ? payload.amenities : [],
    images: Array.isArray(payload.images) ? payload.images : [],
    pricePerHour: Number(payload.pricePerHour) || 0,
    currency: payload.currency || "NPR",
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
    notes: payload.notes || "",
    createdBy: payload.createdBy,
  });

  await hall.save();
  return hall;
}

export async function adminUpdateHall(hallId, payload = {}) {
  const hall = await Hall.findById(hallId);
  if (!hall || hall.isDeleted) throw httpError(404, "Hall not found");

  if (payload.name) {
    hall.name = payload.name;
    hall.slug = payload.slug || slugifyName(payload.name);
  }

  if (payload.description !== undefined) hall.description = payload.description;
  if (payload.notes !== undefined) hall.notes = payload.notes;

  if (payload.capacity !== undefined) {
    const cap = Number(payload.capacity);
    if (!Number.isFinite(cap) || cap < 1) throw httpError(400, "Capacity must be a positive number");
    hall.capacity = cap;
  }

  if (payload.pricePerHour !== undefined) {
    const price = Number(payload.pricePerHour);
    if (!Number.isFinite(price) || price < 0) throw httpError(400, "Price must be a non-negative number");
    hall.pricePerHour = price;
  }

  if (payload.currency) hall.currency = payload.currency;

  if (payload.location) {
    hall.location = {
      ...hall.location,
      address: payload.location.address ?? hall.location?.address,
      city: payload.location.city ?? hall.location?.city,
      state: payload.location.state ?? hall.location?.state,
      country: payload.location.country ?? hall.location?.country,
    };
  }

  if (Array.isArray(payload.amenities)) {
    hall.amenities = payload.amenities.filter(Boolean);
  }

  if (Array.isArray(payload.images)) {
    hall.images = payload.images.filter(Boolean);
  }

  if (payload.isActive !== undefined) hall.isActive = Boolean(payload.isActive);
  if (payload.isDeleted !== undefined) hall.isDeleted = Boolean(payload.isDeleted);

  await hall.save();
  return hall;
}
