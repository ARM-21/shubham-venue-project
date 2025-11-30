"use client"
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthProvider';
import { useRouter } from 'next/navigation';
import BrandingSection from "@/components/branding/Branding.jsx"
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

export default function AuthPage() {
    const { login, logout, loading, setLoading, user, setUser, googleLogin } = useAuth();
    const router = useRouter()
    const [mode, setMode] = useState('login')

    useEffect(() => {
        if (!loading && user) {
            router.replace('/');
        }
    }, [loading, user, router]);

    async function onGoogleLoginSuccess(credentialResponse) {
        try {
            toast.promise(
                googleLogin(credentialResponse),
                {
                    loading: "Logging in with Google...",
                    success: "Logged in successfully!",
                    error: "Google login failed"
                }
            );
            router.push('/');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#250815] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-700 font-semibold">Loading...</p>
            </div>
        </div>
    )

    return (
        <div className="h-[85vh] bg-white flex flex-col-reverse lg:flex-row items-center justify-center p-4 md:p-6">
            {/* Left Side - Branding Section */}
            <BrandingSection />
            
            {/* Right Side - Auth Card */}
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    {/* Card Header */}
                    <div className="bg-white p-8 text-center border-b border-gray-100">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-[#502538] mb-2">
                                {mode === 'login' ? 'Welcome Back' : 'Join Our Family'}
                            </h2>
                            <p className="text-gray-600 font-light">
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
                        <div className="my-6 flex items-center">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="flex-shrink mx-4 text-gray-500 text-sm font-medium">Or continue with</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>

                        {/* Google Sign In */}
                        <div className='flex justify-center w-full'>
                            <GoogleLogin
                                onSuccess={credentialResponse => {
                                    onGoogleLoginSuccess(credentialResponse);
                                }}
                                onError={(err) => {
                                    toast.error("Google Sign In failed", err);
                                }}
                                shape='pill'
                                text='continue_with'
                                logo_alignment='center'
                                theme='outline'
                                size='large'
                            />
                        </div>

                        {/* Terms Notice for Register */}
                        {mode === 'register' && (
                            <p className="text-center text-gray-500 text-xs mt-6 leading-relaxed">
                                By creating an account, you agree to our{' '}
                                <a href="#" className="text-[#502538] hover:text-[#3a0c23] font-medium underline transition-colors">Terms of Service</a>{' '}
                                and{' '}
                                <a href="#" className="text-[#502538]    hover:text-[#3a0c23] font-medium underline transition-colors">Privacy Policy</a>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}