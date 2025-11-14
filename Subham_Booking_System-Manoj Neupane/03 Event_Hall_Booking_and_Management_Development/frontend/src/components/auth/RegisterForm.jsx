"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';

export default function RegisterForm({ onSwitch }) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
          placeholder="you@example.com"
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition duration-200 ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-[#250815] focus:ring-[#250815]/20'}`}
        />
        {errors.email && (<p className="text-sm text-red-600 mt-1">{errors.email.message}</p>)}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input
          type="password"
          {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
          placeholder="••••••••"
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition duration-200 ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-[#250815] focus:ring-[#250815]/20'}`}
        />
        {errors.password && (<p className="text-sm text-red-600 mt-1">{errors.password.message}</p>)}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
        <input
          type="password"
          {...register('confirmPassword', { required: 'Please confirm', validate: (v) => v === password || 'Passwords do not match' })}
          placeholder="••••••••"
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition duration-200 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-[#250815] focus:ring-[#250815]/20'}`}
        />
        {errors.confirmPassword && (<p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>)}
      </div>

      <button type="submit" className="w-full bg-gradient-to-r from-[#250815] to-[#3a0c23] text-white py-3 rounded-xl font-semibold hover:from-[#3a0c23] hover:to-[#250815] transition-shadow shadow-sm">
        Create account
      </button>

      <div className="mt-4 text-center text-sm text-gray-600">
        Already have an account? <button type="button" onClick={() => onSwitch && onSwitch()} className="text-[#250815] font-medium hover:underline">Sign in</button>
      </div>
    </form>
  );
}
