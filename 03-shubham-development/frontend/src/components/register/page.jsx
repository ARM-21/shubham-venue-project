"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from 'contexts/AuthProvider';
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export default function page() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Redirect authenticated users away from signup
  useEffect(() => {
    if (!authLoading && user) router.replace(ROUTES.HOME);
  }, [authLoading, user, router]);
  const password = watch("password", "");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const promise = axiosInstance.post(ROUTES.API.AUTH.REGISTER, data);
      const res = await toast.promise(promise, {
        loading: "Creating account…",
        success: (r) => r?.data?.message || "Account created",
        error: (err) => err?.response?.data?.message || "Registration failed",
      });

      router.push(ROUTES.AUTH.LOGIN);
    } catch (err) {
      // error already shown by toast.promise
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-[200px] flex items-center justify-center">Loading...</div>

  return (
    <div className="bg-light-bg min-h-screen flex items-center justify-center p-6">
      <div className="hidden md:flex flex-col items-center mr-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-maroon-primary uppercase tracking-wider">Shubham Party Palace</h1>
          <p className="text-gold-accent italic">Your Perfect Event Starts Here</p>
        </div>
        <Image src="/assets/business-icons/event.svg" alt="event" width={220} height={220} />
      </div>

      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border-t-4 border-gold-accent">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-maroon-primary">Create account</h2>
          <p className="text-sm text-gray-500 mt-1">Join us and book venues with ease</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* <div>
            <label className="block text-sm text-maroon-primary mb-1">Full name</label>
            <input
              {...register("username", { required: "Name is required" })}
              placeholder="John Doe"
              className="w-full px-3 py-2 border rounded focus:outline-none"
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div> */}

          <div>
            <label className="block text-sm text-maroon-primary mb-1">Email</label>
            <input
              {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border rounded focus:outline-none"
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-maroon-primary mb-1">Password</label>
            <input
              type="password"
              {...register("password", { required: "Password required", minLength: { value: 6, message: "Minimum 6 characters" } })}
              placeholder="••••••••"
              className="w-full px-3 py-2 border rounded focus:outline-none"
            />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-maroon-primary mb-1">Confirm password</label>
            <input
              type="password"
              {...register("confirmPassword", { required: "Please confirm", validate: (v) => v === password || "Passwords do not match" })}
              placeholder="••••••••"
              className="w-full px-3 py-2 border rounded focus:outline-none"

            />
            {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6c2645] text-white py-3 rounded-lg font-semibold hover:bg-maroon-hover transition relative"
          >
            {loading && <span className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-t-white rounded-full animate-spin"></span>}
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <a href="/auth" className="text-maroon-primary font-medium hover:underline">Log in</a>
        </div>
      </div>
    </div>
  );
}