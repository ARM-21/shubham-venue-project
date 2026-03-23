"use client";
import React, { useMemo } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

export const LocationMap = ({ venueData }) => {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapRef = React.useRef(null);

  // Default coordinates (Kathmandu if venue has no location)
  const defaultCenter = {
    lat:27.97953326287516, 
    lng: 83.76302466689428
  };

  // Extract venue coordinates or use defaults
  const venueCenter = useMemo(() => {
    if (venueData?.location?.latitude && venueData?.location?.longitude) {
      return {
        lat: parseFloat(venueData.location.latitude),
        lng: parseFloat(venueData.location.longitude),
      };
    }
    return defaultCenter;
  }, [venueData?.location?.latitude, venueData?.location?.longitude]);

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
      scrollwheel: true,
      zoomControl: true,
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: true,
    }),
    []
  );

  if (!googleMapsApiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#fdfaf6] to-[#f0ebe2] rounded-2xl border-4 border-white">
        <div className="text-center">
          <p className="text-[#3a1224] font-semibold mb-2">Map not available</p>
          <p className="text-[#3a1224]/60 text-sm">
            Google Maps API key not configured. Contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerClassName="w-full h-full rounded-2xl overflow-hidden shadow-lg border-4 border-white"
      center={venueCenter}
      zoom={15}
      options={mapOptions}
      ref={mapRef}
    >
      <Marker
        position={venueCenter}
        title={venueData?.name || 'Venue Location'}
      />
    </GoogleMap>
  );
};
