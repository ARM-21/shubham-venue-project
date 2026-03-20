import { success } from "../../utils/http.utils.js";
import { adminListHalls, adminCreateHall, adminUpdateHall, adminDeleteHall } from "../../services/hall/admin/hall.admin.service.js";
import Hall from "../../models/Hall.js";
import { generateHallImageUploadUrl } from "../../services/hall/admin/hall.upload.service.js";

export const adminListHallsHandler = async (req, res, next) => {
  try {
    const halls = await adminListHalls(req.query);
    return success(res, { halls }, "OK", 200);
  } catch (err) {
    return next(err);
  }
};

export const adminCreateHallHandler = async (req, res, next) => {
  try {
    const hall = await adminCreateHall({ ...req.body, createdBy: req.currentUser?._id });
    return success(res, { hall }, "Created", 201);
  } catch (err) {
    return next(err);
  }
};

export const adminUpdateHallHandler = async (req, res, next) => {
  try {
    const hall = await adminUpdateHall(req.params.id, req.body);
    return success(res, { hall }, "Updated", 200);
  } catch (err) {
    return next(err);
  }
};

export const adminDeleteHallHandler = async (req, res, next) => {
  try {
    const result = await adminDeleteHall(req.params.id);
    return success(res, result, "Deleted", 200);
  } catch (err) {
    return next(err);
  }
};

export const adminHallUploadUrlHandler = async (req, res, next) => {
  try {
    const { fileExtension, contentType } = req.body || {};
    if (!fileExtension || !contentType) {
      return res.status(400).json({ success: false, message: "fileExtension and contentType are required" });
    }
    const data = await generateHallImageUploadUrl(fileExtension, contentType);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
};

export const adminGetHallHandler = async (req, res, next) => {
  try {
    const hall = await Hall.findById(req.params.id).lean();
    if (!hall) return res.status(404).json({ message: "Hall not found" });
    return success(res, { hall }, "OK", 200);
  } catch (err) {
    return next(err);
  }
};
