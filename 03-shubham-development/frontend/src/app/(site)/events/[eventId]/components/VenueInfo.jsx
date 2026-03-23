import { MapPin, Users, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ROUTES } from "config/routes";

export function VenueInfo({ venue }) {
  const router = useRouter();

  if (!venue) return null;

  return (
    <section className="bg-gradient-to-br from-white to-[#fdfaf6] rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-white/50 p-8 lg:p-12 xl:p-16">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-[1px] bg-[#C0A04C]" />
        <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Venue Information</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Venue Details */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#3a1224] leading-tight mb-4">
              {venue.name}
            </h2>
            <p className="text-gray-600 font-light leading-relaxed">
              Premium venue facility with world-class amenities and hospitality services.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#fdfaf6] rounded-2xl border border-[#3a1224]/5 hover:border-[#C0A04C]/30 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-[#C0A04C]/10 to-[#3a1224]/5 border border-[#C0A04C]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-[#C0A04C]" />
              </div>
              <div>
                <p className="text-[9px] font-black text-[#3a1224]/50 uppercase tracking-[0.2em]">Capacity</p>
                <p className="text-lg font-bold text-[#3a1224]">
                  {venue.capacity?.toLocaleString() || "N/A"} guests
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#fdfaf6] rounded-2xl border border-[#3a1224]/5 hover:border-[#C0A04C]/30 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-[#C0A04C]/10 to-[#3a1224]/5 border border-[#C0A04C]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-[#C0A04C]" />
              </div>
              <div>
                <p className="text-[9px] font-black text-[#3a1224]/50 uppercase tracking-[0.2em]">Venue Type</p>
                <p className="text-lg font-bold text-[#3a1224]">Premium Setup</p>
              </div>
            </div>
          </div>

          {venue.slug && (
            <button
              onClick={() => router.push(ROUTES.SITE.VENUES(venue.slug))}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#C0A04C] to-[#C0A04C]/80 text-[#3a1224] rounded-2xl font-black uppercase tracking-wider text-sm hover:shadow-xl hover:shadow-[#C0A04C]/20 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <span>View Venue Details</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          )}
        </div>

        {/* Venue Stats */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-gradient-to-br from-[#C0A04C]/10 to-transparent border border-[#C0A04C]/20 rounded-2xl hover:border-[#C0A04C]/50 transition-all duration-300">
              <p className="text-[9px] font-black text-[#3a1224]/50 uppercase tracking-widest mb-3">Class</p>
              <p className="text-2xl font-display font-bold text-[#3a1224]">Premium</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-[#C0A04C]/10 to-transparent border border-[#C0A04C]/20 rounded-2xl hover:border-[#C0A04C]/50 transition-all duration-300">
              <p className="text-[9px] font-black text-[#3a1224]/50 uppercase tracking-widest mb-3">Status</p>
              <p className="text-2xl font-display font-bold text-green-600">Active</p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-50 to-transparent border border-blue-200/50 rounded-2xl">
            <p className="text-[9px] font-black text-blue-600/70 uppercase tracking-widest mb-3">Quick Facts</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-blue-900/70">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                World-class amenities
              </li>
              <li className="flex items-center gap-2 text-sm text-blue-900/70">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Professional catering services
              </li>
              <li className="flex items-center gap-2 text-sm text-blue-900/70">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Expert event management
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
