"use client"
import Image from 'next/image';
import React from 'react'
import { useForm } from 'react-hook-form';
import axiosInstance from '@/lib/axios';

export default function page() {
    const { register, handleSubmit, formState: { errors } } = useForm()


    const customColors = {
        'maroon-primary': '#8B0000', // Deep Maroon/Burgundy
        'gold-accent': '#C0A04C',    // Muted Gold/Bronze
        'light-bg': '#F8F8F8',       // Off-White/Light Gray
        'maroon-hover': '#A52A2A',   // Slightly Lighter Maroon
    };

    const handleLogin = async (data) => {
        console.log(data)
        const response = await axiosInstance.post("/api/auth/login", data)
        console.log(response.data)

    };

    const handleGoogleLogin = () => {
        // Handle Google sign-in logic here
        console.log('Continue with Google clicked...');
    };

    return (

        <div className={`bg-light-bg flex flex-col md:flex-row justify-center items-center  p-4`}>

            <div>
                Branding goes here
            </div>

            {/* Login Container Card */}
            <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-gold-accent">

                {/* Logo/Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-maroon-primary uppercase tracking-wider mb-1">
                        Shubham Party Palace
                    </h1>
                    <p className="text-gold-accent italic text-sm">Your Perfect Event Starts Here</p>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-light text-gray-700 mb-6 pb-2 border-b border-gray-100 text-center">
                    Member Login
                </h2>



                {/* Login Form */}
                <form onSubmit={handleSubmit(handleLogin)}>

                    <div className="mb-4 text-left">
                        <label htmlFor="username" className="block text-sm font-medium text-maroon-primary mb-2">Email or Username</label>
                        <input
                            id="username"
                            type="text"
                            {...register("username", { required: 'Email is required' })}
                            aria-invalid={errors.username ? 'true' : 'false'}
                            className="w-full ..."
                            placeholder="Enter your email"
                        />
                        {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>}

                    </div>

                    <div className="mb-6 text-left">
                        <label htmlFor="password" className="block text-sm font-medium text-maroon-primary mb-2">Password</label>
                        <input
                            type="password"
                            {...register("password", { required: "password is Required" })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition duration-150"
                            placeholder="Enter your password"
                        />
                        {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}

                    </div>

                    {/* Primary Login Button */}
                    <button
                        type="submit"
                        className="w-full py-3 bg-maroon-primary text-black font-bold rounded-lg uppercase tracking-wider hover:bg-maroon-hover shadow-md hover:shadow-lg transition duration-150"
                    >
                        Log In
                    </button>
                </form>

                {/* Forgot Password Link */}
                <div className="mt-4 text-center text-sm">
                    <a href="#" className="text-gold-accent hover:text-maroon-primary hover:underline transition duration-150">
                        Forgot Password?
                    </a>
                </div>
                {/* Separator */}
                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Continue with Google Button */}
                <button
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center w-full py-3 mb-4 font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150 ease-in-out"
                >
                    {/* Placeholder for Google Icon */}
                    <Image src="/assets/social-media-icons/Google.svg" width={20} height={20} alt="Google icon" />
                    Continue with Google
                </button>

            </div>
        </div>
    )
}
