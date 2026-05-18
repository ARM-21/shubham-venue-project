'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { FormTextField, FormTextarea, inputCls } from './FormInputs';

export default function StepContactInfo({ data, onUpdate, onNext, onPrev, userEmail }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(data.phoneVerified || false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      fullName: data.fullName || '',
      phone: data.phone || '',
      email: data.email || userEmail || '',
      address: data.deliveryAddress || '',
      city: data.city || '',
      specialInstructions: data.specialInstructions || '',
      contactPreference: data.contactPreference || 'both',
      saveAsDefault: data.saveAsDefault || false,
    },
  });

  useEffect(() => {
    reset({
      fullName: data.fullName || '',
      phone: data.phone || '',
      email: data.email || userEmail || '',
      address: data.deliveryAddress || '',
      city: data.city || '',
      specialInstructions: data.specialInstructions || '',
      contactPreference: data.contactPreference || 'both',
      saveAsDefault: data.saveAsDefault || false,
    });
  }, [
    data.fullName, data.phone, data.email, data.deliveryAddress, data.city,
    data.specialInstructions, data.contactPreference, data.saveAsDefault,
    data.phoneVerified, userEmail, reset,
  ]);

  const phoneValue = watch('phone');

  const handleSendOtp = async () => {
    if (!phoneValue || phoneValue.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setIsVerifying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('OTP sent to your phone');
      setOtpSent(true);
    } catch {
      toast.error('Failed to send OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 4) {
      toast.error('Please enter a valid 4-digit OTP');
      return;
    }
    setIsVerifying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Phone verified successfully');
      setPhoneVerified(true);
      setOtpSent(false);
    } catch {
      toast.error('Invalid OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const onSubmit = (formData) => {
    if (!phoneVerified) {
      toast.error('Please verify your phone number');
      return;
    }
    onUpdate({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      deliveryAddress: formData.address,
      city: formData.city,
      specialInstructions: formData.specialInstructions,
      contactPreference: formData.contactPreference,
      saveAsDefault: formData.saveAsDefault,
      phoneVerified: true,
    });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Full name */}
      <FormTextField
        label="Full name"
        placeholder="Your full name"
        required
        {...register('fullName', { required: 'Full name is required' })}
        error={errors.fullName?.message}
      />

      {/* Email — read-only */}
      <FormTextField
        label="Email address"
        type="email"
        placeholder="your@email.com"
        disabled
        required
        hint="Auto-filled from your account"
        {...register('email', { required: 'Email is required' })}
        error={errors.email?.message}
      />

      {/* Phone + OTP */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/50">
          Phone number <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="tel"
            {...register('phone', {
              required: 'Phone is required',
              minLength: { value: 10, message: 'Enter a valid phone number' },
            })}
            placeholder="9841234567"
            disabled={phoneVerified}
            className={`min-w-0 flex-1 ${inputCls}`}
          />
          {!phoneVerified ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isVerifying || !phoneValue || phoneValue.length < 10 || otpSent}
              className="h-[46px] shrink-0 rounded-2xl bg-[#3a1224] px-4 text-[11px] font-black uppercase tracking-[0.15em] text-[#C0A04C] transition hover:bg-[#4a172d] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {otpSent ? 'Sent' : 'Send OTP'}
            </button>
          ) : (
            <div className="flex h-[46px] shrink-0 items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Verified
            </div>
          )}
        </div>
        {errors.phone && (
          <p className="text-xs font-bold text-red-600">• {errors.phone.message}</p>
        )}
      </div>

      {/* OTP entry */}
      {otpSent && !phoneVerified && (
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/50">
            Enter OTP
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength="4"
              placeholder="0000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="flex-1 bg-[#fbf8f2] border border-[#e8dcc8] rounded-2xl px-4 py-3 text-center text-xl font-black tracking-[0.3em] text-[#3a1224] focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifying || otp.length !== 4}
              className="h-[46px] shrink-0 rounded-2xl bg-[#3a1224] px-5 text-[11px] font-black uppercase tracking-[0.15em] text-[#C0A04C] transition hover:bg-[#4a172d] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      {/* Address */}
      <FormTextarea
        label="Event address"
        placeholder="Street address, building name, area..."
        rows={3}
        required
        {...register('address', { required: 'Address is required' })}
        error={errors.address?.message}
      />

      {/* City */}
      <FormTextField
        label="City"
        placeholder="e.g. Kathmandu"
        required
        {...register('city', { required: 'City is required' })}
        error={errors.city?.message}
      />

      {/* Special instructions */}
      <FormTextarea
        label="Special instructions"
        hint="Optional — parking, access codes, dietary needs, anything the team should know"
        placeholder="Any notes for the venue team..."
        rows={3}
        {...register('specialInstructions')}
        error={errors.specialInstructions?.message}
      />

      {/* Contact preference */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/50">
          Preferred contact method
        </label>
        <div className="space-y-1.5">
          {[
            { value: 'email', label: 'Email only' },
            { value: 'sms', label: 'SMS only' },
            { value: 'both', label: 'Both email & SMS' },
          ].map((method) => (
            <label
              key={method.value}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#e8dcc8] px-4 py-2.5 transition hover:bg-[#fbf8f2]"
            >
              <input
                type="radio"
                {...register('contactPreference')}
                value={method.value}
                className="h-4 w-4 accent-[#C0A04C]"
              />
              <span className="text-sm font-medium text-[#3a1224]">{method.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Save as default */}
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#e8dcc8] px-4 py-3 transition hover:bg-[#fbf8f2]">
        <input
          type="checkbox"
          {...register('saveAsDefault')}
          className="h-4 w-4 accent-[#C0A04C] cursor-pointer"
        />
        <span className="text-sm font-medium text-[#3a1224]">
          Save this address as my default
        </span>
      </label>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="flex h-11 flex-1 items-center justify-center rounded-2xl border border-[#e8dcc8] bg-white text-[11px] font-black uppercase tracking-[0.18em] text-[#3a1224] transition hover:bg-[#f8f4ed]"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!phoneVerified}
          className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#3a1224] text-[11px] font-black uppercase tracking-[0.18em] text-[#C0A04C] transition hover:bg-[#4a172d] disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
