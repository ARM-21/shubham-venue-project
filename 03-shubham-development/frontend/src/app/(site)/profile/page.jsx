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
      await axiosInstance.put(ROUTES.API.PROFILE.PASSWORD, {
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
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-[#C0A04C]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-[-10%] w-[40%] h-[40%] bg-[#3a1224]/5 blur-[120px] rounded-full" />
      </div>

      {/* Dark Gradient Header background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/95 to-[#fdfaf6] pointer-events-none z-0" />

      <main className="max-w-[1400px] mx-auto px-6 sm:px-8 pt-40 pb-32 relative z-10">
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-[#C0A04C]" />
            <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Account Settings</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-display font-bold text-white mb-6">Your <span className="text-[#C0A04C] italic font-serif">Profile</span></h1>
          <p className="text-white/60 text-lg font-light leading-relaxed max-w-xl">
             Manage your personal details, secure your account, and track your upcoming events.
          </p>
        </header>

        {/* Status Messages */}
        <AnimatePresence>
          {status.message && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-emerald-900 font-bold uppercase tracking-widest text-[10px]">{status.message}</span>
            </motion.div>
          )}

          {status.error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-red-900 font-bold uppercase tracking-widest text-[10px]">{status.error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Sidebar - User Info Card */}
          <div className="lg:col-span-4 h-fit lg:sticky lg:top-32">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-b from-[#C0A04C]/10 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative bg-white rounded-[2.5rem] shadow-[0_30px_70px_rgba(58,18,36,0.12)] border border-[#3a1224]/5 p-10 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C0A04C]/5 rounded-bl-[100px] pointer-events-none" />

                <div className="flex flex-col items-center relative z-10">
                  {/* Avatar */}
                  <div className="relative mb-6">
                    <div className="p-1 rounded-full border-2 border-[#C0A04C]/20 shadow-xl group-hover:border-[#C0A04C]/40 transition-colors duration-500">
                      {displayUser?.profilePicture ? (
                        <img
                          src={displayUser.profilePicture || avatarPreview}
                          alt={fullName}
                          className="w-32 h-32 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#3a1224] to-[#4a172d] text-white flex items-center justify-center text-3xl font-display font-bold">
                          {initials}
                        </div>
                      )}
                    </div>

                    {isOAuthUser && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-lg border border-[#3a1224]/5">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="G" className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <h2 className="text-3xl font-display font-bold text-[#3a1224] text-center mb-1 tracking-tight">{fullName}</h2>
                  <p className="text-[#3a1224]/50 text-sm font-medium mb-4">{displayUser?.email}</p>

                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 ${
                    displayUser?.role === 'admin' ? 'bg-[#3a1224] text-white shadow-lg' : 'bg-[#C0A04C]/10 text-[#C0A04C]'
                  }`}>
                    {displayUser?.role === 'admin' ? 'Strategic Admin' : displayUser?.isOrganizerEligible ? 'Elite Organizer' : 'Valued Guest'}
                  </div>

                  {/* Sidebar Navigation - Actual Classic Style */}
                  <div className="w-full space-y-3 pt-6 border-t border-[#3a1224]/5">
                    {[
                      { label: "My Bookings", icon: Calendar, href: ROUTES.SITE.BOOKINGS },
                      { label: "My Tickets", icon: Ticket, href: ROUTES.SITE.TICKETS },
                      { label: "Organizer Hub", icon: Users, href: ROUTES.SITE.ORGANIZER },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => router.push(item.href || '#')}
                        className="w-full h-14 flex items-center px-6 gap-4 rounded-2xl bg-[#fdfaf6] hover:bg-white text-[#3a1224] text-xs font-black uppercase tracking-[0.2em] border border-transparent hover:border-[#C0A04C]/20 hover:shadow-lg transition-all duration-300"
                      >
                        <item.icon className="w-4 h-4 text-[#C0A04C]" />
                        {item.label}
                      </button>
                    ))}
                    
                    <button
                      onClick={handleLogout}
                      className="w-full h-14 flex items-center px-6 gap-4 rounded-2xl bg-red-50 text-red-600 text-xs font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all duration-500 shadow-sm hover:shadow-red-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Secure Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12 pb-20">
            {/* Profile Information Section */}
            <section className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#C0A04C]/5 to-[#3a1224]/5 rounded-[2.5rem] blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-[#3a1224]/5 p-8 md:p-12 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-[2px] bg-[#C0A04C] rounded-full" />
                      <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Personal Details</span>
                    </div>
                    <h3 className="text-4xl font-display font-bold text-[#3a1224] tracking-tight">Identity Profile</h3>
                  </div>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="h-14 px-8 bg-[#3a1224] text-[#C0A04C] rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all"
                    >
                      <User className="w-4 h-4" /> Edit Profile
                    </button>
                  )}
                </div>

                {!editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {[
                      { label: "First Name", value: displayUser?.first_name },
                      { label: "Last Name", value: displayUser?.last_name },
                      { label: "Email Address", value: displayUser?.email, tag: isOAuthUser ? "Verified via Google" : null },
                      { label: "Primary Phone", value: displayUser?.phone || 'No phone added' }
                    ].map((field, idx) => (
                      <div key={idx} className="space-y-3 group/item">
                        <label className="text-[10px] font-black text-[#3a1224]/30 uppercase tracking-[0.3em]">{field.label}</label>
                        <div className="flex items-center gap-3">
                          <p className="text-xl font-medium text-[#3a1224] group-hover/item:text-[#C0A04C] transition-colors">{field.value || 'Not set'}</p>
                          {field.tag && <span className="text-[8px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-black uppercase tracking-widest border border-blue-100">{field.tag}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <form onSubmit={handleSubmitProfile(saveProfile)} className="grid grid-cols-1 md:grid-cols-2 gap-8 auth-form-container">
                    <div className="space-y-4">
                      <label>First Name</label>
                      <input
                        type="text"
                        {...registerProfile('first_name', { required: 'Required' })}
                        placeholder="First Name"
                      />
                      {profileErrors.first_name && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{profileErrors.first_name.message}</p>}
                    </div>

                    <div className="space-y-4">
                      <label>Last Name</label>
                      <input
                        type="text"
                        {...registerProfile('last_name', { required: 'Required' })}
                        placeholder="Last Name"
                      />
                      {profileErrors.last_name && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{profileErrors.last_name.message}</p>}
                    </div>

                    <div className="space-y-4">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        {...registerProfile('phone', { pattern: { value: /^[0-9]{10}$/, message: '10 digits required' } })}
                        placeholder="e.g. 9841234567"
                      />
                      {profileErrors.phone && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{profileErrors.phone.message}</p>}
                    </div>

                    <div className="space-y-4">
                      <label>Email (Verified)</label>
                      <input type="email" value={displayUser?.email} disabled className="opacity-50 cursor-not-allowed" />
                    </div>

                    <div className="col-span-full flex gap-4 pt-6">
                      <button
                        type="submit"
                        disabled={status.loading}
                        className="h-14 px-10 bg-[#3a1224] text-[#C0A04C] rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl disabled:opacity-50"
                      >
                        {status.loading ? 'Synchronizing...' : 'Update identity'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="h-14 px-10 border border-[#3a1224]/10 text-[#3a1224]/60 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>

            {/* Avatar & Security - Glass Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <section className="bg-white rounded-[2.5rem] shadow-sm border border-[#3a1224]/5 p-10 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#3a1224]/[0.02] rounded-bl-full transition-all group-hover:w-32 group-hover:h-32" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                       <Camera className="w-4 h-4 text-[#C0A04C]" />
                       <span className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.3em]">Portrait</span>
                    </div>
                    <h4 className="text-2xl font-display font-bold text-[#3a1224] mb-4">Profile Photo</h4>
                    
                    {avatarPreview && (
                      <img src={avatarPreview} alt="P" className="w-16 h-16 rounded-2xl object-cover mb-6 border-2 border-[#C0A04C]/20" />
                    )}

                    <label className="block w-full cursor-pointer">
                       <div className="h-14 border-2 border-dashed border-[#3a1224]/10 rounded-2xl flex items-center justify-center gap-3 hover:border-[#C0A04C]/40 hover:bg-[#C0A04C]/5 transition-all text-[10px] font-black uppercase tracking-widest text-[#3a1224]/40">
                          {avatarFile ? avatarFile.name : 'Upload New'}
                       </div>
                       <input type="file" onChange={handleAvatarChange} className="hidden" />
                    </label>

                    {avatarFile && (
                      <button onClick={uploadAvatar} className="w-full h-14 bg-[#C0A04C] text-[#3a1224] rounded-2xl mt-4 font-black text-[10px] uppercase tracking-widest shadow-lg">Confirm Upload</button>
                    )}
                  </div>
               </section>

               {!isOAuthUser && (
                 <section className="bg-white rounded-[2.5rem] shadow-sm border border-[#3a1224]/5 p-10 group">
                    <div className="flex items-center gap-3 mb-8">
                       <ShieldCheck className="w-4 h-4 text-[#3a1224]" />
                       <span className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.3em]">Integrity</span>
                    </div>
                    <h4 className="text-2xl font-display font-bold text-[#3a1224] mb-4">Security Gate</h4>
                    <p className="text-[11px] text-[#3a1224]/50 leading-relaxed mb-10 max-w-[200px]">Rotate your password regularly to keep your events secure.</p>
                    
                    <button 
                       onClick={() => setShowPasswordModal(true)}
                       className="w-full h-14 border-2 border-[#3a1224] text-[#3a1224] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#3a1224] hover:text-white transition-all duration-500"
                    >
                       Change Secret
                    </button>
                 </section>
               )}
            </div>
            
            {/* Account Protection Badge for OAuth */}
            {isOAuthUser && (
              <div className="bg-[#3a1224] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-[-20px] right-[-20px] w-64 h-64 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex gap-8 items-center">
                  <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/10">
                    <ShieldCheck className="w-10 h-10 text-[#C0A04C]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-3xl font-display font-bold mb-2 tracking-tight">Protected by Google Authority</h4>
                    <p className="text-white/40 text-sm leading-relaxed max-w-lg">
                      Your identity and secondary factors are verified through Google's secure gateway. 
                      You don't need to manage a separate password here.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && !isOAuthUser && (
          <div className="fixed inset-0 bg-[#3a1224]/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} 
               animate={{ scale: 1, opacity: 1 }}
               className="bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] max-w-md w-full p-12 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[#C0A04C]" />
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-4xl font-display font-bold text-[#3a1224] tracking-tight">Change Password</h3>
                <button onClick={() => { setShowPasswordModal(false); resetPassword(); }} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitPassword(changePassword)} className="space-y-6 auth-form-container">
                <div className="space-y-4">
                  <label>Current Gateway Secret</label>
                  <input type="password" {...registerPassword('currentPassword', { required: 'Required' })} placeholder="••••••••" />
                </div>
                <div className="space-y-4">
                  <label>New Secret Key</label>
                  <input type="password" {...registerPassword('newPassword', { required: 'Required', minLength: 8 })} placeholder="••••••••" />
                </div>
                <div className="space-y-4">
                  <label>Confirm New Secret</label>
                  <input type="password" {...registerPassword('confirmPassword', { validate: v => v === newPassword || 'Mismatch' })} placeholder="••••••••" />
                </div>
                
                <button type="submit" disabled={status.loading} className="w-full h-16 bg-[#3a1224] text-[#C0A04C] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl mt-6">
                  {status.loading ? 'Updating Vault...' : 'Seal Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </main>

      <style jsx global>{`
        /* Reuse the modern form styles we shared across the site */
        .auth-form-container input {
          background-color: #f8f9fa !important;
          border-color: rgba(58, 18, 36, 0.05) !important;
          color: #3a1224 !important;
          height: 60px !important;
          border-radius: 16px !important;
          font-size: 15px !important;
          padding: 0 24px !important;
          transition: all 0.3s ease !important;
        }
        .auth-form-container input:focus {
          border-color: rgba(192, 160, 76, 0.5) !important;
          background-color: #fff !important;
          box-shadow: 0 0 0 4px rgba(192, 160, 76, 0.1) !important;
        }
        .auth-form-container label {
          font-size: 10px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.2em !important;
          color: rgba(58, 18, 36, 0.4) !important;
          margin-bottom: 8px !important;
          display: block;
        }
      `}</style>
    </div>
  );
}
