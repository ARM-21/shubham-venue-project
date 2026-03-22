"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "contexts/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
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

  const redirectUrl = redirect ?? searchParams.get("redirect");

  useEffect(() => {
    if (!loading && user?.isVerified) {
      router.replace(redirectUrl ?? "/");
    }
  }, [loading, user?.isVerified, redirectUrl, router]);

  async function onGoogleLoginSuccess(credentialResponse) {
    try {
      await toast.promise(googleLogin(credentialResponse), {
        loading: "Logging in with Google...",
        success: "Logged in successfully!",
        error: (err) => err?.response?.data?.message || err?.message || "Google login failed",
      });

      if (redirectUrl) {
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
      {/* Background Decorative Elements - Match the image style */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-[#C0A04C]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-[-10%] w-[40%] h-[40%] bg-[#3a1224]/5 blur-[120px] rounded-full" />
      </div>

      {/* Dark Gradient Header background - Match the image */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/95 to-[#fdfaf6] pointer-events-none z-0" />

      <main className="max-w-[1500px] mx-auto px-6 sm:px-12 pt-64 pb-32 relative z-10 flex items-center min-h-[95vh]">
        <div className="flex flex-col lg:flex-row items-center lg:items-start w-full gap-16 lg:gap-32">
          {/* Left Side: Branding / Text Content */}
          <div className="flex-1 w-full lg:mt-6">
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-[2px] bg-[#C0A04C]" />
              <span className="text-[12px] font-black text-[#C0A04C] uppercase tracking-[0.7em]">
                {mode === "login" ? "Registration" : "Registration"}
              </span>
            </div>
            
            <h1 className="text-7xl lg:text-[140px] font-display font-bold text-white mb-12 tracking-tighter leading-[0.8]">
              {mode === "login" ? (
                <>Welcome<br /><span className="text-[#C0A04C] italic font-serif">Back</span></>
              ) : (
                <>Join Our<br /><span className="text-[#C0A04C] italic font-serif">Royal</span><br />Circle</>
              )}
            </h1>

            <p className="text-white/60 text-2xl font-light leading-relaxed max-w-2xl mb-24">
              {mode === "login" 
                ? "Sign in to manage your bookings and explore exclusive venue offers."
                : "Create an account to start planning your extraordinary events and experience world-class hospitality."}
            </p>

            <div className="hidden lg:flex items-end gap-24">
              <div className="space-y-4">
                <div className="text-7xl font-display font-bold text-white tracking-tighter">Premium</div>
                <div className="text-[12px] uppercase tracking-[0.5em] text-[#C0A04C] font-black opacity-90">Experience</div>
              </div>
              <div className="space-y-4">
                <div className="text-7xl font-display font-bold text-white tracking-tighter">Secure</div>
                <div className="text-[12px] uppercase tracking-[0.5em] text-[#C0A04C] font-black opacity-90">Access</div>
              </div>
            </div>
          </div>

          {/* Right Side: Auth Card */}
          <div className="w-full max-w-[500px] lg:mt-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#C0A04C]/20 to-[#3a1224]/20 rounded-[2.5rem] blur-2xl opacity-25"></div>
              
              <div className="relative bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(58,18,36,0.15)] overflow-hidden border border-[#3a1224]/5">
                <div className="p-10 md:p-14 pb-8">
                  {redirectUrl && redirectUrl.includes("/book") && (
                    <div className="mb-8 p-4 bg-[#C0A04C]/5 border border-[#C0A04C]/10 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#C0A04C]/10 flex items-center justify-center text-[#C0A04C]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-[10px] text-[#3a1224]/60 uppercase font-black tracking-widest">Sign in to complete booking</p>
                    </div>
                  )}

                  <div className="space-y-6 mb-12">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-[2.5px] bg-[#C0A04C] rounded-full"></div>
                      <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.5em]">Get Started</span>
                    </div>
                    <h2 className="text-5xl font-display font-bold text-[#3a1224] tracking-tighter">
                      {mode === "login" ? "Account Login" : "New Account"}
                    </h2>
                  </div>

                  <div className="auth-form-container">
                    {mode === "login" ? (
                      <LoginForm onSwitch={() => setMode("register")} redirectUrl={redirectUrl} />
                    ) : (
                      <RegisterForm onSwitch={() => setMode("login")} redirectUrl={redirectUrl} />
                    )}
                  </div>

                  <div className="my-12 flex items-center gap-6">
                    <div className="flex-grow h-[1px] bg-[#3a1224]/10"></div>
                    <span className="text-[#3a1224]/20 text-[11px] uppercase tracking-[0.4em] font-black whitespace-nowrap">Secure Connect</span>
                    <div className="flex-grow h-[1px] bg-[#3a1224]/10"></div>
                  </div>

                  <div className="flex justify-center w-full mb-4">
                    <div className="w-full google-btn-modern">
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

                <div className="bg-[#fdfaf6] p-8 text-center border-t border-[#3a1224]/5">
                  <p className="text-[#3a1224]/40 text-[12px] leading-relaxed font-medium">
                    {mode === "login" ? (
                      <>New to Shubham? <button onClick={() => setMode("register")} className="text-[#C0A04C] font-bold hover:underline">Create an account</button></>
                    ) : (
                      <>By joining, you agree to our{" "}
                      <a href="#" className="text-[#C0A04C] hover:text-[#3a1224] underline underline-offset-4 font-bold transition-colors">Terms</a>
                      {" "}and{" "}
                      <a href="#" className="text-[#C0A04C] hover:text-[#3a1224] underline underline-offset-4 font-bold transition-colors">Privacy</a></>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .google-btn-modern > div {
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
        }
        .google-btn-modern iframe {
          width: 100% !important;
          margin: 0 auto !important;
        }
        /* Custom styles for the forms when inside this modern container */
        .auth-form-container input {
          background-color: #f1f4f9 !important;
          border-color: transparent !important;
          color: #3a1224 !important;
          height: 64px !important;
          border-radius: 16px !important;
          font-size: 16px !important;
          padding: 0 24px !important;
        }
        .auth-form-container input:focus {
          border-color: rgba(192, 160, 76, 0.4) !important;
          background-color: #fff !important;
          box-shadow: 0 0 0 4px rgba(192, 160, 76, 0.1) !important;
        }
        .auth-form-container label {
          font-size: 11px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.15em !important;
          color: rgba(58, 18, 36, 0.4) !important;
          margin-bottom: 12px !important;
        }
        .auth-form-container button[type="submit"] {
          background-color: #C0A04C !important;
          color: white !important;
          height: 64px !important;
          border-radius: 16px !important;
          font-weight: 900 !important;
          letter-spacing: 0.1em !important;
          text-transform: uppercase !important;
          font-size: 14px !important;
          box-shadow: 0 20px 40px -10px rgba(192, 160, 76, 0.4) !important;
          margin-top: 12px !important;
        }
        .auth-form-container .group:focus-within label {
          color: #C0A04C !important;
        }
        .auth-form-container input::placeholder {
          color: rgba(58, 18, 36, 0.2) !important;
        }
      `}</style>
    </div>
  );
}
