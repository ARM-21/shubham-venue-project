import Hall from "../models/Hall.js";
import mongoose from "mongoose";

const isObjectId = (val) => {
  try {
    return mongoose.Types.ObjectId.isValid(val);
  } catch (e) {
    return false;
  }
};

export const listHalls = async (req, res) => {
  try {
    const filter = { isDeleted: false, isActive: true };
    // optional query params: city, capacity, minPrice, maxPrice
    if (req.query.city) filter["location.city"] = req.query.city;
    if (req.query.minCapacity) filter.capacity = { $gte: Number(req.query.minCapacity) };
    // if (req.query.maxPrice) filter.pricePerHour = { ...(filter.pricePerHour || {}), $lte: Number(req.query.maxPrice) };
    // if (req.query.minPrice) filter.pricePerHour = { ...(filter.pricePerHour || {}), $gte: Number(req.query.minPrice) };

    const halls = await Hall.find(filter).select("-__v").sort({ createdAt: -1 });
    return res.json({ halls });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getHall = async (req, res) => {
  try {
    const { slug } = req.params;
    let hall = null;

    if (!hall) {
      hall = await Hall.findOne({ slug: slug, isDeleted: false })
    }

    if (!hall || (hall.isActive === false)) {
      return res.status(404).json({ message: "Hall not found" });
    }

    return res.json({ hall });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
