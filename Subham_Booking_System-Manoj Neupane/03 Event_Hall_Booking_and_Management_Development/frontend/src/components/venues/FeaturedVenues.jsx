"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { useEffect, useState } from 'react';
import Skeleton from './skeleton-loading/Skeleton';

const sample = [
  { id: '1', title: 'Grand Ballroom', image: '/images/slide1.jpg', capacity: 300, price: '₹40,000' },
  { id: '2', title: 'Rose Garden Hall', image: '/images/slide2.jpg', capacity: 120, price: '₹18,000' },
  { id: '3', title: 'Conference Suite', image: '/images/slide3.jpg', capacity: 80, price: '₹9,000' },
];

export default function FeaturedVenues() {
  const router = useRouter();
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedVenues() {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/v1/halls');
        setFeaturedVenues(response.data.halls || []);
        console.log('Featured Venues:', response.data);
      } catch (error) {
        console.error('Error fetching featured venues:', error);
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

        {loading ? (
          <Skeleton />
        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVenues.map((v) => (
              <article key={v._id} className="bg-white rounded-xl shadow-sm overflow-hidden border cursor-pointer transition-transform">
                <div className="h-40 w-full relative">
                  <Image src={v.image || v.images?.[0] || '/assets/business-icons/video.gif'} alt={v.slug || v.name} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <h4 className="font-medium mb-1">{v.name}</h4>
                  <p className="text-sm text-gray-500 mb-3">Capacity: {v.capacity}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{v.price}</div>
                    <button onClick={() => router.push(`/venues/${v._id}`)} className="text-sm text-[var(--maroon-primary)] font-medium hover:underline cursor-pointer">View / Book</button>
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
