"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { ROUTES } from "@/config/routes";

export default function TicketVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
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

    const dataParam = searchParams.get("data");
    const esewaData = decodeBase64Json(dataParam);
    const transactionUuid = esewaData?.transaction_uuid || searchParams.get("transaction_uuid") || searchParams.get("transactionUuid");
    const pidx = searchParams.get("pidx");

    if (!transactionUuid && !pidx) {
      setStatus("error");
      return;
    }

    async function verify() {
      try {
        await axiosInstance.post(ROUTES.API.TICKETS.VERIFY, { transactionUuid, pidx });
        setStatus("success");
        setTimeout(() => router.push(ROUTES.SITE.TICKETS), 2000);
      } catch (err) {
        setStatus("failed");
      }
    }

    verify();
  }, [searchParams, router]);

  if (status === "verifying") return <p>Verifying ticket payment...</p>;
  if (status === "success") return <p className="text-green-600">Ticket confirmed! Redirecting...</p>;
  if (status === "error") return <p className="text-red-600">Missing transaction reference.</p>;
  return <p className="text-red-600">Payment failed. Please contact support.</p>;
}
