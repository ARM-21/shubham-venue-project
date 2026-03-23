'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StepContactInfo({ data, onUpdate, onNext, onPrev, userEmail }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(data.phoneVerified || false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      fullName: data.fullName || '',
      phone: data.phone || '',
      email: data.email || userEmail || '',
      address: data.address || '',
      city: data.city || '',
      specialInstructions: data.specialInstructions || '',
      contactPreference: data.contactPreference || 'both',
      saveAsDefault: data.saveAsDefault || false,
    }
  });

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
      ...formData,
      phoneVerified: true,
    };

    onUpdate(contactData);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-6 bg-[#C0A04C]"></div>
        <div>
          <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Step 1</p>
          <h2 className="text-2xl font-display font-black text-[#3a1224]">Contact Information</h2>
          <p className="text-sm text-[#3a1224]/60 mt-1">We'll use this to confirm your booking</p>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3">
          Full Name *
        </label>
        <input
          type="text"
          {...register('fullName', { required: 'Full name is required' })}
          placeholder="e.g., John Doe"
          className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl text-[#3a1224] text-sm focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all placeholder:text-[#3a1224]/30"
        />
        {errors.fullName && (
          <p className="text-red-600 text-[10px] font-black mt-2">{errors.fullName.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3">
          Email *
        </label>
        <input
          type="email"
          {...register('email', { required: 'Email is required' })}
          disabled
          placeholder="your@email.com"
          className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl text-[#3a1224] text-sm placeholder:text-[#3a1224]/30 opacity-70 cursor-not-allowed"
        />
        <p className="text-xs text-[#3a1224]/50 mt-2">Auto-filled from your account</p>
      </div>

      {/* Phone Number with OTP */}
      <div>
        <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3">
          Phone Number *
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="tel"
              {...register('phone', { required: 'Phone is required', minLength: { value: 10, message: 'Enter valid phone' } })}
              placeholder="9841234567"
              disabled={phoneVerified}
              className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl text-[#3a1224] text-sm focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all placeholder:text-[#3a1224]/30 disabled:opacity-70"
            />
          </div>
          {!phoneVerified ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isVerifying || !phoneValue || phoneValue.length < 10 || otpSent}
              className="h-12 px-6 bg-[#C0A04C] text-[#3a1224] rounded-xl font-black text-[9px] uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-60"
            >
              {otpSent ? 'OTP Sent' : 'Send OTP'}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="h-12 px-6 bg-green-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest"
            >
              ✓ Verified
            </button>
          )}
        </div>
        {errors.phone && (
          <p className="text-red-600 text-[10px] font-black mt-2">{errors.phone.message}</p>
        )}
      </div>

      {/* OTP Input */}
      {otpSent && !phoneVerified && (
        <div>
          <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3">
            Enter OTP
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              maxLength="4"
              placeholder="0000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="flex-1 px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl text-[#3a1224] text-sm text-center text-2xl font-black focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20"
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifying || otp.length !== 4}
              className="h-12 px-6 bg-[#3a1224] text-[#C0A04C] rounded-xl font-black text-[9px] uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-60"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      {/* Address */}
      <div>
        <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3">
          Delivery Address *
        </label>
        <textarea
          {...register('address', { required: 'Address is required' })}
          rows={3}
          placeholder="Street address, building name, house number..."
          className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl text-[#3a1224] text-sm focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all resize-none placeholder:text-[#3a1224]/30"
        />
        {errors.address && (
          <p className="text-red-600 text-[10px] font-black mt-2">{errors.address.message}</p>
        )}
      </div>

      {/* City */}
      <div>
        <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3">
          City *
        </label>
        <input
          type="text"
          {...register('city', { required: 'City is required' })}
          placeholder="e.g., Kathmandu"
          className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl text-[#3a1224] text-sm focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all placeholder:text-[#3a1224]/30"
        />
        {errors.city && (
          <p className="text-red-600 text-[10px] font-black mt-2">{errors.city.message}</p>
        )}
      </div>

      {/* Special Instructions */}
      <div>
        <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3">
          Special Instructions (Optional)
        </label>
        <textarea
          {...register('specialInstructions')}
          rows={3}
          placeholder="Parking info, gate codes, special access instructions, allergies, dietary needs..."
          className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl text-[#3a1224] text-sm focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all resize-none placeholder:text-[#3a1224]/30"
        />
      </div>

      {/* Contact Preference */}
      <div>
        <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3">
          Preferred Contact Method
        </label>
        <div className="space-y-2">
          {[
            { value: 'email', label: '📧 Email' },
            { value: 'sms', label: '💬 SMS' },
            { value: 'both', label: '📧 Both Email & SMS' },
          ].map((method) => (
            <label key={method.value} className="flex items-center p-3 border border-[#3a1224]/10 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                {...register('contactPreference')}
                value={method.value}
                className="w-4 h-4 text-[#C0A04C] border-[#3a1224]/10 rounded"
              />
              <span className="ml-3 font-black text-sm text-[#3a1224]">{method.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Save as Default */}
      <label className="flex items-center gap-3 p-4 border border-[#3a1224]/10 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
        <input
          type="checkbox"
          {...register('saveAsDefault')}
          className="w-5 h-5 text-[#C0A04C] border-[#3a1224]/10 rounded cursor-pointer"
        />
        <span className="font-black text-sm text-[#3a1224]">Save this address as my default</span>
      </label>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 h-12 px-6 border border-[#3a1224]/10 text-[#3a1224] font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={!phoneVerified}
          className="flex-1 h-12 px-6 bg-[#3a1224] text-[#C0A04C] font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-[#4a172d] transition-colors shadow-lg cursor-pointer disabled:opacity-60"
        >
          Continue →
        </button>
      </div>
    </form>
  );
}
