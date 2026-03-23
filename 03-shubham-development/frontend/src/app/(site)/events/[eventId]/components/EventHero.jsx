import Image from "next/image";
import { Calendar, Clock, Users, Sparkles } from "lucide-react";

export function EventHero({ event, banner }) {
  return (
    <div className="relative w-full bg-gradient-to-br from-[#3a1224] to-[#2a0d1a] overflow-hidden">
      {/* Background Image with Fixed Height */}
      <div className="relative h-[600px] sm:h-[700px] lg:h-[850px] w-full">
        {/* Banner Image */}
        <div className="absolute inset-0 z-0 opacity-35">
          <Image
            src={banner}
            alt={event.name}
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Dark Overlays for Contrast */}
        <div className="absolute inset-0 z-5 bg-gradient-to-t from-[#3a1224] via-[#3a1224]/60 to-[#3a1224]/5" />
        <div className="absolute inset-0 z-5 bg-gradient-to-r from-[#3a1224] via-[#3a1224]/30 to-[#3a1224]/50" />

        {/* Content Container with Maximum Spacing */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-10 lg:p-16 max-w-[1600px] mx-auto w-full">
          {/* Top Accent - More Space from Top */}
          <div className="flex items-center gap-3 pt-8 sm:pt-10">
            <div className="w-12 h-[2px] bg-gradient-to-r from-[#C0A04C] to-[#C0A04C]/50" />
            <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">
              {event.type?.toUpperCase() || "EVENT"}
            </span>
          </div>

          {/* Main Content - Positioned at Bottom with Extra Padding */}
          <div className="space-y-6 pb-20 sm:pb-24 lg:pb-32">
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-display font-bold text-white mb-8 leading-tight drop-shadow-2xl">
                {event.name}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-white/85 font-light leading-relaxed max-w-3xl drop-shadow-lg">
                {event.description || "Experience an extraordinary event"}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom gradient accent bar */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#C0A04C] via-[#C0A04C]/60 to-transparent z-20" />
      </div>
    </div>
  );
}
