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
import { SitePageHeader, SiteButton, SiteCard } from "components/site/SitePrimitives.jsx";

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
      <main className="min-h-screen bg-[var(--color-ivory)]">
        <SitePageHeader title="My Profile" />
        <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="h-96 animate-pulse rounded-2xl border border-[var(--color-sand)] bg-white" />
            <div className="space-y-6">
              <div className="h-64 animate-pulse rounded-2xl border border-[var(--color-sand)] bg-white" />
              <div className="grid gap-6 md:grid-cols-2">
                <div className="h-48 animate-pulse rounded-2xl border border-[var(--color-sand)] bg-white" />
                <div className="h-48 animate-pulse rounded-2xl border border-[var(--color-sand)] bg-white" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!authUser) return null;

  const inputCls =
    "w-full rounded-md border border-[var(--color-sand)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-wine)] focus:border-[var(--color-champagne)] focus:outline-none focus:ring-1 focus:ring-[var(--color-champagne)]";

  return (
    <main className="min-h-screen bg-[var(--color-ivory)]">
      <SitePageHeader
        eyebrow="Account Settings"
        title="My Profile"
        description="Manage your personal information, photo, and account security."
      />

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="space-y-6">
            <SiteCard className="p-6 text-center">
              <div className="relative mx-auto h-24 w-24">
                <div className="h-24 w-24 overflow-hidden rounded-full border border-[var(--color-sand)] bg-[var(--color-wine)]">
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
              <h2 className="mt-5 text-xl font-black text-[var(--color-wine)]">{fullName}</h2>
              <p className="mt-1 break-words text-sm font-semibold text-[var(--color-stone)]">{displayUser?.email}</p>
              <span className="mt-4 inline-flex rounded-full border border-[var(--color-sand)] bg-[var(--color-ivory)] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[var(--color-wine)]">
                {displayUser?.role === "admin" ? "Admin" : displayUser?.isOrganizerEligible ? "Organizer" : "Customer"}
              </span>
            </SiteCard>

            <SiteCard className="p-2">
              <Link
                href={ROUTES.SITE.BOOKINGS}
                className="block rounded-lg px-4 py-3 text-sm font-bold text-[var(--color-wine)] transition hover:bg-[var(--color-ivory)] hover:text-[var(--color-champagne)]"
              >
                My Bookings
              </Link>
              <Link
                href={ROUTES.SITE.TICKETS}
                className="block rounded-lg px-4 py-3 text-sm font-bold text-[var(--color-wine)] transition hover:bg-[var(--color-ivory)] hover:text-[var(--color-champagne)]"
              >
                My Tickets
              </Link>
              <Link
                href={ROUTES.SITE.ORGANIZER}
                className="block rounded-lg px-4 py-3 text-sm font-bold text-[var(--color-wine)] transition hover:bg-[var(--color-ivory)] hover:text-[var(--color-champagne)]"
              >
                Organizer Hub
              </Link>
              <div className="my-1 border-t border-[var(--color-sand)]" />
              <button
                onClick={handleLogout}
                className="block w-full cursor-pointer rounded-lg px-4 py-3 text-left text-sm font-black text-red-600 transition hover:bg-red-50"
              >
                Log Out
              </button>
            </SiteCard>
          </aside>

          {/* Main content */}
          <div className="space-y-6">
            {profileError ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {profileError?.response?.data?.message || profileError?.message || "Could not refresh profile details."}
              </div>
            ) : null}

            {/* Account details */}
            <SiteCard className="p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-[var(--color-wine)]">Account details</h2>
                </div>
                {!editing ? (
                  <SiteButton type="button" onClick={() => setEditing(true)} variant="secondary" size="sm" icon={null}>
                    Edit profile
                  </SiteButton>
                ) : null}
              </div>

              {!editing ? (
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <InfoBlock label="First name" value={displayUser?.first_name || displayUser?.firstName} />
                  <InfoBlock label="Last name" value={displayUser?.last_name || displayUser?.lastName} />
                  <InfoBlock
                    label="Email"
                    value={displayUser?.email}
                    helper={isOAuthUser ? "Signed in with Google" : "Primary account email"}
                  />
                  <InfoBlock
                    label="Phone"
                    value={displayUser?.phone}
                    helper={!displayUser?.phone ? "Add your number for booking updates." : null}
                  />
                </div>
              ) : (
                <form
                  onSubmit={handleSubmitProfile((data) => mutateUpdateProfile(data))}
                  className="mt-8 grid gap-6 md:grid-cols-2"
                >
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">First name</span>
                    <input
                      type="text"
                      {...registerProfile("first_name", { required: "First name is required" })}
                      className={inputCls}
                    />
                    {profileErrors.first_name && <p className="mt-2 text-xs font-bold text-red-600">{profileErrors.first_name.message}</p>}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">Last name</span>
                    <input
                      type="text"
                      {...registerProfile("last_name", { required: "Last name is required" })}
                      className={inputCls}
                    />
                    {profileErrors.last_name && <p className="mt-2 text-xs font-bold text-red-600">{profileErrors.last_name.message}</p>}
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">Phone</span>
                    <input
                      type="tel"
                      {...registerProfile("phone", {
                        pattern: { value: /^[0-9]{10}$|^$/, message: "Use 10 digits or leave empty" },
                      })}
                      placeholder="9841234567"
                      className={inputCls}
                    />
                    {profileErrors.phone && <p className="mt-2 text-xs font-bold text-red-600">{profileErrors.phone.message}</p>}
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
                    <SiteButton type="submit" disabled={isUpdatingProfile} icon={null}>
                      {isUpdatingProfile ? "Saving…" : "Save Changes"}
                    </SiteButton>
                    <SiteButton type="button" onClick={handleCancelEdit} variant="secondary" icon={null}>
                      Cancel
                    </SiteButton>
                  </div>
                </form>
              )}
            </SiteCard>

            {/* Photo + Security */}
            <div className="grid gap-6 md:grid-cols-2">
              <SiteCard className="p-6 sm:p-8">
                <h2 className="text-lg font-black text-[var(--color-wine)]">Profile photo</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-stone)]">
                  JPG, PNG, GIF, or WEBP under 5MB.
                </p>

                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="mt-6 h-20 w-20 rounded-xl object-cover" />
                ) : null}

                <label className="mt-6 block cursor-pointer rounded-xl border border-dashed border-[var(--color-sand)] bg-[var(--color-ivory)] p-6 text-center text-sm font-bold text-[var(--color-wine)] transition hover:bg-white hover:border-[var(--color-champagne)]">
                  {avatarFile ? avatarFile.name : "Choose Photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>

                {avatarFile ? (
                  <SiteButton
                    type="button"
                    onClick={() => mutateGetAvatarUrl(avatarFile)}
                    disabled={isUploadingPhoto}
                    className="mt-4 w-full"
                    icon={null}
                  >
                    {isUploadingPhoto ? "Uploading…" : "Upload Photo"}
                  </SiteButton>
                ) : null}
              </SiteCard>

              <SiteCard className="p-6 sm:p-8">
                <h2 className="text-lg font-black text-[var(--color-wine)]">
                  {isOAuthUser ? "Google sign-in" : "Password"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-stone)]">
                  {isOAuthUser
                    ? "Your account is secured through Google authentication."
                    : "Keep your account secure with a strong, unique password."}
                </p>

                {!isOAuthUser ? (
                  <SiteButton
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    variant="secondary"
                    className="mt-6 w-full"
                    icon={null}
                  >
                    Change Password
                  </SiteButton>
                ) : null}
              </SiteCard>
            </div>
          </div>
        </div>
      </section>

      {/* Password modal */}
      {showPasswordModal && !isOAuthUser ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[var(--color-wine)]/80 p-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <h2 className="text-2xl font-black text-[var(--color-wine)]">Change password</h2>
              <button
                onClick={() => { setShowPasswordModal(false); resetPassword(); }}
                className="cursor-pointer rounded-full border border-[var(--color-sand)] bg-white px-4 py-2 text-xs font-bold text-[var(--color-wine)] transition hover:border-[var(--color-champagne)] hover:bg-[var(--color-ivory)]"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleSubmitPassword((data) => mutateUpdatePassword(data))}
              className="space-y-5"
            >
              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">Current password</span>
                <input
                  type="password"
                  {...registerPassword("currentPassword", { required: "Current password is required" })}
                  className={inputCls}
                />
                {passwordErrors.currentPassword && <p className="mt-2 text-xs font-bold text-red-600">{passwordErrors.currentPassword.message}</p>}
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">New password</span>
                <input
                  type="password"
                  {...registerPassword("newPassword", {
                    required: "Password is required",
                    validate: validatePasswordForForm,
                  })}
                  className={inputCls}
                />
                {passwordErrors.newPassword && <p className="mt-2 text-xs font-bold text-red-600">{passwordErrors.newPassword.message}</p>}
                <div className="mt-3">
                  <PasswordStrength password={newPassword} showRequirements />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">Confirm password</span>
                <input
                  type="password"
                  {...registerPassword("confirmPassword", {
                    validate: (value) => value === newPassword || "Passwords must match",
                  })}
                  className={inputCls}
                />
                {passwordErrors.confirmPassword && <p className="mt-2 text-xs font-bold text-red-600">{passwordErrors.confirmPassword.message}</p>}
              </label>

              <div className="pt-2">
                <SiteButton type="submit" disabled={isUpdatingPassword} className="w-full justify-center" icon={null}>
                  {isUpdatingPassword ? "Updating…" : "Update Password"}
                </SiteButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function InfoBlock({ label, value, helper }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">{label}</p>
      <p className="mt-2 text-sm font-bold text-[var(--color-wine)]">{value || <span className="text-[var(--color-stone)]">Not added</span>}</p>
      {helper && <p className="mt-1 text-xs text-[var(--color-stone)]">{helper}</p>}
    </div>
  );
}
