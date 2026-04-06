"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "lib/axios";

export default function PaymentVerifyClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const transactionUuid = searchParams.get("transaction_uuid");
    if (!transactionUuid) {
      setStatus("error");
      return;
    }

    let isMounted = true;

    const verify = async () => {
      try {
        await axiosInstance.post("/api/v1/payments/verify", { transactionUuid });
        if (!isMounted) return;
        
        // Invalidate bookings query cache to force fresh data on return
        queryClient.invalidateQueries({ queryKey: ["bookings-my"] });
        queryClient.invalidateQueries({ queryKey: ["customer-bookings"] });
        
        setStatus("success");
        // Wait 3 seconds to ensure backend has time to update, then redirect
        setTimeout(() => router.push("/bookings"), 3000);
      } catch (err) {
        if (!isMounted) return;
        console.error("Payment verification error:", err);
        setStatus("failed");
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [searchParams, router, queryClient]);

  if (status === "verifying") return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C0A04C]"></div>
        <p className="text-[#3a1224] font-medium">Verifying payment...</p>
      </div>
    </div>
  );

  if (status === "success") return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-emerald-600 font-semibold">Payment successful!</p>
        <p className="text-[#3a1224]/60 text-sm">Redirecting to your bookings...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-red-600 font-semibold">Payment verification failed</p>
        <p className="text-[#3a1224]/60 text-sm">Please contact support</p>
      </div>
    </div>
  );
}
