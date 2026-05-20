"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

function normalizeCallbackParams(searchParams) {
  let transactionUuid = searchParams.get("transaction_uuid") || searchParams.get("transactionUuid");
  const pidx = searchParams.get("pidx");
  const bookingId = searchParams.get("purchase_order_id") || searchParams.get("purchaseOrderId");
  let esewaData = searchParams.get("data");

  // Some eSewa callbacks can arrive as:
  // /payment/verify?transaction_uuid=<uuid>?data=<base64>
  // Treat that malformed legacy URL as if it used &data=.
  if (transactionUuid && !esewaData) {
    const dataMarker = transactionUuid.indexOf("?data=");
    if (dataMarker !== -1) {
      esewaData = transactionUuid.slice(dataMarker + "?data=".length);
      transactionUuid = transactionUuid.slice(0, dataMarker);
    }
  }

  return { transactionUuid, pidx, bookingId, esewaData };
}

export default function PaymentVerifyClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("verifying");
  const [bookingId, setBookingId] = useState(null);
  const [isOrganizerBooking, setIsOrganizerBooking] = useState(false);

  useEffect(() => {
    const { transactionUuid, pidx, bookingId, esewaData } = normalizeCallbackParams(searchParams);
    if (!transactionUuid && !pidx && !bookingId && !esewaData) {
      setStatus("error");
      return;
    }

    let isMounted = true;

    const verify = async () => {
      try {
        const res = await axiosInstance.post("/api/v1/payments/verify", {
          ...(transactionUuid && { transactionUuid }),
          ...(pidx && { pidx }),
          ...(bookingId && { bookingId }),
          ...(esewaData && { data: esewaData }),
        });
        if (!isMounted) return;

        queryClient.invalidateQueries({ queryKey: ["bookings-my"] });
        queryClient.invalidateQueries({ queryKey: ["customer-bookings"] });

        const payment = res.data?.payment;
        const bid = payment?.bookingId;

        if (bid) {
          setBookingId(bid);
          try {
            const bookingRes = await axiosInstance.get(`${ROUTES.API.BOOKINGS.ROOT}/${bid}`);
            if (isMounted && bookingRes.data?.booking?.bookingPurpose === "organizer") {
              setIsOrganizerBooking(true);
            }
          } catch {
            // non-critical — fall back to customer success view
          }
        }

        if (isMounted) setStatus("success");
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

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C0A04C]"></div>
          <p className="text-[#3a1224] font-medium">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (status === "success" && isOrganizerBooking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6] px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-[#3a1224] mb-2">Payment received!</h1>
          <p className="text-[#3a1224]/60 text-sm mb-8 leading-relaxed">
            Your booking is now awaiting admin approval. You can create the public event page after the booking is approved.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push(ROUTES.SITE.BOOKINGS)}
              className="w-full h-12 rounded-2xl bg-[#3a1224] text-[#C0A04C] text-xs font-black uppercase tracking-widest hover:bg-[#4a172d] transition-colors"
            >
              View Booking Status
            </button>
            <button
              onClick={() => router.push(ROUTES.SITE.ORGANIZER)}
              className="w-full h-12 rounded-2xl border border-[#3a1224]/15 text-[#3a1224] text-xs font-black uppercase tracking-widest hover:bg-[#3a1224]/5 transition-colors"
            >
              View Organizer Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-emerald-600 font-semibold">Payment received!</p>
          <p className="text-[#3a1224]/60 text-sm">Your booking is pending admin approval. Redirecting...</p>
          <RedirectTimer onRedirect={() => router.push("/bookings")} />
        </div>
      </div>
    );
  }

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

function RedirectTimer({ onRedirect }) {
  useEffect(() => {
    const t = setTimeout(onRedirect, 3000);
    return () => clearTimeout(t);
  }, [onRedirect]);
  return null;
}
