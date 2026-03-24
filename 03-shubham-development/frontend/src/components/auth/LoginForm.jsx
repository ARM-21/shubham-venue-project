"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation'; 
import { useAuth } from 'contexts/AuthProvider';
import { ROUTES } from 'config/routes';

export default function LoginForm({ onSwitch }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login, setLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams(); //  Get query params
  
  // Get redirect URL from query params
  const redirectUrl = searchParams.get('redirect');

  async function onSubmit(data) {
    setLoading(true);
    try {
      const promise = login(data);
      const res = await toast.promise(promise, {
        loading: 'Logging in...',
        success: (r) => r?.data?.message || 'Logged in successfully!',
        error: (err) => err?.response?.data?.message || err?.message || 'Login failed',
      });

      const loggedInUser = res?.data?.user ?? res?.data ?? null;

      // Check if user needs to complete onboarding
      if (!loggedInUser?.hasCompletedOnboarding) {
        router.push(ROUTES.AUTH.ONBOARDING);
      } else if (redirectUrl) {
        router.push(redirectUrl);
      } else if (loggedInUser?.role?.toLowerCase?.() === 'admin') {
        router.push(ROUTES.ADMIN.DASHBOARD);
      } else {
        router.push(ROUTES.HOME);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
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

      <div className="group">
        <div className="flex items-center justify-between mb-3 ml-1">
          <label className="block text-[11px] font-bold text-[#3a1224]/80 uppercase tracking-widest group-focus-within:text-[#C0A04C] transition-colors">Password</label>
          <a href="#" className="text-[10px] text-[#C0A04C]/60 hover:text-[#C0A04C] underline transition-colors duration-200 uppercase tracking-widest font-bold">
            Forgot?
          </a>
        </div>
        <div className="relative">
          <input
            type="password"
            {...register('password', { 
              required: 'Password is required', 
              minLength: { 
                value: 6, 
                message: 'Min 6 characters' 
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
          Sign In
        </span>
      </button>

      <div className="text-center pt-2">
        <span className="text-[#3a1224]/50 text-[11px] font-medium">New to Shubham?</span>{' '}
        <button 
          type="button" 
          onClick={() => onSwitch && onSwitch()} 
          className="text-[#C0A04C] text-[11px] underline font-bold hover:text-[#3a1224] transition-colors cursor-pointer ml-1 uppercase tracking-wider"
        >
          Create Account
        </button>
      </div>
    </form>
  );
}
