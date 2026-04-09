'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from 'contexts/AuthProvider';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'lib/axios';
import { Settings, Bell, CreditCard, LogOut, Mail, Phone, MapPin, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import BreadcrumbNav from 'components/organizer/BreadcrumbNav';
import { ROUTES } from 'config/routes';
import { useQueryOrganizerStatus } from '@queries/organizer/status';
import { useQueryProfileMy } from '@queries/customer/profile-my';

export default function OrganizerSettings() {
  const { user: authUser, logout, setUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState({
    profile: false,
    payment: false,
    notifications: false,
  });

  // Fetch fresh profile data from API
  const { data: profileData, isLoading: profileLoading } = useQueryProfileMy();
  const user = profileData?.user || profileData || authUser;

  const { data: statusData, isLoading: statusLoading } = useQueryOrganizerStatus({
    enabled: !!user,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      phone: user?.phone || '',
      city: user?.city || '',
      taxId: user?.organizerDetails?.taxId || '',
      bankCode: user?.organizerDetails?.bankCode || '',
      bankAccount: user?.organizerDetails?.bankAccount || '',
      accountHolder: user?.organizerDetails?.accountHolder || '',
      notificationsEmail: user?.organizerDetails?.notificationsEmail ?? true,
      notificationsSms: user?.organizerDetails?.notificationsSms ?? false,
      notificationsEventUpdates: user?.organizerDetails?.notificationsEventUpdates ?? true,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        phone: user?.phone || '',
        city: user?.city || '',
        taxId: user?.organizerDetails?.taxId || '',
        bankCode: user?.organizerDetails?.bankCode || '',
        bankAccount: user?.organizerDetails?.bankAccount || '',
        accountHolder: user?.organizerDetails?.accountHolder || '',
        notificationsEmail: user?.organizerDetails?.notificationsEmail ?? true,
        notificationsSms: user?.organizerDetails?.notificationsSms ?? false,
        notificationsEventUpdates: user?.organizerDetails?.notificationsEventUpdates ?? true,
      });
    }
  }, [user, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.put(ROUTES.API.PROFILE.UPDATE, payload);
      return res.data;
    },
    onSuccess: async (data) => {
      toast.success('Settings saved successfully!');
      setEditMode(prev => ({
        ...prev,
        [activeTab]: false
      }));
      
      // Get fresh user data from mutation response
      const userData = data?.user || data?.profile;
      
      if (userData) {
        // Reset form with fresh data
        reset({
          firstName: userData?.first_name || '',
          lastName: userData?.last_name || '',
          phone: userData?.phone || '',
          city: userData?.city || '',
          taxId: userData?.organizerDetails?.taxId || '',
          bankCode: userData?.organizerDetails?.bankCode || '',
          bankAccount: userData?.organizerDetails?.bankAccount || '',
          accountHolder: userData?.organizerDetails?.accountHolder || '',
          notificationsEmail: userData?.organizerDetails?.notificationsEmail ?? true,
          notificationsSms: userData?.organizerDetails?.notificationsSms ?? false,
          notificationsEventUpdates: userData?.organizerDetails?.notificationsEventUpdates ?? true,
        });
        
        // Update auth context immediately
        setUser?.(userData);
      }
      
      // Set stale time to 0 and invalidate to force immediate refetch
      queryClient.removeQueries({ queryKey: ['profile-my'] });
      // Refetch with cache bypass
      await queryClient.refetchQueries({ queryKey: ['profile-my'], stale: true });
      // Also invalidate auth user queries for immediate context update
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to save settings');
    },
  });

  const onSaveAccount = (data) => {
    updateProfileMutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      city: data.city,
    });
  };

  const onSavePayment = (data) => {
    updateProfileMutation.mutate({
      organizerDetails: {
        taxId: data.taxId,
        bankCode: data.bankCode,
        bankAccount: data.bankAccount,
        accountHolder: data.accountHolder,
      },
    });
  };

  const onSaveNotifications = (data) => {
    updateProfileMutation.mutate({
      organizerDetails: {
        notificationsEmail: data.notificationsEmail,
        notificationsSms: data.notificationsSms,
        notificationsEventUpdates: data.notificationsEventUpdates,
      },
    });
  };

  const handleLogout = async () => {
    try {
      // Call logout API endpoint
      const response = await axiosInstance.post(ROUTES.API.AUTH.LOGOUT);
      
      // Clear auth context
      await logout();
      
      // Clear any cached queries
      queryClient.clear();
      
      // Redirect to login
      router.push(ROUTES.AUTH.LOGIN);
      
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to logout';
      toast.error(errorMessage);
    }
  };

  const isOrganizerEligible = statusData?.isOrganizerEligible;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Settings },
    ...(isOrganizerEligible ? [
      { id: 'payment', label: 'Payment', icon: CreditCard },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ] : []),
  ];

  useEffect(() => {
    if (!isOrganizerEligible && (activeTab === 'payment' || activeTab === 'notifications')) {
      setActiveTab('profile');
    }
  }, [isOrganizerEligible, activeTab]);

  const formValues = watch();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-12 sm:pb-20">
        {/* Breadcrumb */}
        <div className="mb-8">
          <BreadcrumbNav />
        </div>

        {/* Header */}
        <header className="mb-8 sm:mb-12">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-[1px] bg-[#C0A04C]" />
            <span className="text-xs font-semibold text-[#C0A04C] uppercase tracking-wide">Settings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-3">
            Organizer <span className="text-[#C0A04C]">Settings</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">Manage your account, payment details, and preferences.</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#3a1224] text-white shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Account Information Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">Profile Information</h2>
                    <p className="text-sm text-slate-500 mt-1">Update your personal details</p>
                  </div>
                  {!editMode.profile && (
                    <button
                      onClick={() => setEditMode(prev => ({ ...prev, profile: true }))}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#C0A04C]/10 text-[#C0A04C] rounded-lg font-semibold text-sm hover:bg-[#C0A04C]/20 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>

                {!editMode.profile && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">First Name</p>
                        <p className="text-lg font-semibold text-slate-900">{formValues.firstName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Last Name</p>
                        <p className="text-lg font-semibold text-slate-900">{formValues.lastName}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email</p>
                      <p className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {user?.email}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Phone</p>
                        <p className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {formValues.phone || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">City</p>
                        <p className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {formValues.city || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {editMode.profile && (
                  <form onSubmit={handleSubmit(onSaveAccount)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-2">First Name</label>
                        <input
                          type="text"
                          {...register('firstName', { required: 'First name is required' })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 transition-all"
                        />
                        {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-2">Last Name</label>
                        <input
                          type="text"
                          {...register('lastName', { required: 'Last name is required' })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 transition-all"
                        />
                        {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">Email (Read-only)</label>
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-2">Phone</label>
                        <input
                          type="tel"
                          {...register('phone')}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-2">City</label>
                        <input
                          type="text"
                          {...register('city')}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="flex-1 px-6 py-2.5 bg-[#3a1224] text-white rounded-lg font-semibold hover:bg-[#3a1224]/90 disabled:opacity-50 transition-all"
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(prev => ({ ...prev, profile: false }));
                          reset();
                        }}
                        className="flex-1 px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Status Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white">
                <h3 className="text-lg font-black mb-4">Verification Status</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300 mb-1">Current Status</p>
                    <p className="text-2xl font-black">{isOrganizerEligible ? '✓ Verified' : 'Pending'}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black ${
                    isOrganizerEligible ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {isOrganizerEligible ? '✓' : '⏳'}
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-2xl border border-red-200 p-6 sm:p-8">
                <h3 className="text-lg font-black text-red-700 mb-4">Danger Zone</h3>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Account
                </button>
              </div>
            </motion.div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">Payment Details</h2>
                    <p className="text-sm text-slate-500 mt-1">Configure your bank account information</p>
                  </div>
                  {!editMode.payment && (
                    <button
                      onClick={() => setEditMode(prev => ({ ...prev, payment: true }))}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#C0A04C]/10 text-[#C0A04C] rounded-lg font-semibold text-sm hover:bg-[#C0A04C]/20 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>

                {!editMode.payment && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Tax ID</p>
                      <p className="text-lg font-semibold text-slate-900">{formValues.taxId || '—'}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Bank Code</p>
                        <p className="text-lg font-semibold text-slate-900">{formValues.bankCode || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Account Number</p>
                        <p className="text-lg font-semibold text-slate-900">{formValues.bankAccount ? `••••${formValues.bankAccount.slice(-4)}` : '—'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Account Holder</p>
                      <p className="text-lg font-semibold text-slate-900">{formValues.accountHolder || '—'}</p>
                    </div>
                  </div>
                )}

                {editMode.payment && (
                  <form onSubmit={handleSubmit(onSavePayment)} className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">Tax ID</label>
                      <input
                        type="text"
                        {...register('taxId')}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-2">Bank Code</label>
                        <input
                          type="text"
                          {...register('bankCode')}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-2">Account Number</label>
                        <input
                          type="text"
                          {...register('bankAccount')}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">Account Holder Name</label>
                      <input
                        type="text"
                        {...register('accountHolder')}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 transition-all"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="flex-1 px-6 py-2.5 bg-[#3a1224] text-white rounded-lg font-semibold hover:bg-[#3a1224]/90 disabled:opacity-50 transition-all"
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMode(prev => ({ ...prev, payment: false }))}
                        className="flex-1 px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">Notification Preferences</h2>
                    <p className="text-sm text-slate-500 mt-1">Choose how you want to be notified</p>
                  </div>
                  {!editMode.notifications && (
                    <button
                      onClick={() => setEditMode(prev => ({ ...prev, notifications: true }))}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#C0A04C]/10 text-[#C0A04C] rounded-lg font-semibold text-sm hover:bg-[#C0A04C]/20 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>

                {!editMode.notifications && (
                  <div className="space-y-3">
                    {[
                      { key: 'notificationsEmail', label: 'Email Notifications', desc: 'Receive email updates about your events' },
                      { key: 'notificationsSms', label: 'SMS Notifications', desc: 'Receive SMS alerts for check-ins' },
                      { key: 'notificationsEventUpdates', label: 'Event Updates', desc: 'Get notified about new registrations' },
                    ].map((notif) => (
                      <div key={notif.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                          <p className="font-semibold text-slate-900">{notif.label}</p>
                          <p className="text-sm text-slate-500 mt-0.5">{notif.desc}</p>
                        </div>
                        <div className={`flex-shrink-0 h-6 w-11 rounded-full transition-colors ${
                          formValues[notif.key] ? 'bg-emerald-500' : 'bg-slate-300'
                        } flex items-center`}>
                          <span className={`h-5 w-5 rounded-full bg-white transition-transform ${
                            formValues[notif.key] ? 'translate-x-5' : 'translate-x-0.5'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {editMode.notifications && (
                  <form onSubmit={handleSubmit(onSaveNotifications)} className="space-y-4">
                    {[
                      { key: 'notificationsEmail', label: 'Email Notifications', desc: 'Receive email updates about your events' },
                      { key: 'notificationsSms', label: 'SMS Notifications', desc: 'Receive SMS alerts for check-ins' },
                      { key: 'notificationsEventUpdates', label: 'Event Updates', desc: 'Get notified about new registrations' },
                    ].map((notif) => (
                      <label key={notif.key} className="flex items-center p-4 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          {...register(notif.key)}
                          className="w-5 h-5 rounded accent-[#C0A04C] cursor-pointer"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-semibold text-slate-900">{notif.label}</p>
                          <p className="text-sm text-slate-500 mt-0.5">{notif.desc}</p>
                        </div>
                      </label>
                    ))}

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="flex-1 px-6 py-2.5 bg-[#3a1224] text-white rounded-lg font-semibold hover:bg-[#3a1224]/90 disabled:opacity-50 transition-all"
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMode(prev => ({ ...prev, notifications: false }))}
                        className="flex-1 px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
