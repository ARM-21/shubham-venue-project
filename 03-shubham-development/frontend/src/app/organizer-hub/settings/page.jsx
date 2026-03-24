'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from 'contexts/AuthProvider';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'lib/axios';
import { Settings, Bell, CreditCard, Lock, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import BreadcrumbNav from 'components/organizer/BreadcrumbNav';
import { ROUTES } from 'config/routes';
import { useQueryOrganizerStatus } from '@queries/organizer/status';

export default function OrganizerSettings() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState({
    profile: false,
    payment: false,
    notifications: false,
  });

  // Fetch fresh organizer status from server
  const { data: statusData, isLoading: statusLoading } = useQueryOrganizerStatus({
    enabled: !!user,
  });

  // Form setup with react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || user?.first_name || '',
      lastName: user?.lastName || user?.last_name || '',
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

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user?.firstName || user?.first_name || '',
        lastName: user?.lastName || user?.last_name || '',
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

  // Mutation - send to server
  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.put(ROUTES.API.PROFILE.UPDATE, payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Settings saved successfully!');
      // Exit edit mode after save
      setEditMode(prev => ({
        ...prev,
        [activeTab]: false
      }));
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ["profile-me"] });
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
    await logout();
    router.push(ROUTES.AUTH.LOGIN);
  };

  // Get organizer eligibility status
  const isOrganizerEligible = statusData?.isOrganizerEligible;

  // Conditional tabs
  const tabs = [
    { id: 'profile', label: 'Account', icon: Settings },
    ...(isOrganizerEligible ? [
      { id: 'payment', label: 'Payment', icon: CreditCard },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ] : []),
  ];

  // Reset active tab if no longer eligible
  useEffect(() => {
    if (!isOrganizerEligible && (activeTab === 'payment' || activeTab === 'notifications')) {
      setActiveTab('profile');
    }
  }, [isOrganizerEligible, activeTab]);

  const formValues = watch();

  return (
    <div className="min-h-screen bg-[#fdfaf6] relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/80 to-[#fdfaf6] pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 pb-12 sm:pb-20">
        {/* Breadcrumb */}
        <div className="mb-8">
          <BreadcrumbNav />
        </div>

        {/* Header */}
        <header className="mb-8 sm:mb-16">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-[1px] bg-[#C0A04C]" />
            <span className="text-[8px] sm:text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Settings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-display font-bold text-white mb-2 sm:mb-4">
            Organizer <span className="text-[#C0A04C] italic font-serif">Settings</span>
          </h1>
          <p className="text-white/70 text-xs sm:text-base lg:text-lg font-light max-w-2xl">
            Manage your account, payment methods, and notification preferences.
          </p>
        </header>

        {/* Main Card */}
        <div className="bg-white/95 rounded-2xl sm:rounded-3xl shadow-lg backdrop-blur-sm border border-[#3a1224]/5 overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-0 border-b border-[#3a1224]/10 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] sm:min-w-auto px-3 sm:px-6 py-4 sm:py-5 text-center border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#C0A04C] bg-[#C0A04C]/5'
                      : 'border-transparent text-[#3a1224]/50 hover:text-[#3a1224]/70'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2 text-[7px] sm:text-[9px] font-black uppercase tracking-widest">
                    <Icon size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-10 xl:p-12">
            <AnimatePresence mode="wait">
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-[#3a1224]">Account Information</h2>
                    {!editMode.profile && (
                      <button
                        onClick={() => setEditMode(prev => ({ ...prev, profile: true }))}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#C0A04C]/10 text-[#C0A04C] rounded-lg sm:rounded-xl font-black text-[7px] sm:text-[9px] uppercase tracking-widest hover:bg-[#C0A04C]/20 transition-all"
                      >
                        <ChevronRight size={14} className="sm:w-4 sm:h-4" /> Edit
                      </button>
                    )}
                  </div>

                  {!isOrganizerEligible && (
                    <div className="mb-8 p-4 sm:p-5 bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl">
                      <p className="text-sm sm:text-base text-amber-900 font-semibold">
                        💡 Payment and notification settings will be available once your organizer account is verified.
                      </p>
                    </div>
                  )}

                  {/* VIEW MODE */}
                  {!editMode.profile && (
                    <div className="space-y-6 mb-8">
                      <div className="p-4 sm:p-5 bg-[#3a1224]/5 rounded-lg sm:rounded-2xl">
                        <p className="text-[8px] sm:text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2">Name</p>
                        <p className="text-base sm:text-lg font-bold text-[#3a1224]">{formValues.firstName} {formValues.lastName}</p>
                      </div>
                      <div className="p-4 sm:p-5 bg-[#3a1224]/5 rounded-lg sm:rounded-2xl">
                        <p className="text-[8px] sm:text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2">Email</p>
                        <p className="text-base sm:text-lg font-bold text-[#3a1224]">{user?.email}</p>
                      </div>
                      <div className="p-4 sm:p-5 bg-[#3a1224]/5 rounded-lg sm:rounded-2xl">
                        <p className="text-[8px] sm:text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2">Phone</p>
                        <p className="text-base sm:text-lg font-bold text-[#3a1224]">{formValues.phone || 'Not provided'}</p>
                      </div>
                      <div className="p-4 sm:p-5 bg-[#3a1224]/5 rounded-lg sm:rounded-2xl">
                        <p className="text-[8px] sm:text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2">City</p>
                        <p className="text-base sm:text-lg font-bold text-[#3a1224]">{formValues.city || 'Not provided'}</p>
                      </div>
                      <div className="p-4 sm:p-5 bg-[#3a1224]/5 rounded-lg sm:rounded-2xl">
                        <p className="text-[8px] sm:text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2">Status</p>
                        <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-[7px] sm:text-[9px] font-black uppercase tracking-widest ${
                          statusData?.isOrganizerEligible ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {statusData?.isOrganizerEligible ? '✓ Verified Organizer' : 'Pending Verification'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EDIT MODE */}
                  {editMode.profile && (
                    <form onSubmit={handleSubmit(onSaveAccount)} className="space-y-6 mb-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3 block">First Name</label>
                          <input
                            type="text"
                            {...register('firstName', { required: 'First name is required' })}
                            className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-gray-50 border border-[#3a1224]/10 rounded-lg sm:rounded-xl text-xs sm:text-base text-[#3a1224] focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20"
                          />
                          {errors.firstName && <p className="text-[10px] text-red-500 mt-1">{errors.firstName.message}</p>}
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3 block">Last Name</label>
                          <input
                            type="text"
                            {...register('lastName', { required: 'Last name is required' })}
                            className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-gray-50 border border-[#3a1224]/10 rounded-lg sm:rounded-xl text-xs sm:text-base text-[#3a1224] focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20"
                          />
                          {errors.lastName && <p className="text-[10px] text-red-500 mt-1">{errors.lastName.message}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3 block">Email</label>
                        <input
                          type="email"
                          value={user?.email}
                          disabled
                          className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-gray-100 border border-[#3a1224]/10 rounded-lg sm:rounded-xl text-xs sm:text-base text-[#3a1224]/50 cursor-not-allowed"
                        />
                        <p className="text-[10px] text-[#3a1224]/40 mt-2">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3 block">Phone</label>
                        <input
                          type="tel"
                          {...register('phone')}
                          className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-gray-50 border border-[#3a1224]/10 rounded-lg sm:rounded-xl text-xs sm:text-base text-[#3a1224] focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3 block">City</label>
                        <input
                          type="text"
                          {...register('city')}
                          className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-gray-50 border border-[#3a1224]/10 rounded-lg sm:rounded-xl text-xs sm:text-base text-[#3a1224] focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20"
                        />
                      </div>

                      <div className="flex gap-3 sm:gap-4">
                        <button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          className="flex-1 h-10 sm:h-12 bg-[#3a1224] text-white rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest shadow-lg hover:bg-[#3a1224]/90 disabled:opacity-50 transition-all"
                        >
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditMode(prev => ({ ...prev, profile: false }));
                            reset();
                          }}
                          className="flex-1 h-10 sm:h-12 bg-gray-200 text-[#3a1224] rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest hover:bg-gray-300 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Danger Zone */}
                  <div className="border-t border-[#3a1224]/10 pt-6 sm:pt-8 mt-8">
                    <h3 className="text-base sm:text-lg font-bold text-[#3a1224] mb-4 sm:mb-6">Danger Zone</h3>
                    <button
                      onClick={handleLogout}
                      className="w-full h-10 sm:h-12 flex items-center justify-center gap-2 bg-red-50 text-red-600 rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                    >
                      <LogOut size={14} className="sm:w-4 sm:h-4" /> Logout
                    </button>
                  </div>
                </motion.div>
              )}

              {/* PAYMENT TAB */}
              {activeTab === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-[#3a1224]">Payment Information</h2>
                    {!editMode.payment && (
                      <button
                        onClick={() => setEditMode(prev => ({ ...prev, payment: true }))}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#C0A04C]/10 text-[#C0A04C] rounded-lg sm:rounded-xl font-black text-[7px] sm:text-[9px] uppercase tracking-widest hover:bg-[#C0A04C]/20 transition-all"
                      >
                        <ChevronRight size={14} className="sm:w-4 sm:h-4" /> Edit
                      </button>
                    )}
                  </div>

                  {!editMode.payment && (
                    <div className="space-y-4 mb-8">
                      <div className="p-4 sm:p-5 bg-[#3a1224]/5 rounded-lg sm:rounded-2xl">
                        <p className="text-[8px] sm:text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2">Tax ID</p>
                        <p className="text-base sm:text-lg font-bold text-[#3a1224]">{formValues.taxId || 'Not provided'}</p>
                      </div>
                      <div className="p-4 sm:p-5 bg-[#3a1224]/5 rounded-lg sm:rounded-2xl">
                        <p className="text-[8px] sm:text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2">Bank Code</p>
                        <p className="text-base sm:text-lg font-bold text-[#3a1224]">{formValues.bankCode || 'Not provided'}</p>
                      </div>
                      <div className="p-4 sm:p-5 bg-[#3a1224]/5 rounded-lg sm:rounded-2xl">
                        <p className="text-[8px] sm:text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2">Account Number</p>
                        <p className="text-base sm:text-lg font-bold text-[#3a1224]">{formValues.bankAccount || 'Not provided'}</p>
                      </div>
                      <div className="p-4 sm:p-5 bg-[#3a1224]/5 rounded-lg sm:rounded-2xl">
                        <p className="text-[8px] sm:text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2">Account Holder</p>
                        <p className="text-base sm:text-lg font-bold text-[#3a1224]">{formValues.accountHolder || 'Not provided'}</p>
                      </div>
                    </div>
                  )}

                  {editMode.payment && (
                    <form onSubmit={handleSubmit(onSavePayment)} className="space-y-6 mb-8">
                      <div>
                        <label className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3 block">Tax ID</label>
                        <input
                          type="text"
                          {...register('taxId')}
                          className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-gray-50 border border-[#3a1224]/10 rounded-lg sm:rounded-xl text-xs sm:text-base text-[#3a1224] focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3 block">Bank Code</label>
                          <input
                            type="text"
                            {...register('bankCode')}
                            className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-gray-50 border border-[#3a1224]/10 rounded-lg sm:rounded-xl text-xs sm:text-base text-[#3a1224] focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3 block">Account Number</label>
                          <input
                            type="text"
                            {...register('bankAccount')}
                            className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-gray-50 border border-[#3a1224]/10 rounded-lg sm:rounded-xl text-xs sm:text-base text-[#3a1224] focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3 block">Account Holder</label>
                        <input
                          type="text"
                          {...register('accountHolder')}
                          className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-gray-50 border border-[#3a1224]/10 rounded-lg sm:rounded-xl text-xs sm:text-base text-[#3a1224] focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20"
                        />
                      </div>

                      <div className="flex gap-3 sm:gap-4">
                        <button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          className="flex-1 h-10 sm:h-12 bg-[#3a1224] text-white rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest shadow-lg hover:bg-[#3a1224]/90 disabled:opacity-50 transition-all"
                        >
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditMode(prev => ({ ...prev, payment: false }))}
                          className="flex-1 h-10 sm:h-12 bg-gray-200 text-[#3a1224] rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest hover:bg-gray-300 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <motion.div key="notifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-[#3a1224]">Notification Preferences</h2>
                    {!editMode.notifications && (
                      <button
                        onClick={() => setEditMode(prev => ({ ...prev, notifications: true }))}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#C0A04C]/10 text-[#C0A04C] rounded-lg sm:rounded-xl font-black text-[7px] sm:text-[9px] uppercase tracking-widest hover:bg-[#C0A04C]/20 transition-all"
                      >
                        <ChevronRight size={14} className="sm:w-4 sm:h-4" /> Edit
                      </button>
                    )}
                  </div>

                  {!editMode.notifications && (
                    <div className="space-y-4 mb-8">
                      {[
                        { key: 'notificationsEmail', label: 'Email Notifications', desc: 'Receive email updates about your events' },
                        { key: 'notificationsSms', label: 'SMS Notifications', desc: 'Receive SMS alerts for check-ins' },
                        { key: 'notificationsEventUpdates', label: 'Event Updates', desc: 'Get notified about event registrations' },
                      ].map((notif) => (
                        <div key={notif.key} className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-[#3a1224]/5 rounded-lg sm:rounded-2xl">
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full ${formValues[notif.key] ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                            <span className={`text-lg font-bold ${formValues[notif.key] ? 'text-emerald-600' : 'text-gray-400'}`}>
                              {formValues[notif.key] ? '✓' : '-'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-[8px] sm:text-[9px] font-black text-[#3a1224] uppercase tracking-widest">{notif.label}</p>
                            <p className="text-[10px] sm:text-[11px] text-[#3a1224]/60">{notif.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {editMode.notifications && (
                    <form onSubmit={handleSubmit(onSaveNotifications)} className="space-y-5 mb-8">
                      {[
                        { key: 'notificationsEmail', label: 'Email Notifications', desc: 'Receive email updates about your events' },
                        { key: 'notificationsSms', label: 'SMS Notifications', desc: 'Receive SMS alerts for check-ins' },
                        { key: 'notificationsEventUpdates', label: 'Event Updates', desc: 'Get notified about event registrations' },
                      ].map((notif) => (
                        <label key={notif.key} className="flex items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-[#C0A04C]/5 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            {...register(notif.key)}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded accent-[#C0A04C] cursor-pointer mt-0.5 sm:mt-0 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[8xs] sm:text-[9px] font-black uppercase tracking-widest">{notif.label}</p>
                            <p className="text-[10px] sm:text-[11px] text-[#3a1224]/60">{notif.desc}</p>
                          </div>
                        </label>
                      ))}

                      <div className="flex gap-3 sm:gap-4">
                        <button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          className="flex-1 h-10 sm:h-12 bg-[#3a1224] text-white rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest shadow-lg hover:bg-[#3a1224]/90 disabled:opacity-50 transition-all"
                        >
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditMode(prev => ({ ...prev, notifications: false }))}
                          className="flex-1 h-10 sm:h-12 bg-gray-200 text-[#3a1224] rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest hover:bg-gray-300 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
