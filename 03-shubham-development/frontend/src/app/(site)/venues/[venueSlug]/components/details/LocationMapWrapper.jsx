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
      <div className="flex min-h-[300px] flex-col justify-between bg-[#fbf8f2] p-6 sm:p-8">
        {/* Address block */}
        <div>
          <div className="mb-4 flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#3a1224] text-[#C0A04C]">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#3a1224]/40">Address</p>
              <p className="mt-1 text-sm font-bold leading-6 text-[#3a1224]">{address}</p>
            </div>
          </div>

          {/* Location detail rows */}
          {venueData?.location && typeof venueData.location === 'object' && (
            <div className="mt-4 space-y-2 border-t border-[#e8dcc8] pt-4">
              {[
                { label: 'City', value: venueData.location.city },
                { label: 'State', value: venueData.location.state },
                { label: 'Country', value: venueData.location.country },
              ].filter((r) => r.value).map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-[#3a1224]/40 font-medium">{row.label}</span>
                  <span className="font-bold text-[#3a1224]">{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          {googleMapsApiKey && (
            <button
              type="button"
              onClick={() => setShouldLoadMap(true)}
              className="flex h-10 items-center gap-2 rounded-2xl bg-[#3a1224] px-5 text-[11px] font-black uppercase tracking-[0.18em] text-[#C0A04C] transition hover:bg-[#4a1a2e]"
            >
              <Map className="h-3.5 w-3.5" />
              Show on map
            </button>
          )}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 items-center gap-2 rounded-2xl border border-[#e8dcc8] bg-white px-5 text-[11px] font-black uppercase tracking-[0.18em] text-[#3a1224] transition hover:border-[#C0A04C]/50"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Get directions
          </a>
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
