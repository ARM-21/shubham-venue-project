"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation'; 
import { useAuth } from '@/contexts/AuthProvider';
import { ROUTES } from '@/config/routes';

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

      // Redirect to saved URL first, otherwise admins go to dashboard, others go home
      if (redirectUrl) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">Password</label>
          <a href="#" className="text-sm text-[#502538] hover:text-[#3a0c23] transition-colors duration-200 font-medium hover:underline">
            Forgot password?
          </a>
        </div>
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

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-[#502538] text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:bg-[#fdfdfd] hover:text-black hover:border-1 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        ) : null}
        Sign In
      </button>

      <div className="text-center text-sm text-gray-600 pt-2">
        Don't have an account?{' '}
        <button 
          type="button" 
          onClick={() => onSwitch && onSwitch()} 
          className="text-[#502538] font-semibold hover:text-[#3a0c23] hover:underline transition-colors cursor-pointer"
        >
          Create account
        </button>
      </div>
    </form>
  );
}
