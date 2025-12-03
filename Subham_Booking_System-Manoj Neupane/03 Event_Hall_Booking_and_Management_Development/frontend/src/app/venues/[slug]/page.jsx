"use client";
import React, { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';

export default function Venue({ params }) {
  const { slug } = React.use(params);
  const [venueData, setVenueData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVenueData(slug) {
      try {
        const response = await axiosInstance.get(`/api/v1/halls/${slug}`);
        setVenueData(response.data.hall);
      } catch (error) {
        console.error('Error fetching venue:', error);
        setError('Failed to load venue data.');
      } finally {
        setLoading(false);
      }
    }
    fetchVenueData(slug);
  }, [slug]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!venueData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Venue not found</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">

      {/* Venue Details */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {venueData.name}
          </h1>
          <p className="text-gray-600">
            {venueData.location.address}, {venueData.location.city}, {venueData.location.state}
          </p>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
          <p className="text-gray-700 leading-relaxed">{venueData.description}</p>
        </div>

        {/* Key Info Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Capacity & Price */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Capacity</span>
                <span className="font-semibold text-gray-900">{venueData.capacity} guests</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Price per hour</span>
                <span className="font-semibold text-gray-900">
                  {venueData.currency} {venueData.pricePerHour.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {venueData.amenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        {venueData.notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-blue-900">{venueData.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}