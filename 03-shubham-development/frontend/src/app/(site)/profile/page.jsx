'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from 'contexts/AuthProvider';
import { ROUTES } from 'config/routes';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from 'lib/axios';
import { 
  User, 
  Calendar, 
  Ticket, 
  Users, 
  LogOut, 
  Camera, 
  ShieldCheck, 
  X 
} from 'lucide-react';
import { useQueryProfileMy } from '@queries/customer/profile-my';
import PasswordStrength from 'components/auth/PasswordStrength';
import { validatePasswordForForm } from 'utils/passwordValidation';

export default function ProfilePage() {
  const { user: authUser, loading: authLoading, logout, setUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Fetch profile using react-query
  const { data: profileData, isLoading: profileLoading, error: profileError } = useQueryProfileMy();
  const user = profileData?.user || profileData || authUser;

  // Profile mutation
  const { mutate: mutateUpdateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(ROUTES.API.PROFILE.UPDATE, {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone: data.phone?.trim() || null
      });
      return res.data;
    },
    onSuccess: (data) => {
      const newUser = data.user;
      // Explicit refetch to ensure fresh data is loaded
      queryClient.refetchQueries({ queryKey: ['profile-my'] });
      // Also invalidate user queries for auth context sync
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setUser?.(newUser);
      setEditing(false);
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'Failed to update profile';
      toast.error(message);
    }
  });

  // Password mutation
  const { mutate: mutateUpdatePassword, isPending: isUpdatingPassword } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.patch(ROUTES.API.PROFILE.PASSWORD, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      return res.data;
    },
    onSuccess: () => {
      resetPassword();
      setShowPasswordModal(false);
      toast.success('Password changed successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'Password change failed';
      toast.error(message);
    }
  });

  // Avatar upload URL mutation
  const { mutate: mutateGetAvatarUrl, isPending: isGettingUrl } = useMutation({
    mutationFn: async (file) => {
      const res = await axiosInstance.post(ROUTES.API.PROFILE.AVATAR_UPLOAD_URL, {
        fileExtension: file.name.substring(file.name.lastIndexOf('.')),
        contentType: file.type
      });
      return res.data;
    },
    onSuccess: (data, file) => {
      uploadToS3(data.data, file);
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'Failed to get upload URL';
      toast.error(message);
    }
  });

  // Avatar confirm mutation
  const { mutate: mutateConfirmAvatar, isPending: isConfirmingAvatar } = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post(ROUTES.API.PROFILE.AVATAR_CONFIRM, payload);
      return res.data;
    },
    onSuccess: (data) => {
      const newUser = data.user;
      queryClient.invalidateQueries({ queryKey: ['profile-my'] });
      setUser?.(newUser);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success('Avatar uploaded successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'Avatar upload failed';
      toast.error(message);
    }
  });

  // Form hooks
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
    setValue: setProfileValue
  } = useForm({
    defaultValues: {
      first_name: user?.first_name || user?.firstName || '',
      last_name: user?.last_name || user?.lastName || '',
      phone: user?.phone || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPassword = watch('newPassword');

  const displayUser = user || authUser;
  const isLoading = authLoading || profileLoading;

  // Update form values when user data changes
  React.useEffect(() => {
    if (displayUser) {
      resetProfile({
        first_name: displayUser?.first_name || displayUser?.firstName || '',
        last_name: displayUser?.last_name || displayUser?.lastName || '',
        phone: displayUser?.phone || ''
      });
    }
  }, [displayUser?._id, displayUser?.first_name, displayUser?.firstName, displayUser?.last_name, displayUser?.lastName, displayUser?.phone, resetProfile]);

  // Helper functions
  const uploadToS3 = useCallback(async (uploadData, file) => {
    try {
      const { uploadUrl, publicUrl, key } = uploadData;
      
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      
      if (!response.ok) throw new Error('S3 upload failed');
      
      mutateConfirmAvatar({ s3Key: key, publicUrl });
    } catch (error) {
      toast.error('Failed to upload to storage');
    }
  }, [mutateConfirmAvatar]);

  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, GIF, and WEBP images are allowed');
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
      first_name: displayUser?.first_name || displayUser?.firstName || '',
      last_name: displayUser?.last_name || displayUser?.lastName || '',
      phone: displayUser?.phone || ''
    });
  }, [displayUser?.first_name, displayUser?.firstName, displayUser?.last_name, displayUser?.lastName, displayUser?.phone, resetProfile]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push(ROUTES.AUTH.LOGIN);
  }, [logout, router]);

  // Derived values

  
  const isOAuthUser = useMemo(() => displayUser?.provider === 'google', [displayUser?.provider]);
  
  const fullName = useMemo(
    () => `${displayUser?.first_name || displayUser?.firstName || ''} ${displayUser?.last_name || displayUser?.lastName || ''}`.trim() || 'User',
    [displayUser?.first_name, displayUser?.firstName, displayUser?.last_name, displayUser?.lastName]
  );
  
  const initials = useMemo(
    () => `${(displayUser?.first_name || displayUser?.firstName)?.[0] || ''}${(displayUser?.last_name || displayUser?.lastName)?.[0] || ''}`.toUpperCase() || 'U',
    [displayUser?.first_name, displayUser?.firstName, displayUser?.last_name, displayUser?.lastName]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3a1224] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#3a1224]/70 font-display font-bold uppercase tracking-widest text-xs">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!authUser) return null;

  return (
    <div className="min-h-screen bg-[#fdfaf6] relative selection:bg-[#C0A04C]/30 overflow-hidden">
      {/* Dark Gradient Header Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/80 to-[#322f2a] pointer-events-none z-0" />

      <main className="max-w-7xl mx-auto px-6 sm:px-8 pt-40 pb-32 relative z-10">
        {/* Header */}
        <header className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-[#C0A04C]" />
            <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Account Settings</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-display font-bold text-white mb-6 leading-[0.9]">
            Your <span className="text-[#C0A04C] italic font-serif">Profile</span>
          </h1>
          <p className="text-white/70 text-lg font-light leading-relaxed max-w-2xl">
            Manage your personal information, secure your account, and update your preferences.
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3 h-fit lg:sticky lg:top-32">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-b from-[#C0A04C]/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
              
              <div className="relative bg-white/95 rounded-3xl shadow-lg backdrop-blur-sm border border-[#3a1224]/5 p-8 overflow-hidden">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative mb-6">
                    <div className="p-1 rounded-full border-2 border-[#C0A04C]/20 shadow-lg group-hover:border-[#C0A04C]/40 transition-colors">
                      {displayUser?.profilePicture || avatarPreview ? (
                        <img
                          src={displayUser?.profilePicture || avatarPreview}
                          alt={fullName}
                          className="w-28 h-28 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#3a1224] to-[#4a172d] text-white flex items-center justify-center text-2xl font-display font-bold">
                          {initials}
                        </div>
                      )}
                    </div>
                  </div>

                  <h2 className="text-2xl font-display font-bold text-[#3a1224] text-center mb-1">{fullName}</h2>
                  <p className="text-[#3a1224]/50 text-xs font-medium mb-4">{displayUser?.email}</p>

                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    displayUser?.role === 'admin' ? 'bg-[#3a1224] text-white' : displayUser?.isOrganizerEligible ? 'bg-[#C0A04C]/15 text-[#C0A04C]' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {displayUser?.role === 'admin' ? 'Admin' : displayUser?.isOrganizerEligible ? 'Organizer Eligible' : 'Guest'}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-2 pt-6 border-t border-[#3a1224]/10">
                  {[
                    { label: "Bookings", icon: Calendar, href: ROUTES.SITE.BOOKINGS },
                    { label: "Tickets", icon: Ticket, href: ROUTES.SITE.TICKETS },
                    { label: "Organizer Hub", icon: Users, href: ROUTES.SITE.ORGANIZER },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => router.push(item.href || '#')}
                      className="w-full h-12 flex items-center px-4 gap-3 rounded-xl bg-gray-50 hover:bg-white text-[#3a1224] text-[9px] font-black uppercase tracking-widest border border-transparent hover:border-[#C0A04C]/20 transition-all cursor-pointer"
                    >
                      <item.icon className="w-4 h-4 text-[#C0A04C]" />
                      {item.label}
                    </button>
                  ))}
                  
                  <button
                    onClick={handleLogout}
                    className="w-full h-12 flex items-center px-4 gap-3 rounded-xl bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all mt-4 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-12">
            {/* Personal Details Section */}
            <section className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-b from-[#C0A04C]/10 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
              
              <div className="relative bg-white/95 rounded-3xl shadow-lg backdrop-blur-sm border border-[#3a1224]/5 p-10 overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-[#C0A04C] rounded-full" />
                      <span className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-[0.3em]">Profile</span>
                    </div>
                    <h3 className="text-3xl font-display font-bold text-[#3a1224]">Personal Information</h3>
                  </div>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="h-12 px-6 bg-[#3a1224] text-white rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    >
                      <User className="w-4 h-4" /> Edit
                    </button>
                  )}
                </div>

                {!editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { label: "First Name", value: displayUser?.first_name || displayUser?.firstName || "—" },
                      { label: "Last Name", value: displayUser?.last_name || displayUser?.lastName || "—" },
                      { label: "Email", value: displayUser?.email, tag: isOAuthUser ? "Google" : null },
                      { label: "Phone", value: displayUser?.phone || "—" }
                    ].map((field, idx) => (
                      <div key={idx}>
                        <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2">{field.label}</p>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-medium text-[#3a1224]">{field.value}</p>
                          {field.tag && <span className="text-[8px] px-2 py-1 bg-blue-50 text-blue-600 rounded-lg font-black uppercase">{field.tag}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <form onSubmit={handleSubmitProfile((data) => mutateUpdateProfile(data))} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { name: 'first_name', label: 'First Name', placeholder: 'First Name' },
                      { name: 'last_name', label: 'Last Name', placeholder: 'Last Name' },
                      { name: 'phone', label: 'Phone', placeholder: '9841234567', type: 'tel' },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3 block">{field.label}</label>
                        <input
                          type={field.type || 'text'}
                          {...registerProfile(field.name, { 
                            required: field.name !== 'phone',
                            pattern: field.name === 'phone' ? { value: /^[0-9]{10}$|^$/, message: '10 digits or empty' } : undefined 
                          })}
                          placeholder={field.placeholder}
                          className="w-full h-12 px-4 bg-gray-50 border border-[#3a1224]/10 rounded-xl text-[#3a1224] text-sm focus:border-[#C0A04C]/50 focus:bg-white focus:ring-2 focus:ring-[#C0A04C]/20 transition-all"
                        />
                        {profileErrors[field.name] && <p className="text-red-500 text-[8px] font-black mt-1">{profileErrors[field.name].message}</p>}
                      </div>
                    ))}

                    <div className="col-span-full flex gap-4 pt-6">
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="h-12 px-8 bg-[#3a1224] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg disabled:opacity-50 cursor-pointer"
                      >
                        {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="h-12 px-8 border border-[#3a1224]/10 text-[#3a1224] rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-gray-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>

            {/* Avatar & Security Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Avatar Section */}
              <div className="bg-white/95 rounded-3xl shadow-lg border border-[#3a1224]/5 p-8 overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                  <Camera className="w-4 h-4 text-[#C0A04C]" />
                  <span className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Photo</span>
                </div>
                <h4 className="text-2xl font-display font-bold text-[#3a1224] mb-6">Profile Photo</h4>
                
                {avatarPreview && (
                  <img src={avatarPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover mb-4 border-2 border-[#C0A04C]/20" />
                )}

                <label className="block cursor-pointer">
                  <div className="h-12 border-2 border-dashed border-[#3a1224]/10 rounded-xl flex items-center justify-center hover:border-[#C0A04C]/40 hover:bg-[#C0A04C]/5 transition-all text-[9px] font-black uppercase tracking-widest text-[#3a1224]/40">
                    {avatarFile ? avatarFile.name : 'Choose File'}
                  </div>
                  <input type="file" onChange={handleAvatarChange} className="hidden" />
                </label>

                {avatarFile && (
                  <button 
                    onClick={() => mutateGetAvatarUrl(avatarFile)} 
                    disabled={isGettingUrl || isConfirmingAvatar}
                    className="w-full h-12 bg-[#C0A04C] text-[#3a1224] rounded-xl mt-4 font-black text-[9px] uppercase tracking-widest shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {isGettingUrl || isConfirmingAvatar ? 'Uploading...' : 'Upload'}
                  </button>
                )}
              </div>

              {/* Security Section */}
              {!isOAuthUser && (
                <div className="bg-white/95 rounded-3xl shadow-lg border border-[#3a1224]/5 p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <ShieldCheck className="w-4 h-4 text-[#3a1224]" />
                    <span className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Security</span>
                  </div>
                  <h4 className="text-2xl font-display font-bold text-[#3a1224] mb-4">Change Password</h4>
                  <p className="text-[11px] text-[#3a1224]/50 mb-6 leading-relaxed">Update your password regularly to keep your account secure.</p>
                  
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full h-12 border-2 border-[#3a1224] text-[#3a1224] rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-[#3a1224] hover:text-white transition-all cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              )}

              {/* Google Auth Badge */}
              {isOAuthUser && (
                <div className="bg-[#3a1224] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <ShieldCheck className="w-6 h-6 text-[#C0A04C] mb-4" />
                    <h4 className="text-xl font-display font-bold mb-2">Google Verified</h4>
                    <p className="text-white/60 text-[11px] leading-relaxed">Your account is secured through Google's authentication. No password management needed.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && !isOAuthUser && (
          <div className="fixed inset-0 bg-[#3a1224]/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 relative"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display font-bold text-[#3a1224]">Update Password</h3>
                <button 
                  onClick={() => { setShowPasswordModal(false); resetPassword(); }} 
                  className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitPassword((data) => mutateUpdatePassword(data))} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2 block">Current Password</label>
                  <input 
                    type="password" 
                    {...registerPassword('currentPassword', { required: 'Required' })} 
                    placeholder="••••••••" 
                    className={`w-full h-12 px-4 bg-gray-50 border rounded-xl focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all ${
                      passwordErrors.currentPassword ? 'border-red-300 bg-red-50' : 'border-[#3a1224]/10'
                    }`}
                  />
                  {passwordErrors.currentPassword && <p className="text-red-500 text-[8px] font-black mt-1">{passwordErrors.currentPassword.message}</p>}
                </div>
                <div>
                  <label className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2 block">New Password</label>
                  <input 
                    type="password" 
                    {...registerPassword('newPassword', { 
                      required: 'Password is required', 
                      validate: validatePasswordForForm
                    })} 
                    placeholder="••••••••" 
                    className={`w-full h-12 px-4 bg-gray-50 border rounded-xl focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all ${
                      passwordErrors.newPassword ? 'border-red-300 bg-red-50' : 'border-[#3a1224]/10'
                    }`}
                  />
                  {passwordErrors.newPassword && <p className="text-red-500 text-[8px] font-black mt-1">{passwordErrors.newPassword.message}</p>}
                  {/* Show password strength indicator */}
                  <PasswordStrength password={newPassword} showRequirements={true} />
                </div>
                <div>
                  <label className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2 block">Confirm Password</label>
                  <input 
                    type="password" 
                    {...registerPassword('confirmPassword', { validate: v => v === newPassword || 'Passwords must match' })} 
                    placeholder="••••••••" 
                    className={`w-full h-12 px-4 bg-gray-50 border rounded-xl focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all ${
                      passwordErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-[#3a1224]/10'
                    }`}
                  />
                  {passwordErrors.confirmPassword && <p className="text-red-500 text-[8px] font-black mt-1">{passwordErrors.confirmPassword.message}</p>}
                </div>
                
                <button 
                  type="submit" 
                  disabled={isUpdatingPassword} 
                  className="w-full h-12 bg-[#3a1224] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg mt-6 disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .auth-form-container input {
          background-color: #f8f9fa !important;
          border-color: rgba(58, 18, 36, 0.05) !important;
        }
        .auth-form-container input:focus {
          border-color: rgba(192, 160, 76, 0.5) !important;
          background-color: #fff !important;
        }
      `}</style>
    </div>
  );
}
