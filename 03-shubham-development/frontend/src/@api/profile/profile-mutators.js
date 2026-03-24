import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function profileUpdateMutator(payload) {
  if (!payload) throw new Error("Profile data required");
  const res = await axiosInstance.put(ROUTES.API.PROFILE.UPDATE, payload);
  return res.data;
}

export async function passwordChangeMutator(payload) {
  if (!payload) throw new Error("Password data required");
  const res = await axiosInstance.patch(ROUTES.API.PROFILE.PASSWORD, payload);
  return res.data;
}

export async function avatarUploadUrlMutator(payload) {
  if (!payload) throw new Error("File extension required");
  const res = await axiosInstance.post(ROUTES.API.PROFILE.AVATAR_UPLOAD_URL, payload);
  return res.data;
}

export async function avatarConfirmMutator(payload) {
  if (!payload) throw new Error("Avatar data required");
  const res = await axiosInstance.post(ROUTES.API.PROFILE.AVATAR_CONFIRM, payload);
  return res.data;
}
