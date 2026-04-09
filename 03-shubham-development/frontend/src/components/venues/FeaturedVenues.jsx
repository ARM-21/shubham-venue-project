"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ROUTES } from 'config/routes';
import Skeleton from './skeleton-loading/Skeleton';
import { useQueryHallsPublic } from '@queries/customer/halls-public';

export default function FeaturedVenues() {
  const router = useRouter();
  const { data: hallsData = {}, isLoading, error } = useQueryHallsPublic();
  
  const featuredVenues = hallsData?.halls || [];

  return (
    <div>
      <div className="max-w-8xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-red-600 text-center mb-8 font-medium">
            Failed to load venues
          </div>
        )}

        {isLoading ? (
          <Skeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVenues.slice(0, 3).map((v) => {
              const mainImage = v.images?.[0] || v.image;
              // Simple utility to resolve images
              const resolvedImage = mainImage 
                ? (mainImage.startsWith('http') ? mainImage : `${process.env.NEXT_PUBLIC_API_BASE_URL}${mainImage}`)
                : '/assets/business-images/placeholder1.jpg';

              return (
                <article 
                  key={v._id} 
                  className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-[var(--gold-accent)]/20 hover:shadow-2xl hover:shadow-[var(--maroon-primary)]/5 transition-all duration-500 cursor-pointer"
                  onClick={() => router.push(ROUTES.SITE.VENUES(v.slug))}
                >
                  {/* Modern Compact Image Container */}
                  <div className="aspect-[16/10] w-full relative overflow-hidden bg-gray-100">
                    <Image 
                      src={resolvedImage} 
                      alt={v.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700" 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        e.target.src = '/assets/business-images/placeholder1.jpg';
                      }}
                    />
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                        NPR {v.price ? v.price.toLocaleString() : 'Contact'}
                      </div>
                    </div>
                  </div>

                  {/* Refined Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold text-[#1a0a0d] group-hover:text-[var(--maroon-primary)] transition-colors leading-tight">
                        {v.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[var(--gold-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {v.capacity} Seats
                      </div>
                      <span className="w-1 h-1 rounded-full bg-gray-200" />
                      <div className="flex items-center gap-1.5 text-[var(--maroon-primary)] uppercase">
                        Verified Venue
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Capacity</span>
                        <span className="text-sm font-bold text-[#3a1224]">{v.capacity || 0} Guests</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#3a1224]/5 text-[#3a1224] flex items-center justify-center group-hover:bg-[#3a1224] group-hover:text-white transition-all duration-300">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
