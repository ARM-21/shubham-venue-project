"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminTopbar from "@/components/admin/dashboard/AdminTopbar";
import axiosInstance from "@/lib/axios";
import { ROUTES } from "@/config/routes";

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState({ first_name: "", last_name: "", email: "", phone: "", provider: "local", role: "", profilePicture: "", notifyBookings: true });
  const [initialProfile, setInitialProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [config, setConfig] = useState(() => ({
    maintenanceMode: false,
    emailNotifications: true,
    brandingLogoUrl: "",
    invoiceOrgName: "",
    invoiceOrgAddress: "",
    invoiceTaxId: "",
    taxPercent: 13,
    serviceChargePercent: 0,
  }));
  const [initialConfig, setInitialConfig] = useState(() => ({
    maintenanceMode: false,
    emailNotifications: true,
    brandingLogoUrl: "",
    invoiceOrgName: "",
    invoiceOrgAddress: "",
    invoiceTaxId: "",
    taxPercent: 13,
    serviceChargePercent: 0,
  }));
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [brandingFile, setBrandingFile] = useState(null);
  const [brandingPreview, setBrandingPreview] = useState(null);
  const [brandingUploading, setBrandingUploading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        const res = await axiosInstance.get(ROUTES.API.PROFILE.ME);
        const user = res?.data?.user ?? res?.data ?? {};
        setProfile({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          phone: user.phone || "",
          provider: user.provider || "local",
          role: typeof user.role === "string" ? user.role : user.role?.name || "",
          profilePicture: user.profilePicture || "",
          notifyBookings: user.notifyBookings !== false,
        });
        setInitialProfile({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          phone: user.phone || "",
          provider: user.provider || "local",
          role: typeof user.role === "string" ? user.role : user.role?.name || "",
          profilePicture: user.profilePicture || "",
          notifyBookings: user.notifyBookings !== false,
        });
        setConfig((prev) => ({ ...prev, emailNotifications: user.notifyBookings !== false }));
        setInitialConfig((prev) => ({ ...prev, emailNotifications: user.notifyBookings !== false }));
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load profile");
      } finally {
        setProfileLoading(false);
      }
    };
    const loadConfig = async () => {
      try {
        const res = await axiosInstance.get(ROUTES.API.ADMIN.SETTINGS_CONFIG);
        const cfg = res?.data?.config || {};
        const normalized = {
          maintenanceMode: !!cfg.maintenanceMode,
          brandingLogoUrl: cfg.brandingLogoUrl || "",
          invoiceOrgName: cfg.invoiceOrgName || "",
          invoiceOrgAddress: cfg.invoiceOrgAddress || "",
          invoiceTaxId: cfg.invoiceTaxId || "",
          taxPercent: Number.isFinite(Number(cfg.taxPercent)) ? Number(cfg.taxPercent) : 13,
          serviceChargePercent: Number.isFinite(Number(cfg.serviceChargePercent)) ? Number(cfg.serviceChargePercent) : 0,
        };
        setConfig((prev) => ({ ...prev, ...normalized }));
        setInitialConfig((prev) => ({ ...prev, ...normalized }));
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load settings");
      }
    };

    loadProfile();
    loadConfig();
  }, []);

  const handleProfileSave = async (e) => {
    e?.preventDefault?.();
    if (!profile.first_name || !profile.last_name) {
      toast.error("First and last name are required");
      return;
    }
    try {
      setSavingProfile(true);
      await toast.promise(
        axiosInstance.put(ROUTES.API.PROFILE.UPDATE, {
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
        }),
        {
          loading: "Saving profile...",
          success: "Profile updated",
          error: (err) => err?.response?.data?.message || "Failed to update profile",
        },
      );
      setInitialProfile({ ...profile });
    } catch (err) {
      // toast.promise handles errors
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if ((profile.provider || "local").toLowerCase() === "google") {
      toast.error("Password is managed by Google for this account");
      return;
    }
    try {
      setSavingPassword(true);
      await toast.promise(
        axiosInstance.patch(ROUTES.API.PROFILE.PASSWORD, {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
        {
          loading: "Updating password...",
          success: "Password updated",
          error: (err) => err?.response?.data?.message || "Failed to update password",
        },
      );
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      // toast.promise handles errors
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await toast.promise(
        (async () => {
          await axiosInstance.put(ROUTES.API.ADMIN.SETTINGS_CONFIG, {
            maintenanceMode: config.maintenanceMode,
            brandingLogoUrl: config.brandingLogoUrl,
            invoiceOrgName: config.invoiceOrgName,
            invoiceOrgAddress: config.invoiceOrgAddress,
            invoiceTaxId: config.invoiceTaxId,
            taxPercent: Number(config.taxPercent) || 0,
            serviceChargePercent: Number(config.serviceChargePercent) || 0,
          });

          if (config.emailNotifications !== initialConfig.emailNotifications) {
            await axiosInstance.patch(ROUTES.API.ADMIN.SETTINGS_NOTIFICATIONS, { emailNotifications: config.emailNotifications });
          }
        })(),
        {
          loading: "Saving settings...",
          success: "Settings saved",
          error: (err) => err?.response?.data?.message || "Failed to save settings",
        },
      );

      setInitialConfig({ ...config });
      setProfile((prev) => ({ ...prev, notifyBookings: config.emailNotifications }));
      setInitialProfile((prev) => (prev ? { ...prev, notifyBookings: config.emailNotifications } : prev));
    } catch (err) {
      // handled in toast.promise
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, GIF, or WEBP allowed");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    try {
      setAvatarUploading(true);
      const fileExtension = avatarFile.name.substring(avatarFile.name.lastIndexOf("."));
      const urlResponse = await axiosInstance.post(ROUTES.API.PROFILE.AVATAR_UPLOAD_URL, {
        fileExtension,
        contentType: avatarFile.type,
      });

      const { uploadUrl, publicUrl, key } = urlResponse.data.data || {};
      if (!uploadUrl || !publicUrl || !key) throw new Error("Upload URL missing");

      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": avatarFile.type },
        body: avatarFile,
      });

      const confirmRes = await axiosInstance.post(ROUTES.API.PROFILE.AVATAR_CONFIRM, {
        s3Key: key,
        publicUrl,
      });

      const updatedUser = confirmRes?.data?.user;
      if (updatedUser) {
        setProfile((prev) => ({
          ...prev,
          profilePicture: updatedUser.profilePicture || publicUrl,
          first_name: updatedUser.first_name || prev.first_name,
          last_name: updatedUser.last_name || prev.last_name,
        }));
        setInitialProfile((prev) => ({
          ...(prev || {}),
          profilePicture: updatedUser.profilePicture || publicUrl,
          first_name: updatedUser.first_name || prev?.first_name || profile.first_name,
          last_name: updatedUser.last_name || prev?.last_name || profile.last_name,
          email: updatedUser.email || prev?.email || profile.email,
          phone: updatedUser.phone || prev?.phone || profile.phone,
          provider: updatedUser.provider || prev?.provider || profile.provider,
          role: typeof updatedUser.role === "string" ? updatedUser.role : updatedUser.role?.name || prev?.role || profile.role,
        }));
      }

      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Avatar upload failed");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleBrandingFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, GIF, or WEBP allowed");
      return;
    }
    setBrandingFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setBrandingPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadBrandingLogo = async () => {
    if (!brandingFile) return;
    try {
      setBrandingUploading(true);
      const fileExtension = brandingFile.name.substring(brandingFile.name.lastIndexOf("."));
      const urlResponse = await axiosInstance.post(ROUTES.API.ADMIN.SETTINGS_LOGO_UPLOAD, {
        fileExtension,
        contentType: brandingFile.type,
      });

      const { uploadUrl, publicUrl } = urlResponse.data || {};
      if (!uploadUrl || !publicUrl) throw new Error("Upload URL missing");

      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": brandingFile.type },
        body: brandingFile,
      });

      setConfig((prev) => ({ ...prev, brandingLogoUrl: publicUrl }));
      toast.success("Branding logo updated. Don't forget to save settings.");
      setBrandingFile(null);
      setBrandingPreview(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Logo upload failed");
    } finally {
      setBrandingUploading(false);
    }
  };

  const isGoogleUser = (profile.provider || "local").toLowerCase() === "google";
  const profileDirty = !!initialProfile && JSON.stringify(profile) !== JSON.stringify(initialProfile);
  const configDirty = JSON.stringify(config) !== JSON.stringify(initialConfig);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="Settings" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-10">
          <div className="flex flex-col md:flex-row justify-between gap-3 md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin &amp; Settings</h1>
              <p className="text-[var(--admin-muted)] text-sm">Manage your profile and system preferences.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <section className="bg-[var(--admin-surface)]/80 border border-white/10 rounded-xl p-6 shadow-lg shadow-black/20">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row md:items-start md:gap-6">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="size-24 rounded-full border-4 border-[var(--admin-bg)] bg-center bg-cover bg-no-repeat"
                        style={{
                          backgroundImage: avatarPreview
                            ? `url(${avatarPreview})`
                            : profile.profilePicture
                              ? `url(${profile.profilePicture})`
                              : "linear-gradient(135deg, #431515, #2a0f0f)",
                        }}
                        aria-label="admin avatar"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <label className="text-xs uppercase tracking-wide text-[var(--admin-muted)] hover:text-white cursor-pointer">
                          <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleAvatarChange} />
                          {avatarFile ? "Change selected" : "Change photo"}
                        </label>
                        {avatarFile && (
                          <button
                            className="px-3 py-1 rounded-lg bg-[var(--admin-primary)] text-white text-xs font-semibold hover:bg-[var(--admin-primary-dark)] disabled:opacity-60"
                            type="button"
                            onClick={uploadAvatar}
                            disabled={avatarUploading}
                          >
                            {avatarUploading ? "Uploading..." : "Upload"}
                          </button>
                        )}
                        {avatarFile && <p className="text-[var(--admin-muted)] text-[11px] max-w-[10rem] text-center leading-snug">{avatarFile.name}</p>}
                      </div>
                      {(profile.provider || "local").toLowerCase() !== "google" && (
                        <button
                          className="text-xs flex items-center gap-1 text-[var(--admin-muted)] hover:text-white"
                          type="button"
                          onClick={() => document.getElementById("password-section")?.scrollIntoView({ behavior: "smooth" })}
                        >
                          Change password
                        </button>
                      )}
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-1">
                        <label className="text-sm text-[var(--admin-muted)]">Full name</label>
                        <input
                          className="w-full mt-1 bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[var(--admin-primary)] focus:ring-1 focus:ring-[var(--admin-primary)]"
                          value={`${profile.first_name} ${profile.last_name}`.trim()}
                          onChange={(e) => {
                            const parts = e.target.value.split(" ");
                            const first = parts.shift() || "";
                            const last = parts.join(" ") || "";
                            setProfile((p) => ({ ...p, first_name: first, last_name: last }));
                          }}
                          disabled={profileLoading}
                          required
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-sm text-[var(--admin-muted)]">Role title</label>
                        <input
                          className="w-full mt-1 bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white/80 cursor-not-allowed"
                          value={profile.role ? profile.role.toUpperCase() : "ADMIN"}
                          disabled
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-sm text-[var(--admin-muted)]">Email address</label>
                        <input
                          className="w-full mt-1 bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white/80 cursor-not-allowed"
                          value={profile.email}
                          disabled
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-sm text-[var(--admin-muted)]">Phone number</label>
                        <input
                          className="w-full mt-1 bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[var(--admin-primary)] focus:ring-1 focus:ring-[var(--admin-primary)]"
                          value={profile.phone}
                          onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                          disabled={profileLoading}
                          placeholder="10-digit phone"
                        />
                      </div>
                    </div>
                  </div>

                  {profileDirty && (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg border border-white/10 text-sm text-white/80 hover:text-white hover:border-[var(--admin-primary)]/60"
                        onClick={() => {
                          if (initialProfile) {
                            setProfile(initialProfile);
                            setAvatarFile(null);
                            setAvatarPreview(null);
                          }
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleProfileSave}
                        disabled={savingProfile || profileLoading}
                        className="px-4 py-2 rounded-lg bg-[var(--admin-primary)] text-white font-semibold hover:bg-[var(--admin-primary-dark)] transition disabled:opacity-60"
                      >
                        {savingProfile ? "Saving..." : "Save profile"}
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {!isGoogleUser && (
                <section className="bg-[var(--admin-surface)]/80 border border-white/10 rounded-xl p-6 shadow-lg shadow-black/20" id="password-section">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Password</h2>
                      <p className="text-[var(--admin-muted)] text-sm">Change your password for local login.</p>
                    </div>
                  </div>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handlePasswordSave}>
                    <div className="col-span-1">
                      <label className="text-sm text-[var(--admin-muted)]">Current password</label>
                      <input
                        type="password"
                        className="w-full mt-1 bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[var(--admin-primary)] focus:ring-1 focus:ring-[var(--admin-primary)]"
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-sm text-[var(--admin-muted)]">New password</label>
                      <input
                        type="password"
                        className="w-full mt-1 bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[var(--admin-primary)] focus:ring-1 focus:ring-[var(--admin-primary)]"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="px-4 py-2 rounded-lg bg-[var(--admin-primary)] text-white font-semibold hover:bg-[var(--admin-primary-dark)] transition disabled:opacity-60"
                      >
                        {savingPassword ? "Updating..." : "Update password"}
                      </button>
                    </div>
                  </form>
                </section>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <section className="bg-[var(--admin-surface)]/80 border border-white/10 rounded-xl p-5 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">System Config</h3>
                    <p className="text-[var(--admin-muted)] text-sm">Toggle bookings and set defaults.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Email notifications</p>
                      <p className="text-xs text-[var(--admin-muted)]">Receive booking alerts</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={config.emailNotifications}
                        onChange={(e) => setConfig((c) => ({ ...c, emailNotifications: e.target.checked }))}
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-[var(--admin-primary)] transition-colors"></div>
                      <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Maintenance mode</p>
                      <p className="text-xs text-[var(--admin-muted)]">Disable customer bookings</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={config.maintenanceMode}
                        onChange={(e) => setConfig((c) => ({ ...c, maintenanceMode: e.target.checked }))}
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-[var(--admin-primary)] transition-colors"></div>
                      <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
                    </label>
                  </div>
                  {configDirty && (
                    <div className="flex justify-end gap-2">
                      <button
                        className="px-4 py-2 rounded-lg border border-white/10 text-sm text-white/80 hover:text-white hover:border-[var(--admin-primary)]/60"
                        onClick={() => setConfig(initialConfig)}
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg bg-[var(--admin-primary)] text-white text-sm font-semibold hover:bg-[var(--admin-primary-dark)]"
                        onClick={handleSaveConfig}
                        type="button"
                      >
                        Save system config
                      </button>
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-[var(--admin-primary)]/10 border border-[var(--admin-primary)]/30 rounded-xl p-5 text-center">
                <div className="mx-auto mb-3 size-16 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                  {brandingPreview || config.brandingLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brandingPreview || config.brandingLogoUrl} alt="Logo preview" className="object-contain h-full w-full" />
                  ) : (
                    <span className="text-[var(--admin-primary)] font-bold text-xl">LOGO</span>
                  )}
                </div>
                <h4 className="text-white font-semibold text-sm">System Branding</h4>
                <p className="text-[var(--admin-muted)] text-xs mt-1">Logo appears on confirmations and invoices.</p>
                <div className="mt-3 flex flex-col gap-2 text-left">
                  <label className="text-xs text-[var(--admin-muted)]">Upload logo</label>
                  <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="text-[var(--admin-muted)] text-xs" onChange={handleBrandingFileChange} />
                  {brandingFile && <p className="text-[11px] text-[var(--admin-muted)]">{brandingFile.name}</p>}
                  <button
                    className="w-full px-4 py-2 rounded-lg bg-[var(--admin-surface)] border border-white/10 text-sm text-white hover:border-[var(--admin-primary)]/60 disabled:opacity-60"
                    onClick={uploadBrandingLogo}
                    disabled={brandingUploading || !brandingFile}
                    type="button"
                  >
                    {brandingUploading ? "Uploading..." : "Upload logo"}
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 text-left">
                  <div>
                    <label className="text-xs text-[var(--admin-muted)]">Organization name</label>
                    <input
                      className="w-full mt-1 bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      value={config.invoiceOrgName}
                      onChange={(e) => setConfig((c) => ({ ...c, invoiceOrgName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--admin-muted)]">Organization address</label>
                    <input
                      className="w-full mt-1 bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      value={config.invoiceOrgAddress}
                      onChange={(e) => setConfig((c) => ({ ...c, invoiceOrgAddress: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--admin-muted)]">Tax ID / PAN</label>
                    <input
                      className="w-full mt-1 bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      value={config.invoiceTaxId}
                      onChange={(e) => setConfig((c) => ({ ...c, invoiceTaxId: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[var(--admin-muted)]">VAT %</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full mt-1 bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                        value={config.taxPercent}
                        onChange={(e) => setConfig((c) => ({ ...c, taxPercent: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--admin-muted)]">Service charge %</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full mt-1 bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                        value={config.serviceChargePercent}
                        onChange={(e) => setConfig((c) => ({ ...c, serviceChargePercent: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
