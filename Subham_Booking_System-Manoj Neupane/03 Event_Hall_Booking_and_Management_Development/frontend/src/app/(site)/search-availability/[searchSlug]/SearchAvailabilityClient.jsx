"use client";

import { useEffect, useState } from "react";
import CheckAvailability from "@/components/check-availability/CheckAvailability.jsx";
import axiosInstance from "@/lib/axios";

export default function SearchAvailabilityClient({ hallSlug }) {
  const [hall, setHall] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hallSlug) {
      setError("Missing hall identifier");
      return;
    }

    let isMounted = true;

    const fetchHall = async () => {
      try {
        const res = await axiosInstance.get(`/api/v1/halls/${hallSlug}`);
        if (!isMounted) return;
        setHall(res.data.hall);
      } catch (e) {
        if (!isMounted) return;
        setError(e?.response?.data?.message || "Failed to load hall");
      }
    };

    fetchHall();

    return () => {
      isMounted = false;
    };
  }, [hallSlug]);

  if (error) return <p>{error}</p>;
  if (!hall) return <p>Loading hall...</p>;

  return (
    <CheckAvailability
      hallId={hall._id}
      hallName={hall.name}
      hallSlug={hallSlug}
      hallCapacity={hall.capacity}
    />
  );
}
