import Hall from "../../models/Hall.js";
import { httpError } from "../../utils/http.utils.js";

// ...existing code...

export async function listHalls(query = {}) {
  const filter = { isDeleted: false, isActive: true };

  if (query.city) filter["location.city"] = query.city;
  if (query.minCapacity) filter.capacity = { $gte: Number(query.minCapacity) };

  const halls = await Hall.find(filter).select("-__v").sort({ createdAt: -1 });
  return halls;
}

export async function getHallBySlug(slug) {
  if (!slug) throw httpError(400, "Hall slug is required");

  const hall = await Hall.findOne({ slug, isDeleted: false });

  if (!hall || hall.isActive === false) {
    throw httpError(404, "Hall not found");
  }

  return hall;
}

