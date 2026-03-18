'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';
import { ROUTES } from '@/config/routes';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!authUser) return null;

  const displayUser = user || authUser;
  const isOAuthUser = displayUser?.provider === 'google';
  const fullName = `${displayUser?.first_name || ''} ${displayUser?.last_name || ''}`.trim() || 'User';
  const initials = `${displayUser?.first_name?.[0] || ''}${displayUser?.last_name?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Status Messages */}
        {status.message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800">{status.message}</span>
          </div>
        )}

        {status.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800">{status.error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - User Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="relative">
                  {displayUser?.profilePicture ? (
                    <img
                      src={displayUser.profilePicture || avatarPreview}
                      alt={fullName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-indigo-100">
                      {initials}
                    </div>
                  )}

                  {/* OAuth Badge */}
                  {/* OAuth Badge with Official Google Logo */}
                  {isOAuthUser && (
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md border-2 border-white">
                      <img
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google"
                        className="w-5 h-5"
                      />
                    </div>
                  )}

                </div>

                <h2 className="mt-4 text-xl font-bold text-gray-900">{fullName}</h2>
                <p className="text-sm text-gray-600">{displayUser?.email}</p>

                {/* Auth Method Badge */}
                {isOAuthUser && (
                  <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 bg-red-10 rounded-full">
                    <img
                      src="https://developers.google.com/identity/images/g-logo.png"
                      alt="Google"
                      className="w-5 h-5"
                    />
                    <span className="text-xs font-medium text-black-700">Google Account</span>
                  </div>
                )}

                {displayUser?.phone && (
                  <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {displayUser.phone}
                  </p>
                )}

                {/* Role Badge */}
                <span className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${displayUser?.role === 'admin'
                  ? 'bg-purple-100 text-purple-800'
                  : displayUser?.isOrganizerEligible
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                  {displayUser?.role === 'admin' ? 'Admin' : displayUser?.isOrganizerEligible ? 'Event Organizer' : 'Customer'}
                </span>

                {/* Quick Actions */}
                <div className="mt-6 w-full space-y-2">
                  <button
                    onClick={() => router.push(ROUTES.SITE.BOOKINGS)}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={() => router.push(ROUTES.SITE.TICKETS)}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    My Tickets
                  </button>
                  <button
                    onClick={() => router.push(ROUTES.SITE.ORGANIZER)}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Organizer Hub
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* OAuth Info Banner */}
            {isOAuthUser && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900">Google Account Connected</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      You signed in with Google. Your email and profile picture are managed by your Google account.
                      Password changes are not available for OAuth accounts.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                )}
              </div>

              {!editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</label>
                    <p className="mt-1 text-gray-900">{displayUser?.first_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</label>
                    <p className="mt-1 text-gray-900">{displayUser?.last_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-900">{displayUser?.email}</p>
                      {isOAuthUser && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          Via Google
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</label>
                    <p className="mt-1 text-gray-900">{displayUser?.phone || 'Not set'}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitProfile(saveProfile)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name *</label>
                    <input
                      type="text"
                      {...registerProfile('first_name', {
                        required: 'First name is required',
                        minLength: { value: 2, message: 'First name must be at least 2 characters' },
                        maxLength: { value: 50, message: 'First name must not exceed 50 characters' }
                      })}
                      className={`mt-1 w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${profileErrors.first_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Enter your first name"
                    />
                    {profileErrors.first_name && (
                      <p className="mt-1 text-xs text-red-600">{profileErrors.first_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                    <input
                      type="text"
                      {...registerProfile('last_name', {
                        required: 'Last name is required',
                        minLength: { value: 2, message: 'Last name must be at least 2 characters' },
                        maxLength: { value: 50, message: 'Last name must not exceed 50 characters' }
                      })}
                      className={`mt-1 w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${profileErrors.last_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Enter your last name"
                    />
                    {profileErrors.last_name && (
                      <p className="mt-1 text-xs text-red-600">{profileErrors.last_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      {...registerProfile('phone', {
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: 'Phone must be exactly 10 digits'
                        }
                      })}
                      className={`mt-1 w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${profileErrors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="9841234567"
                    />
                    {profileErrors.phone && (
                      <p className="mt-1 text-xs text-red-600">{profileErrors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-gray-50"
                      value={displayUser?.email}
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {isOAuthUser ? 'Email is managed by your Google account' : 'Email cannot be changed'}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={status.loading}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status.loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Avatar Upload Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Picture</h3>
              {isOAuthUser && (
                <p className="text-sm text-gray-600 mb-4">
                  Your profile picture from Google is automatically synced. You can upload a custom one to override it.
                </p>
              )}

              {avatarPreview && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img src={avatarPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-400 transition text-center">
                    <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      {avatarFile ? avatarFile.name : 'Click to select image'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF or WEBP (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>

                {avatarFile && (
                  <button
                    onClick={uploadAvatar}
                    disabled={status.loading}
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {status.loading ? 'Uploading...' : 'Upload'}
                  </button>
                )}
              </div>
            </div>

            {/* Security Card - Hide for OAuth users */}
            {!isOAuthUser && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Password</p>
                    <p className="text-sm text-gray-600">Manage your password</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {/* OAuth Account Info */}
            {isOAuthUser && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Protected by Google</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Your account security is managed through Google's authentication system.
                      To change your password or manage security settings, visit your
                      <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline ml-1">
                        Google Account settings
                      </a>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Password Change Modal - Only for manual users */}
        {showPasswordModal && !isOAuthUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    resetPassword();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitPassword(changePassword)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password *</label>
                  <input
                    type="password"
                    {...registerPassword('currentPassword', {
                      required: 'Current password is required'
                    })}
                    className={`mt-1 w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 ${passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Enter current password"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-xs text-red-600">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password *</label>
                  <input
                    type="password"
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Password must contain uppercase, lowercase, and number'
                      }
                    })}
                    className={`mt-1 w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 ${passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Enter new password (min 8 characters)"
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-xs text-red-600">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password *</label>
                  <input
                    type="password"
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === newPassword || 'Passwords do not match'
                    })}
                    className={`mt-1 w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 ${passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Re-enter new password"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={status.loading}
                    className="flex-1 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {status.loading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      resetPassword();
                    }}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
