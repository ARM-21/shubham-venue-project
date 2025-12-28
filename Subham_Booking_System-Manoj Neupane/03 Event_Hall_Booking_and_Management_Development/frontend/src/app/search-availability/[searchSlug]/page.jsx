'use client';

import React, { useEffect, useState } from 'react';
import CheckAvailability from '@/components/check-availability/CheckAvailability.jsx';
import axiosInstance from '@/lib/axios';

export default function HallPage({ params }) {
  const {searchSlug:hallSlug} = React.use(params);
  const [hall, setHall] = useState(null);

  useEffect(() => {
    async function fetchHall() {
      const res = await axiosInstance.get(`/api/v1/halls/${hallSlug}`);
      setHall(res.data);
    }
    fetchHall();
  }, [hallSlug]);

  if (!hall) return <p>Loading hall...</p>;

  return <CheckAvailability hallId={hall.id} hallName={hall.name} hallCapacity={hall.capacity} />;
}
