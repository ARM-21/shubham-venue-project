import { MapPin, Users, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ROUTES } from "config/routes";

export function VenueInfo({ venue }) {
  const router = useRouter();

  if (!venue) return null;

  return (
    <section className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-white/50 p-0 overflow-hidden backdrop-blur-sm">
      {/* Header with accent line */}
      <div className="p-8 lg:p-12 border-b border-[#3a1224]/5">
        <div className="mb-6">
          <div className="h-1 w-24 bg-gradient-to-r from-[#C0A04C] to-transparent mb-6" />
          <h2 className="text-3xl lg:text-4xl font-black text-[#3a1224] tracking-tight">
            Venue Information
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left Column - Venue Details */}
        <div className="p-8 lg:p-12 border-r border-[#3a1224]/5">
          <div className="space-y-8">
            {/* Venue Name */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#3a1224] leading-tight mb-3">
                {venue.name}
              </h3>
              <p className="text-[#3a1224]/60 leading-relaxed text-base">
                Premium venue facility with world-class amenities and exceptional hospitality services designed for your event.
              </p>
            </div>

            {/* Venue Details Cards */}
            <div className="space-y-4">
              {/* Capacity */}
              <div className="group p-6 bg-gradient-to-br from-[#FDFCFB] to-[#fdfaf6] rounded-2xl border border-[#3a1224]/5 hover:border-[#C0A04C]/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-[#C0A04C]/20 to-[#C0A04C]/5 rounded-lg flex-shrink-0">
                    <Users className="w-6 h-6 text-[#C0A04C]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-[#3a1224]/50 uppercase tracking-[0.2em] mb-2">Capacity</p>
                    <p className="text-2xl font-black text-[#3a1224]">
                      {venue.capacity?.toLocaleString() || "N/A"}
                    </p>
                    <p className="text-xs text-[#3a1224]/60 mt-1">Maximum guests</p>
                  </div>
                </div>
              </div>

              {/* Building Type */}
              <div className="group p-6 bg-gradient-to-br from-[#FDFCFB] to-[#fdfaf6] rounded-2xl border border-[#3a1224]/5 hover:border-[#C0A04C]/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-[#C0A04C]/20 to-[#C0A04C]/5 rounded-lg flex-shrink-0">
                    <Building2 className="w-6 h-6 text-[#C0A04C]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-[#3a1224]/50 uppercase tracking-[0.2em] mb-2">Venue Type</p>
                    <p className="text-2xl font-black text-[#3a1224]">Premium Setup</p>
                    <p className="text-xs text-[#3a1224]/60 mt-1">Professional facility</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              {venue.address && (
                <div className="group p-6 bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-2xl border border-blue-200/50 hover:border-blue-300/50 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-blue-600/70 uppercase tracking-[0.2em] mb-2">Location</p>
                      <p className="text-sm font-bold text-blue-900">{venue.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* View Venue Button */}
            {venue.slug && (
              <button
                onClick={() => router.push(ROUTES.SITE.VENUES(venue.slug))}
                className="w-full py-4 px-6 bg-gradient-to-r from-[#3a1224] to-[#2a0d1a] text-white rounded-2xl font-black uppercase tracking-wider text-sm hover:shadow-xl hover:shadow-[#3a1224]/20 transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                <span>View Full Venue Details</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Stats & Features */}
        <div className="p-8 lg:p-12 bg-gradient-to-br from-[#FDFCFB] to-[#fdfaf6]">
          <div className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Class */}
              <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-50/50 rounded-2xl border border-amber-200/50 hover:shadow-lg transition-all duration-300">
                <p className="text-[9px] font-black text-amber-600/70 uppercase tracking-widest mb-3">Class</p>
                <p className="text-sm font-bold text-amber-900 mt-2">Premium</p>
              </div>

              {/* Status */}
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-50/50 rounded-2xl border border-emerald-200/50 hover:shadow-lg transition-all duration-300">
                <p className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest mb-3">Status</p>
                <p className="text-sm font-bold text-emerald-900 mt-2">Active</p>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl border border-[#C0A04C]/20 p-6">
              <p className="text-[9px] font-black text-[#3a1224]/50 uppercase tracking-widest mb-4">Quick Facts</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#C0A04C] mt-2 flex-shrink-0" />
                  <span className="text-sm font-medium text-[#3a1224]">World-class amenities and facilities</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#C0A04C] mt-2 flex-shrink-0" />
                  <span className="text-sm font-medium text-[#3a1224]">Professional catering services</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#C0A04C] mt-2 flex-shrink-0" />
                  <span className="text-sm font-medium text-[#3a1224]">Expert event management team</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#C0A04C] mt-2 flex-shrink-0" />
                  <span className="text-sm font-medium text-[#3a1224]">Flexible setup and decoration</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#C0A04C] mt-2 flex-shrink-0" />
                  <span className="text-sm font-medium text-[#3a1224]">Premium hospitality services</span>
                </li>
              </ul>
            </div>

            {/* Highlights */}
            <div className="bg-gradient-to-br from-[#C0A04C]/10 to-[#C0A04C]/5 rounded-2xl border border-[#C0A04C]/20 p-6">
              <p className="text-[9px] font-black text-[#C0A04C]/70 uppercase tracking-widest mb-3">Why Choose This Venue?</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white text-[#C0A04C] rounded-full text-xs font-bold border border-[#C0A04C]/30">Premium Quality</span>
                <span className="px-3 py-1 bg-white text-[#C0A04C] rounded-full text-xs font-bold border border-[#C0A04C]/30">Best Service</span>
                <span className="px-3 py-1 bg-white text-[#C0A04C] rounded-full text-xs font-bold border border-[#C0A04C]/30">Professional Team</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
