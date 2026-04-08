"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "contexts/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "config/routes";
import BrandingSection from "components/branding/Branding.jsx";
import LoginForm from "components/auth/LoginForm";
import RegisterForm from "components/auth/RegisterForm";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

export default function AuthPageClient({ redirect }) {
  const { loading, setLoading, user, googleLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState("login");

  // Get redirect URL from query params (check both 'redirect' and 'callbackUrl')
  const redirectUrl = redirect ?? searchParams.get("redirect") ?? searchParams.get("callbackUrl");

  useEffect(() => {
    if (!loading && user?.isVerified) {
      // Check if user needs to complete onboarding
      if (!user?.hasCompletedOnboarding) {
        router.replace(ROUTES.AUTH.ONBOARDING);
      } else {
        router.replace(redirectUrl ?? "/");
      }
    }
  }, [loading, user?.isVerified, user?.hasCompletedOnboarding, redirectUrl, router]);

  async function onGoogleLoginSuccess(credentialResponse) {
    try {
      const result = await googleLogin(credentialResponse);
      const userData = result?.data?.user || result?.data;
      
      await toast.promise(Promise.resolve(result), {
        loading: "Logging in with Google...",
        success: "Logged in successfully!",
        error: (err) => err?.response?.data?.message || err?.message || "Google login failed",
      });

      // Check if user needs to complete onboarding
      if (!userData?.hasCompletedOnboarding) {
        router.push(ROUTES.AUTH.ONBOARDING);
      } else if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3a1224] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#3a1224]/70 font-display font-bold uppercase tracking-widest text-xs">Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fdfaf6] relative selection:bg-[#C0A04C]/30 overflow-hidden">
      {/* Dark Gradient Header background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/95 to-[black] pointer-events-none z-0" />

      <main className="max-w-7xl mx-auto px-6 sm:px-8 pt-40 pb-12 relative z-10">
        <header className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-[1px] bg-[#C0A04C]" />
            <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">
              {mode === "login" ? "Returning" : "Register"}
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-8">
            <div>
              <h1 className="text-6xl lg:text-8xl font-display font-bold text-white mb-6 leading-[0.9]">
                {mode === "login" ? (
                  <>Welcome <span className="text-[#C0A04C] italic font-serif">Back</span></>
                ) : (
                  <>Join Our <span className="text-[#C0A04C] italic font-serif">Circle</span></>
                )}
              </h1>
              <p className="text-white/60 text-lg font-light leading-relaxed max-w-2xl">
                {mode === "login" 
                  ? "Access your account to manage bookings and explore exclusive venue offers."
                  : "Create your account to start planning extraordinary events with world-class hospitality."}
              </p>
            </div>
          </div>
        </header>
      </main>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-[#3a1224]/5 p-10 md:p-14">
            {redirectUrl && redirectUrl.includes("/book") && (
              <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-emerald-700 font-bold">Complete your booking by signing in</p>
              </div>
            )}

            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-[1px] bg-[#C0A04C]" />
              <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.3em]">
                {mode === "login" ? "Sign In" : "Create Account"}
              </span>
            </div>

            <h2 className="text-4xl font-display font-bold text-[#3a1224] mb-8 tracking-tight">
              {mode === "login" ? "Account Login" : "New Account"}
            </h2>

            <div className="auth-form-container space-y-5">
              {mode === "login" ? (
                <LoginForm onSwitch={() => setMode("register")} redirectUrl={redirectUrl} />
              ) : (
                <RegisterForm onSwitch={() => setMode("login")} redirectUrl={redirectUrl} />
              )}
            </div>

            <div className="my-10 flex items-center gap-6">
              <div className="flex-grow h-[1px] bg-[#3a1224]/30"></div>
              <span className="text-[#3a1224]/30 text-[10px] tracking-[0.2em] font-black whitespace-nowrap uppercase">or</span>
              <div className="flex-grow h-[1px] bg-[#3a1224]/30"></div>
            </div>

            <div className="mb-8 flex justify-center items-center">
              <div className="google-btn-modern mx-auto">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (!credentialResponse?.credential) {
                      toast.error("Google token not received");
                      return;
                    }
                    onGoogleLoginSuccess(credentialResponse);
                  }}
                  onError={() => {
                    toast.error("Google Sign In failed");
                  }}
                  ux_mode="popup"
                  shape="pill"
                  text="continue_with"
                  logo_alignment="center"
                  theme="outline"
                  size="large"
                  width="100%"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
