"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';

export default function LoginForm({ onSwitch }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, setLoading } = useAuth();
  const router = useRouter();

  async function onSubmit(data) {
    setLoading(true);
    try {
      const promise = login(data);
      await toast.promise(promise, {
        loading: 'Logging in...',
        success: (r) => r?.data?.message || 'Logged in successfully!',
        error: (err) => err?.response?.data?.message || 'Login failed',
      });
      router.push('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 ">Email Address</label>
        <input
          type="email"
          {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Please enter a valid email address' } })}
          className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition duration-300 border-gray-300 focus:border-[#250815] focus:ring-[#250815]/20`}
          placeholder="Enter your email"
        />
        {errors.email && (<p className="text-red-600 text-sm mt-2">{errors.email.message}</p>)}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-gray-700">Password</label>
          <a href="#" className="text-sm text-[#250815] hover:text-[#3a0c23] transition duration-200 font-medium hover:underline" >Forgot password?</a>
        </div>
        <input
          type="password"
          {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
          className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition duration-300 border-gray-300 focus:border-[#250815] focus:ring-[#250815]`}
          placeholder="Enter your password"
        />
        {errors.password && (<p className="text-red-600 text-sm mt-2">{errors.password.message}</p>)}
      </div>

      <button type="submit" className="w-full bg-gradient-to-r from-[#3b0d22] to-[#3e0c25] text-white py-4 px-6 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center">
        Sign In
      </button>

      <div className="mt-1 text-center text-sm text-gray-600">
        Don't have an account? <button type="button" onClick={() => onSwitch && onSwitch()} className="text-[#250815] font-medium hover:underline cursor-pointer">Create account</button>
      </div>
    </form>
  );
}
