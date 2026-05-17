"use client";

import { useMemo, useState } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { ExternalLink, Loader2, Map, MapPin } from 'lucide-react';
import { LocationMap } from './LocationMap';

function getVenueAddress(venueData) {
  const location = venueData?.location;
  if (!location) return 'Location details available on request';
  if (typeof location === 'string') return location;

  return [location.address, location.city, location.state, location.country]
    .filter(Boolean)
    .join(', ') || 'Location details available on request';
}

export const LocationMapWrapper = ({ venueData, venueLocation }) => {
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const address = venueLocation || getVenueAddress(venueData);
  const directionsUrl = useMemo(
    () => `https://www.google.com/maps/search/${encodeURIComponent(address)}`,
    [address]
  );

  if (!shouldLoadMap) {
    return (
      <div className="grid min-h-[320px] bg-[linear-gradient(135deg,#fffaf0_0%,#f4eadc_100%)] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex flex-col justify-between p-6 sm:p-8">
          <div>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#3a1224] shadow-sm">
              <MapPin className="h-6 w-6" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#C0A04C]">Venue Address</p>
            <h3 className="mt-3 text-2xl font-black text-[#3a1224]">Plan guest arrival with the exact area.</h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#3a1224]/65">{address}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {googleMapsApiKey ? (
              <button
                type="button"
                onClick={() => setShouldLoadMap(true)}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#3a1224] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#3a1224]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C0A04C]"
              >
                <Map className="h-4 w-4" />
                View map
              </button>
            ) : null}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#C0A04C]/40 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#3a1224] transition hover:border-[#C0A04C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C0A04C]"
            >
              <ExternalLink className="h-4 w-4" />
              Open directions
            </a>
          </div>
        </div>

        <div className="relative hidden overflow-hidden border-l border-[#C0A04C]/20 bg-[#3a1224] lg:block">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(#C0A04C_1px,transparent_1px),linear-gradient(90deg,#C0A04C_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#C0A04C]/40 bg-white/10" />
          <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#C0A04C] text-[#3a1224] shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-white/10 p-4 text-white backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C0A04C]">Area Preview</p>
            <p className="mt-2 text-sm leading-6 text-white/75">{address}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!googleMapsApiKey) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center bg-[#fdfaf6] p-6 text-center">
        <div>
          <p className="font-bold text-[#3a1224]">Map is not configured</p>
          <p className="mt-2 text-sm text-[#3a1224]/60">Use the directions link for now.</p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={googleMapsApiKey}
      loadingElement={
        <div className="flex h-full min-h-[320px] items-center justify-center bg-[#fdfaf6] text-[#3a1224]">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#C0A04C]" />
          Loading map...
        </div>
      }
      onLoad={() => setScriptReady(true)}
      onError={() => setScriptFailed(true)}
    >
      {scriptFailed ? (
        <div className="flex h-full min-h-[320px] items-center justify-center bg-[#fdfaf6] p-6 text-center">
          <div>
            <p className="font-bold text-[#3a1224]">Map could not be loaded</p>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex cursor-pointer text-sm font-bold text-[#C0A04C]"
            >
              Open directions instead
            </a>
          </div>
        </div>
      ) : scriptReady ? (
        <LocationMap venueData={venueData} />
      ) : null}
    </LoadScript>
  );
};
