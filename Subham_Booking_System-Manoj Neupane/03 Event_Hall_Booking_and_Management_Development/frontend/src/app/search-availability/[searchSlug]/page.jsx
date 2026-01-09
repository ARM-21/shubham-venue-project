"use client";

import React, { useEffect, useState } from "react";
import CheckAvailability from "@/components/check-availability/CheckAvailability.jsx";
import axiosInstance from "@/lib/axios";
import { useParams } from "next/navigation";

export default function HallPage() {
  const { searchSlug: hallSlug } = useParams() ;
  const [hall, setHall] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHall() {
      try {
        const res = await axiosInstance.get(`/api/v1/halls/${hallSlug}`);
        setHall(res.data.hall);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load hall");
      }
    }
    fetchHall();
  }, [hallSlug]);

  if (error) return <p>{error}</p>;
  if (!hall) return <p>Loading hall...</p>;

  return (
    <CheckAvailability
      hallId={hall._id}
      hallName={hall.name}
      hallCapacity={hall.capacity}
    />
  );
}
