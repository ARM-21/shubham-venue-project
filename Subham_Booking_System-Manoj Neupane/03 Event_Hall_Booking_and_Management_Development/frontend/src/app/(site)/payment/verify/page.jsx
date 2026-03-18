"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const transactionUuid =
      searchParams.get("transaction_uuid")

    if ( !transactionUuid) {
      setStatus("error");
      return;
    }

    async function verify() {
      try {
        if (transactionUuid) {
          await axiosInstance.post("/api/v1/payments/verify", { transactionUuid });
        } 
        setStatus("success");
        setTimeout(() => router.push("/bookings"), 2000);
      } catch {
        setStatus("failed");
      }
    }

    verify();
  }, [searchParams, router]);

  if (status === "verifying") return <p>Verifying payment...</p>;
  if (status === "success") return <p className="text-green-600">Payment successful! Redirecting...</p>;
  return <p className="text-red-600">Payment failed. Please contact support.</p>;
}
