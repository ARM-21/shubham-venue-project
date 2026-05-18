"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";
import axiosInstance from "lib/axios";
import { useQueryProfileMy } from "@queries/customer/profile-my";
import PasswordStrength from "components/auth/PasswordStrength";
import { validatePasswordForForm } from "utils/passwordValidation";

export default function ProfilePage() {
  const { user: authUser, loading: authLoading, logout, setUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { data: profileData, isLoading: profileLoading, error: profileError } = useQueryProfileMy();
  const user = profileData?.user || profileData || authUser;
  const displayUser = user || authUser;
  const isLoading = authLoading || profileLoading;

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    defaultValues: { first_name: "", last_name: "", phone: "" },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const newPassword = watch("newPassword");

  const fullName = useMemo(
    () =>
      `${displayUser?.first_name || displayUser?.firstName || ""} ${displayUser?.last_name || displayUser?.lastName || ""}`.trim() || "User",
    [displayUser?.first_name, displayUser?.firstName, displayUser?.last_name, displayUser?.lastName]
  );

  const initials = useMemo(
    () =>
      `${(displayUser?.first_name || displayUser?.firstName)?.[0] || ""}${(displayUser?.last_name || displayUser?.lastName)?.[0] || ""}`.toUpperCase() || "U",
    [displayUser?.first_name, displayUser?.firstName, displayUser?.last_name, displayUser?.lastName]
  );

  const isOAuthUser = useMemo(() => displayUser?.provider === "google", [displayUser?.provider]);

  useEffect(() => {
    if (displayUser) {
      resetProfile({
        first_name: displayUser?.first_name || displayUser?.firstName || "",
        last_name: displayUser?.last_name || displayUser?.lastName || "",
        phone: displayUser?.phone || "",
      });
    }
  }, [displayUser, resetProfile]);

  const { mutate: mutateUpdateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(ROUTES.API.PROFILE.UPDATE, {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone: data.phone?.trim() || null,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ["profile-my"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setUser?.(data.user);
      setEditing(false);
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || "Failed to update profile");
    },
  });

  const { mutate: mutateUpdatePassword, isPending: isUpdatingPassword } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.patch(ROUTES.API.PROFILE.PASSWORD, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return res.data;
    },
    onSuccess: () => {
      resetPassword();
      setShowPasswordModal(false);
      toast.success("Password changed successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || "Password change failed");
    },
  });

  const { mutate: mutateConfirmAvatar, isPending: isConfirmingAvatar } = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post(ROUTES.API.PROFILE.AVATAR_CONFIRM, payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile-my"] });
      setUser?.(data.user);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success("Avatar uploaded successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || "Avatar upload failed");
    },
  });

  const uploadToS3 = useCallback(
    async (uploadData, file) => {
      try {
        const { uploadUrl, publicUrl, key } = uploadData;
        const response = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!response.ok) throw new Error("S3 upload failed");
        mutateConfirmAvatar({ s3Key: key, publicUrl });
      } catch {
        toast.error("Failed to upload to storage");
      }
    },
    [mutateConfirmAvatar]
  );

  const { mutate: mutateGetAvatarUrl, isPending: isGettingUrl } = useMutation({
    mutationFn: async (file) => {
      const res = await axiosInstance.post(ROUTES.API.PROFILE.AVATAR_UPLOAD_URL, {
        fileExtension: file.name.substring(file.name.lastIndexOf(".")),
        contentType: file.type,
      });
      return res.data;
    },
    onSuccess: (data, file) => uploadToS3(data.data, file),
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || "Failed to get upload URL");
    },
  });

  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, GIF, and WEBP images are allowed");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
    resetProfile({
      first_name: displayUser?.first_name || displayUser?.firstName || "",
      last_name: displayUser?.last_name || displayUser?.lastName || "",
      phone: displayUser?.phone || "",
    });
  }, [displayUser, resetProfile]);

  const handleLogout = useCallback(async () => {
    try {
      await axiosInstance.post(ROUTES.API.AUTH.LOGOUT);
      await logout();
      router.push(ROUTES.AUTH.LOGIN);
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to logout");
    }
  }, [logout, router]);

  const isUploadingPhoto = isGettingUrl || isConfirmingAvatar;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FDFCFB] px-6 pt-44">
        <div className="mx-auto max-w-[1200px]">
          <div className="h-4 w-28 animate-pulse rounded bg-white/20" />
          <div className="mt-4 h-12 max-w-sm animate-pulse rounded-2xl bg-white/20" />
          <div className="mt-10 grid gap-6 lg:grid-cols-[330px_minmax(0,1fr)]">
            <div className="h-80 animate-pulse rounded-[2rem] border border-[#eadfcb] bg-white" />
            <div className="space-y-5">
              <div className="h-64 animate-pulse rounded-[2rem] border border-[#eadfcb] bg-white" />
              <div className="grid gap-5 md:grid-cols-2">
                <div className="h-48 animate-pulse rounded-[2rem] border border-[#eadfcb] bg-white" />
                <div className="h-48 animate-pulse rounded-[2rem] border border-[#eadfcb] bg-white" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!authUser) return null;

  const inputCls =
    "mt-2 w-full rounded-2xl border border-[#eadfcb] bg-[#FDFCFB] px-5 py-4 text-sm text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:ring-4 focus:ring-[#C0A04C]/15";

  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#3a1224] px-6 pb-14 pt-44 text-white">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FDFCFB] to-transparent" />
        <div className="relative mx-auto max-w-[1200px]">
          <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#C0A04C]">Account settings</p>
          <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">My Profile</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/76">
            Manage your personal information, photo, and account security.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] gap-6 px-6 py-10 lg:grid-cols-[330px_minmax(0,1fr)] lg:py-14">
        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Identity card */}
          <div className="rounded-[2rem] border border-[#eadfcb] bg-white p-6 text-center shadow-[0_22px_70px_-50px_rgba(58,18,36,0.35)]">
            <div className="relative mx-auto h-28 w-28">
              <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-[#FDFCFB] bg-[#3a1224]">
                {displayUser?.profilePicture || avatarPreview ? (
                  <img
                    src={avatarPreview || displayUser?.profilePicture}
                    alt={fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-black text-white">
                    {initials}
                  </div>
                )}
              </div>
            </div>
            <h2 className="mt-5 text-2xl font-black text-[#3a1224]">{fullName}</h2>
            <p className="mt-1 break-words text-sm font-semibold text-[#3a1224]/55">{displayUser?.email}</p>
            <span className="mt-4 inline-flex rounded-full border border-[#eadfcb] bg-[#FDFCFB] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#3a1224]">
              {displayUser?.role === "admin" ? "Admin" : displayUser?.isOrganizerEligible ? "Organizer" : "Customer"}
            </span>
          </div>

          {/* Navigation card */}
          <div className="rounded-[2rem] border border-[#eadfcb] bg-white p-3">
            <Link
              href={ROUTES.SITE.BOOKINGS}
              className="block rounded-xl px-4 py-3 text-sm font-bold text-[#3a1224] transition hover:bg-[#FDFCFB]"
            >
              My Bookings
            </Link>
            <Link
              href={ROUTES.SITE.TICKETS}
              className="block rounded-xl px-4 py-3 text-sm font-bold text-[#3a1224] transition hover:bg-[#FDFCFB]"
            >
              My Tickets
            </Link>
            <Link
              href={ROUTES.SITE.ORGANIZER}
              className="block rounded-xl px-4 py-3 text-sm font-bold text-[#3a1224] transition hover:bg-[#FDFCFB]"
            >
              Organizer Hub
            </Link>
            <div className="mt-1 border-t border-[#eadfcb] pt-1">
              <button
                onClick={handleLogout}
                className="block w-full cursor-pointer rounded-xl px-4 py-3 text-left text-sm font-black text-red-600 transition hover:bg-red-50"
              >
                Log Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="space-y-6">
          {profileError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {profileError?.response?.data?.message || profileError?.message || "Could not refresh profile details."}
            </div>
          ) : null}

          {/* Account details */}
          <section className="rounded-[2rem] border border-[#eadfcb] bg-white p-6 shadow-[0_22px_70px_-50px_rgba(58,18,36,0.35)] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C0A04C]">Personal information</p>
                <h2 className="mt-3 text-2xl font-black text-[#3a1224]">Account details</h2>
              </div>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="cursor-pointer rounded-full bg-[#3a1224] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#4b1830]"
                >
                  Edit profile
                </button>
              ) : null}
            </div>

            {!editing ? (
              <div className="mt-6 divide-y divide-[#eadfcb]">
                {[
                  { label: "First name", value: displayUser?.first_name || displayUser?.firstName },
                  { label: "Last name", value: displayUser?.last_name || displayUser?.lastName },
                  {
                    label: "Email",
                    value: displayUser?.email,
                    helper: isOAuthUser ? "Signed in with Google" : "Primary account email",
                  },
                  {
                    label: "Phone",
                    value: displayUser?.phone,
                    helper: !displayUser?.phone ? "Add your number for booking updates." : null,
                  },
                ].map(({ label, value, helper }) => (
                  <div key={label} className="py-4 first:pt-0 last:pb-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/45">{label}</p>
                    <p className="mt-1.5 text-sm font-bold text-[#3a1224]">{value || <span className="font-semibold text-[#3a1224]/35">Not added</span>}</p>
                    {helper ? <p className="mt-0.5 text-xs leading-5 text-[#3a1224]/50">{helper}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <form
                onSubmit={handleSubmitProfile((data) => mutateUpdateProfile(data))}
                className="mt-7 grid gap-5 md:grid-cols-2"
              >
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/55">First name</span>
                  <input
                    type="text"
                    {...registerProfile("first_name", { required: "First name is required" })}
                    className={inputCls}
                  />
                  {profileErrors.first_name ? (
                    <p className="mt-2 text-xs font-bold text-red-600">{profileErrors.first_name.message}</p>
                  ) : null}
                </label>

                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/55">Last name</span>
                  <input
                    type="text"
                    {...registerProfile("last_name", { required: "Last name is required" })}
                    className={inputCls}
                  />
                  {profileErrors.last_name ? (
                    <p className="mt-2 text-xs font-bold text-red-600">{profileErrors.last_name.message}</p>
                  ) : null}
                </label>

                <label className="block md:col-span-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/55">Phone</span>
                  <input
                    type="tel"
                    {...registerProfile("phone", {
                      pattern: { value: /^[0-9]{10}$|^$/, message: "Use 10 digits or leave empty" },
                    })}
                    placeholder="9841234567"
                    className={inputCls}
                  />
                  {profileErrors.phone ? (
                    <p className="mt-2 text-xs font-bold text-red-600">{profileErrors.phone.message}</p>
                  ) : null}
                </label>

                <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="cursor-pointer rounded-full bg-[#3a1224] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#4b1830] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdatingProfile ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="cursor-pointer rounded-full border border-[#eadfcb] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#3a1224] transition hover:border-[#C0A04C]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Photo + Security */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* Photo */}
            <section className="rounded-[2rem] border border-[#eadfcb] bg-white p-6 sm:p-8">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C0A04C]">Photo</p>
              <h2 className="mt-3 text-2xl font-black text-[#3a1224]">Profile photo</h2>
              <p className="mt-3 text-sm leading-6 text-[#3a1224]/65">
                JPG, PNG, GIF, or WEBP under 5MB.
              </p>

              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="mt-5 h-20 w-20 rounded-2xl object-cover" />
              ) : null}

              <label className="mt-5 block cursor-pointer rounded-2xl border border-dashed border-[#C0A04C]/60 bg-[#FDFCFB] px-5 py-5 text-center text-sm font-black text-[#3a1224] transition hover:bg-white">
                {avatarFile ? avatarFile.name : "Choose Photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>

              {avatarFile ? (
                <button
                  onClick={() => mutateGetAvatarUrl(avatarFile)}
                  disabled={isUploadingPhoto}
                  className="mt-4 w-full cursor-pointer rounded-full bg-[#C0A04C] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#3a1224] transition hover:bg-[#d8bc64] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploadingPhoto ? "Uploading…" : "Upload Photo"}
                </button>
              ) : null}
            </section>

            {/* Security */}
            <section className="rounded-[2rem] border border-[#eadfcb] bg-white p-6 sm:p-8">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C0A04C]">Security</p>
              <h2 className="mt-3 text-2xl font-black text-[#3a1224]">
                {isOAuthUser ? "Google sign-in" : "Password"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#3a1224]/65">
                {isOAuthUser
                  ? "Your account is secured through Google authentication."
                  : "Keep your account secure with a strong, unique password."}
              </p>

              {!isOAuthUser ? (
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="mt-5 w-full cursor-pointer rounded-full border border-[#3a1224] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#3a1224] transition hover:bg-[#3a1224] hover:text-white"
                >
                  Change Password
                </button>
              ) : null}
            </section>
          </div>
        </div>
      </section>

      {/* Password modal */}
      {showPasswordModal && !isOAuthUser ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#3a1224]/80 p-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C0A04C]">Security</p>
                <h2 className="mt-3 text-2xl font-black text-[#3a1224]">Change password</h2>
              </div>
              <button
                onClick={() => { setShowPasswordModal(false); resetPassword(); }}
                className="cursor-pointer rounded-full border border-[#eadfcb] px-4 py-2 text-sm font-black text-[#3a1224] transition hover:border-[#3a1224]/30"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleSubmitPassword((data) => mutateUpdatePassword(data))}
              className="space-y-5"
            >
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/55">Current password</span>
                <input
                  type="password"
                  {...registerPassword("currentPassword", { required: "Current password is required" })}
                  className={inputCls}
                />
                {passwordErrors.currentPassword ? (
                  <p className="mt-2 text-xs font-bold text-red-600">{passwordErrors.currentPassword.message}</p>
                ) : null}
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/55">New password</span>
                <input
                  type="password"
                  {...registerPassword("newPassword", {
                    required: "Password is required",
                    validate: validatePasswordForForm,
                  })}
                  className={inputCls}
                />
                {passwordErrors.newPassword ? (
                  <p className="mt-2 text-xs font-bold text-red-600">{passwordErrors.newPassword.message}</p>
                ) : null}
                <PasswordStrength password={newPassword} showRequirements />
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/55">Confirm password</span>
                <input
                  type="password"
                  {...registerPassword("confirmPassword", {
                    validate: (value) => value === newPassword || "Passwords must match",
                  })}
                  className={inputCls}
                />
                {passwordErrors.confirmPassword ? (
                  <p className="mt-2 text-xs font-bold text-red-600">{passwordErrors.confirmPassword.message}</p>
                ) : null}
              </label>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full cursor-pointer rounded-full bg-[#3a1224] px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#4b1830] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdatingPassword ? "Updating…" : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
