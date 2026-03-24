'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from 'lib/axios';
import { useRouter } from 'next/navigation';
import { useAuth } from 'contexts/AuthProvider';
import { ROUTES } from 'config/routes';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function ProfilePage() {
  const { user: authUser, loading, logout, setUser } = useAuth();
  const router = useRouter();

  const [user, setLocalUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [status, setStatus] = useState({ loading: false, message: null, error: null });

  // Profile form with react-hook-form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
    setValue: setProfileValue
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: ''
    }
  });

  // Password form with react-hook-form
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

  useEffect(() => {
    if (!loading && !authUser) router.replace(ROUTES.AUTH.ROOT);
  }, [loading, authUser, router]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axiosInstance.get(ROUTES.API.PROFILE.ME);
        const userData = res.data.user ?? res.data;
        setLocalUser(userData);

        // Populate form with existing data
        setProfileValue('first_name', userData?.first_name || '');
        setProfileValue('last_name', userData?.last_name || '');
        setProfileValue('phone', userData?.phone || '');
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setLocalUser(authUser || null);
      }
    }
    if (authUser) fetchProfile();
  }, [authUser, setProfileValue]);

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => {
        setStatus(prev => ({ ...prev, message: null }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status.message]);

  // Save profile with react-hook-form
  async function saveProfile(data) {
    setStatus({ loading: true, message: null, error: null });
    try {
      const res = await axiosInstance.put(ROUTES.API.PROFILE.UPDATE, {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone: data.phone?.trim() || null
      });
      const newUser = res.data.user;
      setLocalUser(newUser);
      setUser?.(newUser);
      setEditing(false);
      setStatus({ loading: false, message: 'Profile updated successfully!', error: null });
    } catch (err) {
      setStatus({
        loading: false,
        message: null,
        error: err.response?.data?.message || 'Failed to update profile'
      });
    }
  }

  // Upload avatar
  // ProfilePage.jsx - Updated uploadAvatar function

  async function uploadAvatar() {
    if (!avatarFile) return;
    setStatus({ loading: true, message: null, error: null });

    try {
      // Get presigned URL from backend
      const fileExtension = avatarFile.name.substring(avatarFile.name.lastIndexOf('.'));
      const urlResponse = await axiosInstance.post(ROUTES.API.PROFILE.AVATAR_UPLOAD_URL, {
        fileExtension: fileExtension,
        contentType: avatarFile.type,
      });

      const { uploadUrl, publicUrl, key } = urlResponse.data.data;

      // Upload directly to S3 using presigned URL
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': avatarFile.type,
        },
        body: avatarFile,
      });

      // Confirm upload with backend
      const confirmResponse = await axiosInstance.post(ROUTES.API.PROFILE.AVATAR_CONFIRM, {
        s3Key: key,
        publicUrl: publicUrl,
      });

      const newUser = confirmResponse.data.user;
      setLocalUser(newUser);
      setUser?.(newUser);
      setAvatarFile(null);
      setAvatarPreview(null);
      setStatus({ loading: false, message: 'Avatar uploaded successfully!', error: null });
    } catch (err) {
      console.error('Upload error:', err);
      setStatus({
        loading: false,
        message: null,
        error: err.response?.data?.message || 'Avatar upload failed',
      });
    }
  }


  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatus({ loading: false, message: null, error: 'Image must be less than 5MB' });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        setStatus({ loading: false, message: null, error: 'Only JPG, PNG, GIF, and WEBP images are allowed' });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }

  // Change password with react-hook-form
  async function changePassword(data) {
    setStatus({ loading: true, message: null, error: null });
    try {
      await axiosInstance.patch(ROUTES.API.PROFILE.PASSWORD, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      resetPassword();
      setShowPasswordModal(false);
      setStatus({ loading: false, message: 'Password changed successfully!', error: null });
    } catch (err) {
      setStatus({
        loading: false,
        message: null,
        error: err.response?.data?.message || 'Password change failed'
      });
    }
  }

  async function handleLogout() {
    await logout();
    router.push(ROUTES.HOME);
  }

  function handleCancelEdit() {
    setEditing(false);
    resetProfile({
      first_name: displayUser?.first_name || '',
      last_name: displayUser?.last_name || '',
      phone: displayUser?.phone || ''
    });
  }

  if (loading) {
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

  const displayUser = user || authUser;
  const isOAuthUser = displayUser?.provider === 'google';
  const fullName = `${displayUser?.first_name || ''} ${displayUser?.last_name || ''}`.trim() || 'User';
  const initials = `${displayUser?.first_name?.[0] || ''}${displayUser?.last_name?.[0] || ''}`.toUpperCase() || 'U';

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

        {/* Status Messages */}
        <AnimatePresence>
          {status.message && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-4 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-emerald-900 font-bold text-sm">{status.message}</span>
            </motion.div>
          )}

          {status.error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-red-900 font-bold text-sm">{status.error}</span>
            </motion.div>
          )}
        </AnimatePresence>

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
                      { label: "First Name", value: displayUser?.first_name || "—" },
                      { label: "Last Name", value: displayUser?.last_name || "—" },
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
                  <form onSubmit={handleSubmitProfile(saveProfile)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        disabled={status.loading}
                        className="h-12 px-8 bg-[#3a1224] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg disabled:opacity-50 cursor-pointer"
                      >
                        {status.loading ? 'Saving...' : 'Save Changes'}
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
                    onClick={uploadAvatar} 
                    disabled={status.loading}
                    className="w-full h-12 bg-[#C0A04C] text-[#3a1224] rounded-xl mt-4 font-black text-[9px] uppercase tracking-widest shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {status.loading ? 'Uploading...' : 'Upload'}
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
                  onClick={() => { setShowPasswordModal(false); resetPassword(); setStatus({ loading: false, message: null, error: null }); }} 
                  className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Error Message */}
              {status.error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-red-700 text-[9px] font-black uppercase tracking-widest">{status.error}</span>
                </div>
              )}

              <form onSubmit={handleSubmitPassword(changePassword)} className="space-y-4">
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
                    {...registerPassword('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} 
                    placeholder="••••••••" 
                    className={`w-full h-12 px-4 bg-gray-50 border rounded-xl focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all ${
                      passwordErrors.newPassword ? 'border-red-300 bg-red-50' : 'border-[#3a1224]/10'
                    }`}
                  />
                  {passwordErrors.newPassword && <p className="text-red-500 text-[8px] font-black mt-1">{passwordErrors.newPassword.message}</p>}
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
                  disabled={status.loading} 
                  className="w-full h-12 bg-[#3a1224] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg mt-6 disabled:opacity-50 cursor-pointer"
                >
                  {status.loading ? 'Updating...' : 'Update Password'}
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
