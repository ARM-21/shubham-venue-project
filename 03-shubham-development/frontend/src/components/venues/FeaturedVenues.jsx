"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from 'config/routes';
import { useQueryHallsPublic } from '@queries/customer/halls-public';
import { SiteCard, SiteEmptyState, resolveImage } from 'components/site/SitePrimitives.jsx';
import { AlertCircle, ArrowRight, BadgeCheck, MapPin, Search, Users } from 'lucide-react';

export default function FeaturedVenues() {
  const { data: hallsData = {}, isLoading, error } = useQueryHallsPublic();
  
  const featuredVenues = hallsData?.halls || [];

  return (
    <div>
      {error && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          We could not load featured venues right now. Please try again in a moment.
        </div>
      )}

      {isLoading ? (
        <VenueSkeleton />
      ) : featuredVenues.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredVenues.slice(0, 3).map((v) => {
            const mainImage = v.images?.[0] || v.image;
            const href = ROUTES.SITE.VENUES(v.slug);
            const price = typeof v.price === 'number' ? `NPR ${v.price.toLocaleString()}` : 'Contact for price';
            const locationText = formatLocation(v.location);

            return (
              <SiteCard
                key={v._id}
                as="article"
                className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-champagne)] hover:shadow-[0_28px_70px_-42px_rgba(58,18,36,0.55)]"
              >
                <Link href={href} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-champagne)]">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--color-pearl)]">
                    <Image
                      src={resolveImage(mainImage, '/assets/business-images/placeholder1.jpg')}
                      alt={v.name || 'Venue image'}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/65 via-transparent to-transparent opacity-75" />
                    <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-wine)] backdrop-blur-md">
                      <BadgeCheck className="h-3.5 w-3.5 text-[var(--color-champagne)]" aria-hidden="true" />
                      Verified
                    </div>
                    <div className="absolute bottom-4 left-4 rounded-2xl bg-white/95 px-4 py-2 shadow-xl backdrop-blur-md">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-stone)]">Starting from</span>
                      <span className="text-sm font-black text-[var(--color-wine)]">{price}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-black leading-tight text-[var(--color-wine)] transition-colors group-hover:text-[var(--maroon-primary)]">{v.name}</h3>
                      <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-[var(--color-champagne)] transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[var(--color-ivory)] p-3">
                        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-stone)]">
                          <Users className="h-4 w-4 text-[var(--color-champagne)]" aria-hidden="true" />
                          Capacity
                        </div>
                        <p className="mt-1 text-sm font-black text-[var(--color-wine)]">{v.capacity || 0} Guests</p>
                      </div>
                      <div className="rounded-2xl bg-[var(--color-ivory)] p-3">
                        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-stone)]">
                          <MapPin className="h-4 w-4 text-[var(--color-champagne)]" aria-hidden="true" />
                          Location
                        </div>
                        <p className="mt-1 truncate text-sm font-black text-[var(--color-wine)]">{locationText}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-[var(--color-sand)] pt-5">
                      <span className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">View venue</span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-wine)] text-white transition-colors group-hover:bg-[var(--color-champagne)] group-hover:text-[var(--color-wine)]">
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              </SiteCard>
            );
          })}
        </div>
      ) : (
        <SiteEmptyState
          icon={Search}
          title="No featured venues yet"
          description="Featured halls will appear here once the venue catalogue is available."
        />
      )}
    </div>
  );
}

function formatLocation(location) {
  if (!location) return 'Syangja';
  if (typeof location === 'string') return location;
  if (typeof location === 'object') {
    return location.address || location.city || location.state || location.country || 'Syangja';
  }
  return 'Syangja';
}

function VenueSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading featured venues">
      {[1, 2, 3].map((item) => (
        <div key={item} className="overflow-hidden rounded-2xl border border-[var(--color-sand)] bg-white shadow-[var(--shadow-soft)]">
          <div className="aspect-[16/10] animate-pulse bg-[var(--color-pearl)]" />
          <div className="space-y-4 p-6">
            <div className="h-6 w-2/3 animate-pulse rounded-full bg-[var(--color-pearl)]" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 animate-pulse rounded-2xl bg-[var(--color-ivory)]" />
              <div className="h-16 animate-pulse rounded-2xl bg-[var(--color-ivory)]" />
            </div>
            <div className="h-10 animate-pulse rounded-full bg-[var(--color-pearl)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
