"use client";
import React from 'react';
import { LoadScript } from '@react-google-maps/api';
import { LocationMap } from './LocationMap';

export const LocationMapWrapper = ({ venueData }) => {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    return null; // Will show fallback in LocationMap component
  }

  return (
    <LoadScript 
      googleMapsApiKey={googleMapsApiKey}
      onError={() => {
        // Handle error silently - script may already be loaded
      }}
    >
      <LocationMap venueData={venueData} />
    </LoadScript>
  );
};
