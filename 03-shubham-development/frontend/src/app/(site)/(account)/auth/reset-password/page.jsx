'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axiosInstance from 'lib/axios';
import { ROUTES } from 'config/routes';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fdfaf6]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters'); return;
    }
    if (password !== confirm) {
      setError('Passwords do not match'); return;
    }
    if (!token) {
      setError('Reset token is missing. Please use the link from your email.'); return;
    }
    setLoading(true);
    try {
      await axiosInstance.post(ROUTES.API.AUTH.RESET_PASSWORD, { token, password });
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-10 text-center shadow-lg">
          <AlertCircle className="mx-auto mb-4 h-14 w-14 text-red-400" strokeWidth={1.5} />
          <h1 className="text-xl font-black text-[#3a1224]">Invalid reset link</h1>
          <p className="mt-2 text-sm text-[#3a1224]/60">Please use the link from your email.</p>
          <button onClick={() => router.push(ROUTES.AUTH.FORGOT_PASSWORD)}
            className="mt-6 h-11 w-full rounded-xl bg-[#3a1224] text-[10px] font-black uppercase tracking-widest text-[#C0A04C] transition hover:bg-[#4a172d]">
            Request new link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {done ? (
          <div className="rounded-3xl border border-[#e8dcc8] bg-white p-10 text-center shadow-lg">
            <CheckCircle className="mx-auto mb-4 h-14 w-14 text-[#C0A04C]" strokeWidth={1.5} />
            <h1 className="text-2xl font-black text-[#3a1224]">Password updated!</h1>
            <p className="mt-3 text-sm text-[#3a1224]/60">You can now log in with your new password.</p>
            <button onClick={() => router.push(ROUTES.AUTH.LOGIN)}
              className="mt-8 h-11 w-full rounded-xl bg-[#3a1224] text-[10px] font-black uppercase tracking-widest text-[#C0A04C] transition hover:bg-[#4a172d]">
              Go to Login
            </button>
          </div>
        ) : (
          <div className="rounded-3xl border border-[#e8dcc8] bg-white p-10 shadow-lg">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3a1224]">
              <Lock className="h-6 w-6 text-[#C0A04C]" />
            </div>
            <h1 className="text-2xl font-black text-[#3a1224]">Set new password</h1>
            <p className="mt-2 text-sm text-[#3a1224]/60">Must be at least 8 characters.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#3a1224]/60">New password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className="w-full rounded-xl border border-[#3a1224]/10 bg-[#fdfaf6] px-4 py-3.5 text-sm text-[#3a1224] placeholder-[#3a1224]/30 focus:border-[#C0A04C]/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#3a1224]/60">Confirm password</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••" className="w-full rounded-xl border border-[#3a1224]/10 bg-[#fdfaf6] px-4 py-3.5 text-sm text-[#3a1224] placeholder-[#3a1224]/30 focus:border-[#C0A04C]/50 focus:outline-none" />
              </div>

              {error && <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">{error}</p>}

              <button type="submit" disabled={loading}
                className="h-11 w-full rounded-xl bg-[#C0A04C] text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-[#d4b86a] disabled:opacity-50">
                {loading ? 'Updating…' : 'Reset Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
