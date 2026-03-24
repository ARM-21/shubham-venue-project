'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle2, Check, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { FormTextField, FormTextarea, PrimaryButton, SecondaryButton, ActionButtonGroup } from './FormInputs';

export default function StepContactInfo({ data, onUpdate, onNext, onPrev, userEmail }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(data.phoneVerified || false);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: {
      fullName: data.fullName || '',
      phone: data.phone || '',
      email: data.email || userEmail || '',
      address: data.deliveryAddress || '',
      city: data.city || '',
      specialInstructions: data.specialInstructions || '',
      contactPreference: data.contactPreference || 'both',
      saveAsDefault: data.saveAsDefault || false,
    }
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
  }, [data.fullName, data.phone, data.email, data.deliveryAddress, data.city, data.specialInstructions, data.contactPreference, data.saveAsDefault, data.phoneVerified, userEmail, reset]);

  const phoneValue = watch('phone');

  const handleSendOtp = async () => {
    if (!phoneValue || phoneValue.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsVerifying(true);
    try {
      // API call to send OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('OTP sent to your phone');
      setOtpSent(true);
    } catch (error) {
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
      // API call to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Phone verified successfully!');
      setPhoneVerified(true);
      setOtpSent(false);
    } catch (error) {
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

    const contactData = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      deliveryAddress: formData.address,
      city: formData.city,
      specialInstructions: formData.specialInstructions,
      contactPreference: formData.contactPreference,
      saveAsDefault: formData.saveAsDefault,
      phoneVerified: true,
    };

    onUpdate(contactData);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name */}
      <FormTextField
        label="Full Name"
        placeholder="John Doe"
        required
        {...register('fullName', { required: 'Full name is required' })}
        error={errors.fullName?.message}
      />

      {/* Email */}
      <FormTextField
        label="Email"
        type="email"
        placeholder="your@email.com"
        disabled
        required
        {...register('email', { required: 'Email is required' })}
        error={errors.email?.message}
      />
      <p className="text-xs text-slate-500 -mt-4">Auto-filled from your account</p>

      {/* Phone Number with OTP */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-900">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="tel"
              {...register('phone', { required: 'Phone is required', minLength: { value: 10, message: 'Enter valid phone' } })}
              placeholder="9841234567"
              disabled={phoneVerified}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 transition-all placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>
          {!phoneVerified ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isVerifying || !phoneValue || phoneValue.length < 10 || otpSent}
              className="h-12 px-4 bg-[#C0A04C] hover:bg-[#b39041] text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {otpSent ? 'OTP Sent' : 'Send OTP'}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="h-12 px-4 bg-green-50 border border-green-200 text-green-700 rounded-lg font-semibold text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Verified
            </button>
          )}
        </div>
        {errors.phone && (
          <p className="text-sm text-red-500 font-medium">• {errors.phone.message}</p>
        )}
      </div>

      {/* OTP Input */}
      {otpSent && !phoneVerified && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-900">Enter OTP</label>
          <div className="flex gap-3">
            <input
              type="text"
              maxLength="4"
              placeholder="0000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-center text-xl font-bold focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20"
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifying || otp.length !== 4}
              className="h-12 px-4 bg-[#3a1224] hover:bg-[#4a172d] text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      {/* Address */}
      <FormTextarea
        label="Event Address"
        placeholder="Street address, building name, house number..."
        rows={3}
        required
        {...register('address', { required: 'Address is required' })}
        error={errors.address?.message}
      />

      {/* City */}
      <FormTextField
        label="City"
        placeholder="e.g., Kathmandu"
        required
        {...register('city', { required: 'City is required' })}
        error={errors.city?.message}
      />

      {/* Special Instructions */}
      <FormTextarea
        label="Special Instructions"
        placeholder="Parking info, gate codes, special access instructions, allergies, dietary needs..."
        rows={3}
        {...register('specialInstructions')}
        error={errors.specialInstructions?.message}
      />

      {/* Contact Preference */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-900">Preferred Contact Method</label>
        <div className="space-y-2">
          {[
            { value: 'email', label: 'Email' },
            { value: 'sms', label: 'SMS' },
            { value: 'both', label: 'Both Email & SMS' },
          ].map((method) => (
            <label key={method.value} className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                {...register('contactPreference')}
                value={method.value}
                className="w-4 h-4 text-[#C0A04C] border-slate-300 rounded"
              />
              <span className="ml-3 font-medium text-slate-900 text-sm">{method.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Save as Default */}
      <label className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
        <input
          type="checkbox"
          {...register('saveAsDefault')}
          className="w-4 h-4 text-[#C0A04C] border-slate-300 rounded cursor-pointer"
        />
        <span className="font-medium text-slate-900 text-sm">Save this address as my default</span>
      </label>

      {/* Navigation Buttons */}
      <ActionButtonGroup>
        <SecondaryButton onClick={onPrev}>← Back</SecondaryButton>
        <PrimaryButton type="submit" disabled={!phoneVerified}>
          Continue →
        </PrimaryButton>
      </ActionButtonGroup>
    </form>
  );
}
