"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import Image from 'next/image';

export default function VenuesPage() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadMoreAmenities, setLoadMoreAmenities] = useState({shouldLoad: false, idx: null});
  const router = useRouter();

  useEffect(() => {
    async function fetchHalls() {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/v1/halls');
        setHalls(response.data.halls || []);
        console.log('Venues:', response.data);
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHalls();
  }, []);

  const handleViewDetails = (slug) => {
    router.push(`/venues/${slug}`);
  };

  const handleBookNow = (slug) => {
    router.push(`/search-availability/${slug}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading venues...</div>
      </div>
    );
  }

  if (halls.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600 mb-4">No venues available</div>
        <button
          onClick={() => router.push('/')}
          className="bg-[var(--maroon-primary)] text-white px-6 py-2 rounded-lg hover:bg-[var(--maroon-hover)] transition"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Available Venues
          </h1>
          <p className="text-gray-600">
            Browse through our collection of premium venues for your special occasion
          </p>
        </div>
      </div>

      {/* Venues Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {halls.map((hall) => {
            const firstImage ='/assets/business-images/placeholder.jpg';
            /** hall.images?.[0]?.[0] ||  */

            return (
              <div
                key={hall._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Image */}
                <div className="relative h-48 w-full bg-gray-200">
                  <Image
                    src={firstImage}
                    alt={hall.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  // onError={(e) => {
                  //   e.target.src = '/images/placeholder.jpg';
                  // }}
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {hall.name}
                  </h2>

                  {/* Location */}
                  <p className="text-sm text-gray-500 mb-3">
                    {hall.location?.city}, {hall.location?.state}
                  </p>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {hall.description}
                  </p>

                  {/* Details */}
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <div className="flex items-center text-gray-700">
                      <Image src="/assets/utils-icons/guest.svg" alt="Capacity" width={16} height={16} className="mr-1"/>
                      <span>{hall.capacity} guests</span>
                    </div>
                    <div className="text-[var(--maroon-primary)] font-semibold">
                      {hall.currency} {hall.pricePerHour?.toLocaleString()}/hr
                    </div>
                  </div>

                  {/* Amenities */}
                  {hall.amenities && hall.amenities.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">

                        {loadMoreAmenities.shouldLoad && loadMoreAmenities.idx === hall._id ? hall.amenities.map((amenity, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                          >
                            {amenity}
                          </span>
                        )) :
                          hall.amenities.slice(0, 3).map((amenity, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                            >
                              {amenity}
                            </span>
                          ))
                        }
                        {hall.amenities.length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1 cursor-pointer" onClick={
                            () => {
                              setLoadMoreAmenities(prev => ({shouldLoad: !prev.shouldLoad, idx: hall._id}) );
                            }
                          }>
                            {loadMoreAmenities.shouldLoad && loadMoreAmenities.idx === hall._id ? `Show less` : `+${hall.amenities.length - 3} more`}

                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(hall.slug)}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium text-sm cursor-pointer "
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleBookNow(hall.slug)}
                      className="flex-1 bg-[var(--maroon-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--maroon-hover)] transition font-medium text-sm cursor-pointer"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}