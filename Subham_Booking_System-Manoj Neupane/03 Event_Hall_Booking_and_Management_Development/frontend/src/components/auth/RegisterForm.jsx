"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axiosInstance from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';
import { useEffect } from 'react';
import EnterOTP from '../otp/EnterOTP';
import Modal from '../ui/Modal';

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
      const promise = axiosInstance.post('/api/v1/auth/register', payload);
      
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
      const promise = axiosInstance.post('/api/v1/auth/verify-otp', {
        userId,
        code: otpCode
      });

      const res = await toast.promise(promise, {
        loading: 'Verifying OTP...',
        success: (r) => r?.data?.message || 'Account verified successfully!',
        error: (err) => err?.response?.data?.message || 'Invalid OTP',
      });

      // Set user data and redirect
      if (res?.data) {
        setUser(res.data);
        
        // Redirect after successful verification
        if (redirectUrl) {
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
      const promise = axiosInstance.post('/api/v1/auth/resend-otp', {
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
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
        <input
          type="email"
          {...register('email', { 
            required: 'Email is required', 
            pattern: { 
              value: /^\S+@\S+$/i, 
              message: 'Please enter a valid email address' 
            } 
          })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#250815] focus:ring-2 focus:ring-[#250815]/20 transition-all duration-300 placeholder-gray-400"
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-2 font-medium">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
        <input
          type="password"
          {...register('password', { 
            required: 'Password is required', 
            minLength: { 
              value: 6, 
              message: 'Password must be at least 6 characters' 
            } 
          })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#250815] focus:ring-2 focus:ring-[#250815]/20 transition-all duration-300 placeholder-gray-400"
          placeholder="Enter your password"
        />
        {errors.password && (
          <p className="text-red-600 text-sm mt-2 font-medium">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
        <input
          type="password"
          {...register('confirmPassword', { 
            required: 'Please confirm your password', 
            validate: (value) => value === password || 'Passwords do not match' 
          })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#250815] focus:ring-2 focus:ring-[#250815]/20 transition-all duration-300 placeholder-gray-400"
          placeholder="Confirm your password"
        />
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm mt-2 font-medium">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-[#502538] text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:bg-[#3a0c23] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Creating Account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      <div className="text-center text-sm text-gray-600 pt-2">
        Already have an account?{' '}
        <button 
          type="button" 
          onClick={() => onSwitch && onSwitch()} 
          className="text-[#502538] font-semibold hover:text-[#3a0c23] hover:underline transition-colors cursor-pointer"
        >
          Sign in
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
