"use client";

import CheckAvailability from "components/check-availability/CheckAvailability.jsx";
import { useQueryHallDetailPublic } from '@queries/customer/hall-detail-public';

export default function SearchAvailabilityClient({ hallSlug }) {
  const { data: hallDetail = {}, isLoading, error } = useQueryHallDetailPublic(hallSlug);
  
  const hall = hallDetail?.hall;

  if (error) return <p>Failed to load hall</p>;
  if (isLoading) return <p>Loading hall...</p>;
  if (!hall) return <p>Hall not found</p>;

  return (
    <CheckAvailability
      hallId={hall._id}
      hallName={hall.name}
      hallSlug={hallSlug}
      hallCapacity={hall.capacity}
    />
  );
}
