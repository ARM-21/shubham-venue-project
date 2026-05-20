'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from 'lib/axios';
import { ROUTES } from 'config/routes';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Email is required'); return; }
    setLoading(true);
    try {
      await axiosInstance.post(ROUTES.API.AUTH.FORGOT_PASSWORD, { email });
      setSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <button
          onClick={() => router.push(ROUTES.AUTH.LOGIN)}
          className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#3a1224]/50 hover:text-[#3a1224] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to login
        </button>

        {submitted ? (
          <div className="rounded-3xl border border-[#e8dcc8] bg-white p-10 text-center shadow-lg">
            <CheckCircle className="mx-auto mb-4 h-14 w-14 text-[#C0A04C]" strokeWidth={1.5} />
            <h1 className="text-2xl font-black text-[#3a1224]">Check your inbox</h1>
            <p className="mt-3 text-sm text-[#3a1224]/60">
              If <strong>{email}</strong> is registered, we've sent a reset link. It expires in 1 hour.
            </p>
            <button
              onClick={() => router.push(ROUTES.AUTH.LOGIN)}
              className="mt-8 h-11 w-full rounded-xl bg-[#3a1224] text-[10px] font-black uppercase tracking-widest text-[#C0A04C] transition hover:bg-[#4a172d]"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="rounded-3xl border border-[#e8dcc8] bg-white p-10 shadow-lg">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3a1224]">
              <Mail className="h-6 w-6 text-[#C0A04C]" />
            </div>
            <h1 className="text-2xl font-black text-[#3a1224]">Forgot password?</h1>
            <p className="mt-2 text-sm text-[#3a1224]/60">
              Enter your email and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#3a1224]/60">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#3a1224]/10 bg-[#fdfaf6] px-4 py-3.5 text-sm text-[#3a1224] placeholder-[#3a1224]/30 focus:border-[#C0A04C]/50 focus:outline-none"
                />
                {error && <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-red-600">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-xl bg-[#C0A04C] text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-[#d4b86a] disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
