"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { useEffect, useState } from 'react';
import Skeleton from './skeleton-loading/Skeleton';

export default function FeaturedVenues() {
  const router = useRouter();
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedVenues() {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/v1/halls');
        setFeaturedVenues(response.data.halls || []);
        console.log('Featured Venues:', response.data);
      } catch (error) {
        console.error('Error fetching featured venues:', error);
        setError('Failed to load featured venues.');
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedVenues();
  }, []);


  return (
    <>
      <section className="container mx-auto px-4 md:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Featured Venues & Menus</h2>

        {error && (
          <div className="text-red-600 text-center mb-4">{error}</div>
        )}

        {loading ? (
          <Skeleton />
        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVenues.map((v) => (
              <article key={v._id} className="bg-white rounded-xl shadow-sm overflow-hidden border cursor-pointer transition-transform"  onClick={() => router.push(`/venues/${v.slug}`)}>
                <div className="h-40 w-full relative">
                 {/* v.image || v.images?.[0] ||  */}
                  <Image src={ '/assets/business-images/placeholder.jpg'} alt={v.slug || v.name} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                 
                </div>
                <div className="p-4">
                  <h4 className="font-medium mb-1">{v.name}</h4>
                  <p className="text-sm text-gray-500 mb-3">Capacity: {v.capacity}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{v.price}</div>
                    <button onClick={() => router.push(`/venues/${v.slug}`)} className="text-sm text-[var(--maroon-primary)] font-medium hover:underline cursor-pointer">View / Book</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

    </>
  );
}
