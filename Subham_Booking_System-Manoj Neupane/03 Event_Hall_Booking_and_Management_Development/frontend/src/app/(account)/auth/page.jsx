"use client"
import Image from 'next/image';
import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthProvider';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import dynamic from 'next/dynamic';
import BrandingSection from "@/components/branding/page.jsx"
// dynamic import to avoid server-side rendering issues with client components
const LoginForm = dynamic(() => import('@/components/auth/LoginForm.jsx'), { ssr: false });
const RegisterForm = dynamic(() => import('@/components/auth/RegisterForm.jsx'), { ssr: false });

export default function AuthPage() {
    const { login, logout, loading, setLoading, user, setUser } = useAuth();
    const router = useRouter()
    const [mode, setMode] = useState('login')

    useEffect(() => {
        if (!loading && user) {
            router.replace('/');
        }
    }, [loading, user, router]);



    const handleGoogleLogin = () => {
        console.log('Continue with Google clicked...');
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-[#250815] to-[#3a0c23] flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white font-semibold">Loading...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#250815] to-[#3a0c23] flex flex-col lg:flex-row items-center justify-center p-4 md:p-8">

            {/* Left Side - Branding Section */}
            <BrandingSection />
            {/* Right Side - Auth Card */}
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                    {/* Card Header with Gradient */}
                    <div className="bg-gradient-to-r from-[#250815] to-[#3a0c23] p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#d4af37]/10"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-white mb-2">
                                {mode === 'login' ? 'Welcome Back' : 'Join Our Family'}
                            </h2>
                            <p className="text-[#d4af37] font-light">
                                {mode === 'login' ? 'Sign in to your account' : 'Create your account to get started'}
                            </p>
                        </div>
                    </div>

                    <div className="p-8">

                        {/* Login/Register Components */}
                        {mode === 'login' ? (
                            <LoginForm onSwitch={() => setMode('register')} />
                        ) : (
                            <RegisterForm onSwitch={() => setMode('login')} />
                        )}

                        {/* Divider */}
                        <div className="my-8 flex items-center">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="flex-shrink mx-4 text-gray-500 text-sm font-medium">Or continue with</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>

                        {/* Google Sign In */}
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-4 py-4 px-6 border-2 border-gray-300 rounded-xl hover:border-[#250815] hover:bg-gray-50 transition duration-300 font-semibold text-gray-700 group"
                        >
                            <Image
                                src="/assets/social-media-icons/Google.svg"
                                width={24}
                                height={24}
                                alt="Google"
                                className="w-6 h-6 group-hover:scale-110 transition-transform"
                            />
                            Continue with Google
                        </button>

                        {/* Terms Notice for Register */}
                        {mode === 'register' && (
                            <p className="text-center text-gray-500 text-sm mt-6">
                                By creating an account, you agree to our{' '}
                                <a href="#" className="text-[#250815] hover:text-[#3a0c23] font-medium underline">Terms of Service</a>{' '}
                                and{' '}
                                <a href="#" className="text-[#250815] hover:text-[#3a0c23] font-medium underline">Privacy Policy</a>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}