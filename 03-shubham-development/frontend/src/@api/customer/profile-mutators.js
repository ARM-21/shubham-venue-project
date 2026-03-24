import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function updateProfileMutator(payload) {
  const res = await axiosInstance.put(ROUTES.API.PROFILE.UPDATE, payload);
  return res.data;
}

export async function updatePasswordMutator(payload) {
  const res = await axiosInstance.put(ROUTES.API.PROFILE.PASSWORD, payload);
  return res.data;
}

export async function getAvatarUploadUrlMutator() {
  const res = await axiosInstance.post(ROUTES.API.PROFILE.AVATAR_UPLOAD_URL);
  return res.data;
}

export async function confirmAvatarMutator(payload) {
  const res = await axiosInstance.post(ROUTES.API.PROFILE.AVATAR_CONFIRM, payload);
  return res.data;
}
