'use client';

import React from 'react';
import CheckAvailability from '@/components/check-availability/CheckAvailability';

export default function AllHallsPage() {
  return (
    <div>
      <CheckAvailability showAllHalls={true} />
    </div>
  );
}
