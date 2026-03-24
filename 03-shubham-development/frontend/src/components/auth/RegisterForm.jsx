"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axiosInstance from 'lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from 'contexts/AuthProvider';
import { useEffect } from 'react';
import EnterOTP from '../otp/EnterOTP';
import Modal from '../ui/Modal';
import { ROUTES } from 'config/routes';

export default function RegisterForm({ onSwitch }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setLoading } = useAuth();
  const password = watch('password', '');
  
  // OTP verification state
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const redirectUrl = searchParams.get('redirect');

  useEffect(()=>{
    console.log(showOTPForm)
  })

  // Step 1: Register and send OTP
  async function onSubmit(data) {
    // setLoading(true);
    try {
      const { confirmPassword, ...payload } = data;
      const promise = axiosInstance.post(ROUTES.API.AUTH.REGISTER, payload);
      
      const response  = await toast.promise(promise, {
        loading: 'Creating your account...',
        success: (r) => r?.data?.message || 'OTP sent to your email!',
        error: (err) => err?.response?.data?.message || 'Registration failed',
      });
      console.log("Registration response:", response);
          if (response?.data?.userId) {
            console.log("Setting userId and showing OTP form");
            setShowOTPForm(true);
            setUserId(response.data.userId);
            setUserEmail(response.data.email);
          }
    } catch (err) {
      console.error("Registration error:", err);
    } finally {
      // setLoading(false);
    }
  }

  //  Verify OTP
  async function handleVerifyOTP(e) {
    e.preventDefault();
    
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    try {
      const promise = axiosInstance.post(ROUTES.API.AUTH.VERIFY_OTP, {
        userId,
        code: otpCode
      });

      const res = await toast.promise(promise, {
        loading: 'Verifying OTP...',
        success: (r) => r?.data?.message || 'Account verified successfully!',
        error: (err) => err?.response?.data?.message || 'Invalid OTP',
      });

      // Set user data and redirect to onboarding
      if (res?.data) {
        setUser(res.data);
        
        // Redirect to onboarding if not already completed
        if (!res.data.hasCompletedOnboarding) {
          router.replace(ROUTES.AUTH.ONBOARDING);
        } else if (redirectUrl) {
          router.replace(redirectUrl);
        } else {
          router.replace('/');
        }
      }
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  }

  // Resend OTP
  async function handleResendOTP() {
    setIsResending(true);
    try {
      const promise = axiosInstance.post(ROUTES.API.AUTH.RESEND_OTP, {
        userId
      });

      await toast.promise(promise, {
        loading: 'Resending OTP...',
        success: (r) => r?.data?.message || 'New OTP sent to your email!',
        error: (err) => err?.response?.data?.message || 'Failed to resend OTP',
      });

      setOtpCode('');
    } catch (err) {
      console.error("Resend error:", err);
    } finally {
      setIsResending(false);
    }
  }


  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="group">
        <label className="block text-[11px] font-bold text-[#3a1224]/70 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-[#C0A04C] transition-colors">Email Address</label>
        <div className="relative">
          <input
            type="email"
            {...register('email', { 
              required: 'Email is required', 
              pattern: { 
                value: /^\S+@\S+$/i, 
                message: 'Enter a valid email' 
              } 
            })}
            className="w-full bg-[#3a1224]/3 border border-[#3a1224]/10 text-[#3a1224] px-5 py-4 rounded-xl focus:outline-none focus:border-[#C0A04C]/50 focus:bg-[#3a1224]/5 transition-all duration-300 placeholder-[#3a1224]/30 text-sm font-medium"
            placeholder="e.g. test@example.com"
          />
        </div>
        {errors.email && (
          <p className="text-red-600 text-[10px] mt-2 ml-1 font-bold uppercase tracking-wider">{errors.email.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="group">
          <label className="block text-[11px] font-bold text-[#3a1224]/70 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-[#C0A04C] transition-colors">Password</label>
          <div className="relative">
            <input
              type="password"
              {...register('password', { 
                required: 'Required', 
                minLength: { 
                  value: 6, 
                  message: 'Min 6' 
                } 
              })}
              className="w-full bg-[#3a1224]/3 border border-[#3a1224]/10 text-[#3a1224] px-5 py-4 rounded-xl focus:outline-none focus:border-[#C0A04C]/50 focus:bg-[#3a1224]/5 transition-all duration-300 placeholder-[#3a1224]/30 text-sm font-medium"
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="text-red-600 text-[10px] mt-2 ml-1 font-bold uppercase tracking-wider">{errors.password.message}</p>
          )}
        </div>

        <div className="group">
          <label className="block text-[11px] font-bold text-[#3a1224]/70 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-[#C0A04C] transition-colors">Confirm</label>
          <div className="relative">
            <input
              type="password"
              {...register('confirmPassword', { 
                required: 'Required', 
                validate: (value) => value === password || 'No match' 
              })}
              className="w-full bg-[#3a1224]/3 border border-[#3a1224]/10 text-[#3a1224] px-5 py-4 rounded-xl focus:outline-none focus:border-[#C0A04C]/50 focus:bg-[#3a1224]/5 transition-all duration-300 placeholder-[#3a1224]/30 text-sm font-medium"
              placeholder="••••••••"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-red-600 text-[10px] mt-2 ml-1 font-bold uppercase tracking-wider">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="relative w-full group overflow-hidden bg-[#C0A04C] hover:bg-[#D4BC7B] text-white py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_-10px_rgba(192,160,76,0.3)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
      >
        <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"></div>
        <span className="relative flex items-center justify-center gap-2">
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : null}
          Create Account
        </span>
      </button>

      <div className="text-center pt-2">
        <span className="text-[#3a1224]/50 text-[11px] font-medium">Already have an account?</span>{' '}
        <button 
          type="button" 
          onClick={() => onSwitch && onSwitch()} 
          className="text-[#C0A04C] text-[11px] font-bold hover:text-[#3a1224] transition-colors cursor-pointer ml-1 uppercase tracking-wider"
        >
          Sign In
        </button>
      </div>
    </form>
    {/* OTP Modal  */}
      <Modal 
        isOpen={showOTPForm}
        onClose={() => {
          setShowOTPForm(false);
          setOtpCode('');
        }}
        closeOnBackdrop={false} 
      >
        <EnterOTP
          userEmail={userEmail}
          otpCode={otpCode}
          setOtpCode={setOtpCode}
          handleVerifyOTP={handleVerifyOTP}
          isVerifying={isVerifying}
          handleResendOTP={handleResendOTP}
          isResending={isResending}
          setShowOTPForm={setShowOTPForm}
          setUserId={setUserId}
        />
      </Modal>

      </>
  );
}
