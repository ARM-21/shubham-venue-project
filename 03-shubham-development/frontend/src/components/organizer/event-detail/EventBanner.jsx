import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

export function EventBanner({ event, onBack }) {
  if (!event) {
    return (
      <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-[#3a1224]/10">
        <XCircle className="w-12 h-12 text-rose-500/20 mx-auto mb-6" />
        <p className="text-[#3a1224]/40 text-sm font-bold uppercase tracking-widest">Event record not found</p>
      </div>
    );
  }

  function statusTone(status) {
    switch (status?.toUpperCase()) {
      case "PUBLISHED":
        return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "PENDING_REVIEW":
        return "text-blue-600 bg-blue-50 border-blue-100";
      case "DRAFT":
        return "text-amber-600 bg-amber-50 border-amber-100";
      case "CANCELLED":
        return "text-rose-600 bg-rose-50 border-rose-100";
      default:
        return "text-gray-600 bg-gray-50 border-gray-100";
    }
  }

  function statusLabel(status) {
    switch (status?.toUpperCase()) {
      case "PUBLISHED":
        return "Published";
      case "PENDING_REVIEW":
        return "Pending Admin Review";
      case "DRAFT":
        return "Draft";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status || "Unknown";
    }
  }

  return (
    <div className="relative w-full h-56 sm:h-64 md:h-80 lg:h-96 overflow-hidden rounded-b-3xl">
      {/* Banner Image */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[#3a1224] to-[#5a2844] opacity-80"
        style={{
          backgroundImage: event.bannerUrl ? `url('${event.bannerUrl}')` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/90 via-[#3a1224]/40 to-transparent" />
      </div>

      {/* Banner Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest border ${statusTone(event.status)}`}>
              {statusLabel(event.status)}
            </span>
            <span className="text-xs sm:text-sm font-black text-white/60 uppercase tracking-[0.3em]">EVENT DETAILS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            {event.name}
          </h1>
          <p className="text-xs sm:text-sm text-white/80 font-semibold max-w-2xl line-clamp-2">
            {event.type} • {event.eventCategory}
          </p>
        </div>
      </div>

      {/* Action Button in Banner */}
      <button
        onClick={onBack}
        className="absolute top-4 sm:top-6 right-4 sm:right-6 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-white/20 transition-all"
      >
        ← Back
      </button>
    </div>
  );
}
