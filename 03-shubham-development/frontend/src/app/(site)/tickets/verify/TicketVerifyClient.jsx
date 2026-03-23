"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

const decodeBase64Json = (raw) => {
  if (!raw) return null;
  try {
    const normalized = raw.replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalized.length % 4 === 0 ? normalized : `${normalized}${"=".repeat(4 - (normalized.length % 4))}`;
    const jsonString = atob(padding);
    const parsed = JSON.parse(jsonString);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export default function TicketVerifyClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    const dataParam = searchParams.get("data");
    const esewaData = decodeBase64Json(dataParam);
    const transactionUuid = esewaData?.transaction_uuid || searchParams.get("transaction_uuid") || searchParams.get("transactionUuid");
    const pidx = searchParams.get("pidx");

    if (!transactionUuid && !pidx) {
      setStatus("error");
      setError("Missing transaction reference");
      return;
    }

    let isMounted = true;

    const verify = async () => {
      try {
        await axiosInstance.post(ROUTES.API.TICKETS.VERIFY, { transactionUuid, pidx });
        if (!isMounted) return;
        setStatus("success");
        setTimeout(() => router.push(ROUTES.SITE.TICKETS), 2500);
      } catch (err) {
        if (!isMounted) return;
        setStatus("failed");
        setError(err?.response?.data?.message || "Payment verification failed");
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3a1224] via-[#3a1224]/90 to-[#fdfaf6] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Backdrop elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C0A04C]/15 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md">
        {status === "verifying" && (
          <div className="backdrop-blur-md bg-white/95 rounded-3xl border border-white/20 p-8 text-center shadow-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 mb-6 relative">
              <Clock className="w-10 h-10 text-blue-600 animate-spin" />
              <div className="absolute inset-0 rounded-2xl bg-blue-400/10 blur-lg" />
            </div>
            <h2 className="text-3xl font-display font-bold text-[#3a1224] mb-3">Verifying Payment</h2>
            <p className="text-[#3a1224]/70 text-base mb-6">Processing your transaction securely...</p>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 w-full animate-pulse" />
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="backdrop-blur-md bg-gradient-to-br from-emerald-50 via-white to-emerald-50 rounded-3xl border border-emerald-200 p-8 text-center shadow-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 mb-6 relative animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              <div className="absolute inset-0 rounded-2xl bg-emerald-400/20 blur-lg" />
            </div>
            <h2 className="text-3xl font-display font-bold text-emerald-700 mb-2">Payment Confirmed!</h2>
            <p className="text-emerald-600/80 text-base mb-8">Your ticket is now active and ready to use. You're all set for this amazing event!</p>
            <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 font-black uppercase tracking-widest">
              <span>Redirecting soon</span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse delay-100" />
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse delay-200" />
              </div>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="backdrop-blur-md bg-gradient-to-br from-red-50 via-white to-red-50 rounded-3xl border border-red-200 p-8 text-center shadow-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 mb-6 relative">
              <AlertCircle className="w-10 h-10 text-red-600" />
              <div className="absolute inset-0 rounded-2xl bg-red-400/20 blur-lg" />
            </div>
            <h2 className="text-3xl font-display font-bold text-red-700 mb-3">Verification Error</h2>
            <p className="text-red-600/80 text-base mb-8">{error || "Unable to verify your transaction."}</p>
            <button
              onClick={() => router.push(ROUTES.SITE.TICKETS)}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#3a1224] to-[#3a1224]/90 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:shadow-xl active:scale-95 transition-all"
            >
              Back to Tickets
            </button>
          </div>
        )}

        {status === "failed" && (
          <div className="backdrop-blur-md bg-gradient-to-br from-red-50 via-white to-red-50 rounded-3xl border border-red-200 p-8 text-center shadow-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 mb-6 relative">
              <AlertCircle className="w-10 h-10 text-red-600" />
              <div className="absolute inset-0 rounded-2xl bg-red-400/20 blur-lg" />
            </div>
            <h2 className="text-3xl font-display font-bold text-red-700 mb-3">Payment Failed</h2>
            <p className="text-red-600/80 text-base mb-8">{error || "Payment verification failed. Please contact support for assistance."}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push(ROUTES.SITE.TICKETS)}
                className="px-6 py-3 border-2 border-white/40 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/10 active:scale-95 transition-all backdrop-blur-sm"
              >
                My Tickets
              </button>
              <button
                onClick={() => router.push(ROUTES.SITE.EVENTS)}
                className="px-6 py-3 bg-gradient-to-r from-[#C0A04C] to-[#C0A04C]/90 text-[#3a1224] font-black text-[10px] uppercase tracking-widest rounded-2xl hover:shadow-xl active:scale-95 transition-all"
              >
                Browse Events
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
