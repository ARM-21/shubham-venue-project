import { Calendar, Clock, Users, Building2, Tag, AlertCircle, ChefHat, Palette, Flag } from "lucide-react";
import { SLOT_TIMES } from "constants/slots";
import ReportEventButton from "components/events/ReportEventButton";
import { RichTextDisplay } from "components/shared/RichTextDisplay";

// Helper to strip HTML tags for preview text
function stripHtmlTags(html) {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function EventDetails({ event, formatDateTime, hallName }) {
  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays}d ${diffHours}h`;
    return `${diffHours}h`;
  };

  const getSlotTimeDisplay = () => {
    const slot = event.bookingId?.slot || event.slot;
    if (!slot) return "Time not specified";
    return SLOT_TIMES[slot]?.display || "Time not specified";
  };

  const getSlotDuration = () => {
    const slot = event.bookingId?.slot || event.slot;
    if (!slot) return "N/A";
    const slotInfo = SLOT_TIMES[slot];
    if (!slotInfo) return "N/A";
    return `${slotInfo.endHour - slotInfo.startHour}h`;
  };

  const getEventDuration = () => {
    if (event.startDateTime && event.endDateTime) {
      const startTime = new Date(event.startDateTime);
      const endTime = new Date(event.endDateTime);
      const diffMs = endTime - startTime;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffHours > 0 && diffMinutes > 0) {
        return `${diffHours}h ${diffMinutes}m`;
      } else if (diffHours > 0) {
        return `${diffHours}h`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes}m`;
      }
      return "N/A";
    }
    return getSlotDuration();
  };

  const getFormattedEventTime = () => {
    if (event.startDateTime && event.endDateTime) {
      const startTime = new Date(event.startDateTime);
      const endTime = new Date(event.endDateTime);
      // Use UTC hours to avoid timezone conversion
      const startHour = startTime.getUTCHours().toString().padStart(2, '0');
      const startMin = startTime.getUTCMinutes().toString().padStart(2, '0');
      const endHour = endTime.getUTCHours().toString().padStart(2, '0');
      const endMin = endTime.getUTCMinutes().toString().padStart(2, '0');
      return `${startHour}:${startMin} - ${endHour}:${endMin}`;
    }
    return getSlotTimeDisplay();
  };

  const isRegistrationOpen = () => {
    const now = new Date();
    const regStart = event.registrationStartDate ? new Date(event.registrationStartDate) : null;
    const regEnd = event.registrationEndDate ? new Date(event.registrationEndDate) : null;

    if (!regStart || !regEnd) return null;
    if (now < regStart) return "upcoming";
    if (now > regEnd) return "closed";
    return "open";
  };

  const registrationStatus = isRegistrationOpen();

  return (
    <div className="space-y-12">
      {/* Main Details Card */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-white/50 p-8 lg:p-12 xl:p-16 backdrop-blur-sm">
        {/* Header with accent line */}
        <div className="mb-12">
          <div className="h-1 w-24 bg-gradient-to-r from-[#C0A04C] to-transparent mb-6" />
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl lg:text-4xl font-black text-[#3a1224] tracking-tight mb-3">
                Event Information
              </h2>
              <p className="text-[#3a1224]/60 text-base leading-relaxed">
                {stripHtmlTags(event.description)?.substring(0, 120)}...
              </p>
            </div>
            <div className="flex-shrink-0">
              <ReportEventButton eventId={event._id} eventName={event.name} />
            </div>
          </div>
        </div>

        {/* Details Grid - 4 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Date Card */}
          <div className="group p-6 bg-gradient-to-br from-[#FDFCFB] to-[#fdfaf6] rounded-2xl border border-[#3a1224]/5 hover:border-[#C0A04C]/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-[#C0A04C]/20 to-[#C0A04C]/5 rounded-lg">
                <Calendar className="w-5 h-5 text-[#C0A04C]" />
              </div>
              <span className="text-[9px] font-black text-[#3a1224]/50 uppercase tracking-[0.2em]">Event Date</span>
            </div>
            <p className="text-lg font-black text-[#3a1224] mb-2 leading-tight">
              {event.eventDate || (event.bookingId?.date)
                ? new Date(event.eventDate || event.bookingId?.date).toLocaleDateString('en-US', { 
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : "Not Set"}
            </p>
            <p className="text-xs text-[#3a1224]/60 font-medium">
              {getFormattedEventTime()}
            </p>
          </div>

          {/* Time Card */}
          <div className="group p-6 bg-gradient-to-br from-[#FDFCFB] to-[#fdfaf6] rounded-2xl border border-[#3a1224]/5 hover:border-[#C0A04C]/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-[#C0A04C]/20 to-[#C0A04C]/5 rounded-lg">
                <Clock className="w-5 h-5 text-[#C0A04C]" />
              </div>
              <span className="text-[9px] font-black text-[#3a1224]/50 uppercase tracking-[0.2em]">Event Time</span>
            </div>
            <p className="text-lg font-black text-[#3a1224] mb-2">
              {getFormattedEventTime()}
            </p>
            <p className="text-xs text-[#3a1224]/60 font-medium">
              {getEventDuration()} duration
            </p>
          </div>

          {/* Venue Card */}
          <div className="group p-6 bg-gradient-to-br from-[#FDFCFB] to-[#fdfaf6] rounded-2xl border border-[#3a1224]/5 hover:border-[#C0A04C]/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-[#C0A04C]/20 to-[#C0A04C]/5 rounded-lg">
                <Building2 className="w-5 h-5 text-[#C0A04C]" />
              </div>
              <span className="text-[9px] font-black text-[#3a1224]/50 uppercase tracking-[0.2em]">Venue</span>
            </div>
            <p className="text-lg font-black text-[#3a1224] mb-2 truncate">
              {hallName}
            </p>
            <p className="text-xs text-[#3a1224]/60 font-medium">
              {event.hallId?.capacity?.toLocaleString() || 'N/A'} capacity
            </p>
          </div>

          {/* Privacy Card */}
          <div className="group p-6 bg-gradient-to-br from-[#FDFCFB] to-[#fdfaf6] rounded-2xl border border-[#3a1224]/5 hover:border-[#C0A04C]/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-[#C0A04C]/20 to-[#C0A04C]/5 rounded-lg">
                <Flag className="w-5 h-5 text-[#C0A04C]" />
              </div>
              <span className="text-[9px] font-black text-[#3a1224]/50 uppercase tracking-[0.2em]">Privacy</span>
            </div>
            <p className="text-lg font-black text-[#3a1224] mb-2">
              {event.isPublic ? "Public" : "Private"}
            </p>
            <p className="text-xs text-[#3a1224]/60 font-medium">
              {event.isPublic ? "Open to everyone" : "Access code needed"}
            </p>
          </div>
        </div>
      </div>

      {/* Registration Status Card */}
      {(event.registrationStartDate || event.registrationEndDate) && (
        <div className={`rounded-[2.5rem] border-l-8 p-8 lg:p-10 backdrop-blur-sm ${
          registrationStatus === "open"
            ? "bg-emerald-50 border-emerald-500 shadow-[0_20px_50px_rgba(16,185,129,0.1)]"
            : registrationStatus === "upcoming"
            ? "bg-blue-50 border-blue-500 shadow-[0_20px_50px_rgba(59,130,246,0.1)]"
            : "bg-gray-50 border-gray-400 shadow-[0_20px_50px_rgba(107,114,128,0.1)]"
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${
              registrationStatus === "open"
                ? "bg-emerald-100"
                : registrationStatus === "upcoming"
                ? "bg-blue-100"
                : "bg-gray-100"
            }`}>
              <AlertCircle size={24} className={`${
                registrationStatus === "open"
                  ? "text-emerald-600"
                  : registrationStatus === "upcoming"
                  ? "text-blue-600"
                  : "text-gray-600"
              }`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-black text-lg mb-4 ${
                registrationStatus === "open"
                  ? "text-emerald-900"
                  : registrationStatus === "upcoming"
                  ? "text-blue-900"
                  : "text-gray-900"
              }`}>
                {registrationStatus === "open"
                  ? "Registration is Now Open"
                  : registrationStatus === "upcoming"
                  ? "Registration Coming Soon"
                  : "Registration Closed"}
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                    registrationStatus === "open"
                      ? "text-emerald-600"
                      : registrationStatus === "upcoming"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}>Opens</p>
                  <p className="font-black text-[#3a1224]">
                    {event.registrationStartDate
                      ? new Date(event.registrationStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                    registrationStatus === "open"
                      ? "text-emerald-600"
                      : registrationStatus === "upcoming"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}>Closes</p>
                  <p className="font-black text-[#3a1224]">
                    {event.registrationEndDate
                      ? new Date(event.registrationEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                    registrationStatus === "open"
                      ? "text-emerald-600"
                      : registrationStatus === "upcoming"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}>Status</p>
                  <p className="font-black text-[#3a1224]">
                    {registrationStatus === "open"
                      ? "Open"
                      : registrationStatus === "upcoming"
                      ? "Coming"
                      : "Closed"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance & Details */}
      {(event.eventCategory || event.dressCode || event.ageRestriction || event.targetAudience) && (
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-white/50 p-8 lg:p-12">
          <div className="mb-8">
            <div className="h-1 w-24 bg-gradient-to-r from-[#C0A04C] to-transparent mb-6" />
            <h3 className="text-2xl font-black text-[#3a1224] tracking-tight">Additional Details</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.eventCategory && (
              <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-50/50 rounded-2xl border border-amber-200/50">
                <p className="text-[9px] font-black text-amber-600/70 uppercase tracking-widest mb-2">Category</p>
                <p className="text-lg font-black text-amber-900">{event.eventCategory.replace(/_/g, " ")}</p>
              </div>
            )}
            {event.dressCode && (
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-50/50 rounded-2xl border border-purple-200/50">
                <p className="text-[9px] font-black text-purple-600/70 uppercase tracking-widest mb-2">Dress Code</p>
                <p className="text-lg font-black text-purple-900 capitalize">{event.dressCode.replace(/_/g, " ")}</p>
              </div>
            )}
            {event.ageRestriction && (
              <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-50/50 rounded-2xl border border-orange-200/50">
                <p className="text-[9px] font-black text-orange-600/70 uppercase tracking-widest mb-2">Age Limit</p>
                <p className="text-lg font-black text-orange-900">{event.ageRestriction}</p>
              </div>
            )}
            {event.targetAudience && (
              <div className="p-6 bg-gradient-to-br from-teal-50 to-teal-50/50 rounded-2xl border border-teal-200/50 sm:col-span-2 lg:col-span-1">
                <p className="text-[9px] font-black text-teal-600/70 uppercase tracking-widest mb-2">Audience</p>
                <p className="text-lg font-black text-teal-900">{event.targetAudience}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Services Available */}
      {(event.catering || event.decoration) && (
        <div className="bg-gradient-to-r from-[#3a1224] to-[#2a0d1a] rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.15)] p-8 lg:p-12">
          <h3 className="text-xl font-black text-white mb-6">Services & Amenities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {event.catering && (
              <div className="flex items-center gap-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="p-3 bg-white/20 rounded-lg">
                  <ChefHat size={24} className="text-[#C0A04C]" />
                </div>
                <div>
                  <p className="font-black text-white">Premium Catering</p>
                  <p className="text-sm text-white/70">Professional catering included</p>
                </div>
              </div>
            )}
            {event.decoration && (
              <div className="flex items-center gap-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Palette size={24} className="text-[#C0A04C]" />
                </div>
                <div>
                  <p className="font-black text-white">Decoration Services</p>
                  <p className="text-sm text-white/70">Custom decoration available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {event.tags && event.tags.length > 0 && (
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-white/50 p-8 lg:p-12">
          <h3 className="text-lg font-black text-[#3a1224] mb-6">Event Tags</h3>
          <div className="flex flex-wrap gap-3">
            {event.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-5 py-2.5 bg-gradient-to-r from-[#C0A04C]/10 to-[#C0A04C]/5 text-[#3a1224] rounded-full text-sm font-bold border border-[#C0A04C]/20 hover:border-[#C0A04C]/50 transition-all duration-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
