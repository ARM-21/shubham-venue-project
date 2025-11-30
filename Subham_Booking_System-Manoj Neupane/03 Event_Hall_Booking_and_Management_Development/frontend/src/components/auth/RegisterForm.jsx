"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';

export default function RegisterForm({ onSwitch }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
  const router = useRouter();
  const { setUser, setLoading } = useAuth();
  const password = watch('password', '');

  async function onSubmit(data) {
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = data;
      const promise = axiosInstance.post('/api/v1/auth/register', payload);
      const res = await toast.promise(promise, {
        loading: 'Creating your account...',
        success: (r) => r?.data?.message || 'Account created successfully!',
        error: (err) => err?.response?.data?.message || 'Registration failed',
      });
      if (res?.data?.user) setUser(res.data.user);
      router.push('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
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
          className="w-full bg-[#502538] text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:bg-[#fcfcfc] hover:border-black hover:border-1 cursor-pointer transition-all duration-300 disabled:opacity-50 hover:text-black   disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        ) : null}
        Create Account
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
  );
}