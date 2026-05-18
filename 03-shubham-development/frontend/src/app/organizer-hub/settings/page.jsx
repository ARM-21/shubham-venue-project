'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from 'contexts/AuthProvider';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'lib/axios';
import { Bell, CreditCard, LogOut, Mail, Phone, MapPin, Edit2, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import BreadcrumbNav from 'components/organizer/BreadcrumbNav';
import { ROUTES } from 'config/routes';
import { useQueryOrganizerStatus } from '@queries/organizer/status';
import { useQueryProfileMy } from '@queries/customer/profile-my';

function Field({ label, value, children }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">{label}</p>
      {children || <p className="mt-1 text-sm font-bold text-[#3a1224]">{value || '-'}</p>}
    </div>
  );
}

export default function OrganizerSettings() {
  const { user: authUser, logout, setUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState({ profile: false, payment: false, notifications: false });

  const { data: profileData } = useQueryProfileMy();
  const user = profileData?.user || profileData || authUser;
  const { data: statusData } = useQueryOrganizerStatus({ enabled: !!user });

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
      toast.success('Settings saved');
      setEditMode((prev) => ({ ...prev, [activeTab]: false }));
      const userData = data?.user || data?.profile;
      if (userData) {
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
        setUser?.(userData);
      }
      queryClient.removeQueries({ queryKey: ['profile-my'] });
      await queryClient.refetchQueries({ queryKey: ['profile-my'], stale: true });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to save settings');
    },
  });

  const onSaveAccount = (data) => updateProfileMutation.mutate({
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    city: data.city,
  });

  const onSavePayment = (data) => updateProfileMutation.mutate({
    organizerDetails: {
      taxId: data.taxId,
      bankCode: data.bankCode,
      bankAccount: data.bankAccount,
      accountHolder: data.accountHolder,
    },
  });

  const onSaveNotifications = (data) => updateProfileMutation.mutate({
    organizerDetails: {
      notificationsEmail: data.notificationsEmail,
      notificationsSms: data.notificationsSms,
      notificationsEventUpdates: data.notificationsEventUpdates,
    },
  });

  const handleLogout = async () => {
    try {
      await axiosInstance.post(ROUTES.API.AUTH.LOGOUT);
      await logout();
      queryClient.clear();
      router.push(ROUTES.AUTH.LOGIN);
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to logout');
    }
  };

  const isOrganizerEligible = statusData?.isOrganizerEligible;
  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserRound },
    ...(isOrganizerEligible ? [
      { id: 'payment', label: 'Payouts', icon: CreditCard },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ] : []),
  ];

  useEffect(() => {
    if (!isOrganizerEligible && (activeTab === 'payment' || activeTab === 'notifications')) {
      setActiveTab('profile');
    }
  }, [isOrganizerEligible, activeTab]);

  const formValues = watch();
  const inputClass = 'w-full border border-[#e8dcc8] bg-white px-3 py-2.5 text-sm text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15';

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 pb-10">
      <BreadcrumbNav />

      <header className="border-b border-[#e8dcc8] pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#C0A04C]">Settings</p>
        <h1 className="mt-2 text-2xl font-black text-[#3a1224] sm:text-3xl">Organizer account</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#3a1224]/55">
          Keep your public contact details, payout information, and operational alerts accurate.
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto border-b border-[#e8dcc8] pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex h-10 items-center gap-2 border px-4 text-sm font-bold transition ${
                active ? 'border-[#3a1224] bg-[#3a1224] text-white' : 'border-[#e8dcc8] bg-white text-[#3a1224]/65 hover:bg-[#fbf8f2]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' && (
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="border border-[#e8dcc8] bg-white">
            <div className="flex items-start justify-between gap-4 border-b border-[#e8dcc8] px-5 py-4">
              <div>
                <h2 className="text-base font-black text-[#3a1224]">Profile information</h2>
                <p className="mt-1 text-xs text-[#3a1224]/45">Name and contact details used across organizer tools.</p>
              </div>
              {!editMode.profile && (
                <button onClick={() => setEditMode((prev) => ({ ...prev, profile: true }))} className="inline-flex items-center gap-2 border border-[#e8dcc8] px-3 py-2 text-xs font-bold text-[#3a1224] hover:bg-[#fbf8f2]">
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
              )}
            </div>

            {!editMode.profile ? (
              <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
                <Field label="First name" value={formValues.firstName} />
                <Field label="Last name" value={formValues.lastName} />
                <Field label="Email"><p className="mt-1 flex items-center gap-2 text-sm font-bold text-[#3a1224]"><Mail className="h-4 w-4 text-[#3a1224]/35" />{user?.email}</p></Field>
                <Field label="Phone"><p className="mt-1 flex items-center gap-2 text-sm font-bold text-[#3a1224]"><Phone className="h-4 w-4 text-[#3a1224]/35" />{formValues.phone || '-'}</p></Field>
                <Field label="City"><p className="mt-1 flex items-center gap-2 text-sm font-bold text-[#3a1224]"><MapPin className="h-4 w-4 text-[#3a1224]/35" />{formValues.city || '-'}</p></Field>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSaveAccount)} className="space-y-4 px-5 py-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold text-[#3a1224]">First name<input {...register('firstName', { required: 'First name is required' })} className={`${inputClass} mt-2`} /></label>
                  <label className="text-sm font-bold text-[#3a1224]">Last name<input {...register('lastName', { required: 'Last name is required' })} className={`${inputClass} mt-2`} /></label>
                </div>
                {(errors.firstName || errors.lastName) && <p className="text-sm text-red-600">{errors.firstName?.message || errors.lastName?.message}</p>}
                <label className="block text-sm font-bold text-[#3a1224]">Email<input type="email" value={user?.email || ''} disabled className={`${inputClass} mt-2 bg-[#fbf8f2] text-[#3a1224]/45`} /></label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold text-[#3a1224]">Phone<input type="tel" {...register('phone')} className={`${inputClass} mt-2`} /></label>
                  <label className="text-sm font-bold text-[#3a1224]">City<input {...register('city')} className={`${inputClass} mt-2`} /></label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={updateProfileMutation.isPending} className="bg-[#3a1224] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}</button>
                  <button type="button" onClick={() => { setEditMode((prev) => ({ ...prev, profile: false })); reset(); }} className="border border-[#e8dcc8] px-5 py-2.5 text-sm font-bold text-[#3a1224] hover:bg-[#fbf8f2]">Cancel</button>
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-4">
            <div className="border border-[#e8dcc8] bg-white p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/40">Verification</p>
              <p className="mt-2 text-xl font-black text-[#3a1224]">{isOrganizerEligible ? 'Verified' : 'Pending'}</p>
              <p className="mt-2 text-sm leading-5 text-[#3a1224]/55">{isOrganizerEligible ? 'Your organizer tools are active.' : 'Approval is required before publishing events.'}</p>
            </div>
            <div className="border border-red-200 bg-white p-5">
              <p className="text-sm font-black text-red-700">Session</p>
              <p className="mt-1 text-xs leading-5 text-red-700/70">Use this when you are finished on a shared device.</p>
              <button onClick={handleLogout} className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </aside>
        </section>
      )}

      {activeTab === 'payment' && (
        <section className="border border-[#e8dcc8] bg-white">
          <div className="flex items-start justify-between gap-4 border-b border-[#e8dcc8] px-5 py-4">
            <div><h2 className="text-base font-black text-[#3a1224]">Payout details</h2><p className="mt-1 text-xs text-[#3a1224]/45">Banking information used for settlement.</p></div>
            {!editMode.payment && <button onClick={() => setEditMode((prev) => ({ ...prev, payment: true }))} className="inline-flex items-center gap-2 border border-[#e8dcc8] px-3 py-2 text-xs font-bold text-[#3a1224] hover:bg-[#fbf8f2]"><Edit2 className="h-3.5 w-3.5" /> Edit</button>}
          </div>
          {!editMode.payment ? (
            <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
              <Field label="Tax ID" value={formValues.taxId} />
              <Field label="Bank code" value={formValues.bankCode} />
              <Field label="Account number" value={formValues.bankAccount ? `****${formValues.bankAccount.slice(-4)}` : '-'} />
              <Field label="Account holder" value={formValues.accountHolder} />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSavePayment)} className="space-y-4 px-5 py-5">
              <label className="block text-sm font-bold text-[#3a1224]">Tax ID<input {...register('taxId')} className={`${inputClass} mt-2`} /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-bold text-[#3a1224]">Bank code<input {...register('bankCode')} className={`${inputClass} mt-2`} /></label>
                <label className="text-sm font-bold text-[#3a1224]">Account number<input {...register('bankAccount')} className={`${inputClass} mt-2`} /></label>
              </div>
              <label className="block text-sm font-bold text-[#3a1224]">Account holder<input {...register('accountHolder')} className={`${inputClass} mt-2`} /></label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={updateProfileMutation.isPending} className="bg-[#3a1224] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}</button>
                <button type="button" onClick={() => setEditMode((prev) => ({ ...prev, payment: false }))} className="border border-[#e8dcc8] px-5 py-2.5 text-sm font-bold text-[#3a1224] hover:bg-[#fbf8f2]">Cancel</button>
              </div>
            </form>
          )}
        </section>
      )}

      {activeTab === 'notifications' && (
        <section className="border border-[#e8dcc8] bg-white">
          <div className="flex items-start justify-between gap-4 border-b border-[#e8dcc8] px-5 py-4">
            <div><h2 className="text-base font-black text-[#3a1224]">Notification preferences</h2><p className="mt-1 text-xs text-[#3a1224]/45">Choose which operational updates should reach you.</p></div>
            {!editMode.notifications && <button onClick={() => setEditMode((prev) => ({ ...prev, notifications: true }))} className="inline-flex items-center gap-2 border border-[#e8dcc8] px-3 py-2 text-xs font-bold text-[#3a1224] hover:bg-[#fbf8f2]"><Edit2 className="h-3.5 w-3.5" /> Edit</button>}
          </div>
          <form onSubmit={handleSubmit(onSaveNotifications)} className="divide-y divide-[#e8dcc8]">
            {[
              { key: 'notificationsEmail', label: 'Email notifications', desc: 'Booking updates, event changes, and payout messages.' },
              { key: 'notificationsSms', label: 'SMS notifications', desc: 'Time-sensitive check-in and event-day alerts.' },
              { key: 'notificationsEventUpdates', label: 'Event updates', desc: 'Registration and ticket inventory changes.' },
            ].map((notif) => (
              <label key={notif.key} className="flex items-center justify-between gap-4 px-5 py-4">
                <span>
                  <span className="block text-sm font-bold text-[#3a1224]">{notif.label}</span>
                  <span className="mt-1 block text-xs text-[#3a1224]/45">{notif.desc}</span>
                </span>
                <input type="checkbox" {...register(notif.key)} disabled={!editMode.notifications} className="h-5 w-5 accent-[#3a1224]" />
              </label>
            ))}
            {editMode.notifications && (
              <div className="flex gap-3 px-5 py-4">
                <button type="submit" disabled={updateProfileMutation.isPending} className="bg-[#3a1224] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}</button>
                <button type="button" onClick={() => setEditMode((prev) => ({ ...prev, notifications: false }))} className="border border-[#e8dcc8] px-5 py-2.5 text-sm font-bold text-[#3a1224] hover:bg-[#fbf8f2]">Cancel</button>
              </div>
            )}
          </form>
        </section>
      )}
    </main>
  );
}
