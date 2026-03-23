import { Calendar, Clock, Users, Building2, Tag, AlertCircle, ChefHat, Palette } from "lucide-react";

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
    <div className="space-y-8">
      {/* Main Details Card */}
      <div className="bg-gradient-to-br from-white to-[#fdfaf6] rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-white/50 p-8 lg:p-12 xl:p-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-[#C0A04C]" />
                <span className="text-[10px] font-black text-[#3a1224]/50 uppercase tracking-[0.2em]">Event Date</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-[#3a1224]">
                {event.eventDate 
                  ? new Date(event.eventDate).toLocaleDateString('en-NP', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : "Date not set"}
              </p>
              <p className="text-sm text-[#3a1224]/60 mt-2">
                {event.startDateTime 
                  ? `Starts at ${new Date(event.startDateTime).toLocaleTimeString('en-NP', { 
                      hour: '2-digit',
                      minute: '2-digit'
                    })}`
                  : "Time not set"}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-[#C0A04C]" />
                <span className="text-[10px] font-black text-[#3a1224]/50 uppercase tracking-[0.2em]">Duration</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-[#3a1224]">
                {calculateDuration(event.startDateTime, event.endDateTime)}
              </p>
              <p className="text-sm text-[#3a1224]/60 mt-2">
                Ends {new Date(event.endDateTime).toLocaleDateString('en-NP')}
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-5 h-5 text-[#C0A04C]" />
                <span className="text-[10px] font-black text-[#3a1224]/50 uppercase tracking-[0.2em]">Venue</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-[#3a1224]">
                {hallName}
              </p>
              <p className="text-sm text-[#3a1224]/60 mt-2">
                Capacity: {event.hallId?.capacity?.toLocaleString() || 'N/A'} guests
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 rounded-full bg-[#C0A04C] flex items-center justify-center">
                  <span className="text-[10px] font-black text-[#3a1224]">{event.isPublic ? "P" : "🔒"}</span>
                </div>
                <span className="text-[10px] font-black text-[#3a1224]/50 uppercase tracking-[0.2em]">Privacy</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-[#3a1224]">
                {event.isPublic ? "Public Event" : "Private Event"}
              </p>
              <p className="text-sm text-[#3a1224]/60 mt-2">
                {event.isPublic ? "Open to all" : "Access code required"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Category & Tags */}
      {(event.eventCategory || event.tags?.length > 0) && (
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Tag size={20} className="text-amber-600" />
            {event.eventCategory && (
              <span className="px-4 py-2 bg-amber-200 text-amber-900 rounded-full text-sm font-semibold">
                {event.eventCategory.replace(/_/g, " ")}
              </span>
            )}
            {event.tags?.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white text-amber-800 rounded-full text-xs border border-amber-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Registration Information */}
      {(event.registrationStartDate || event.registrationEndDate) && (
        <div className={`border-l-4 rounded-lg p-6 ${
          registrationStatus === "open"
            ? "bg-emerald-50 border-emerald-500"
            : registrationStatus === "upcoming"
            ? "bg-blue-50 border-blue-500"
            : "bg-gray-50 border-gray-500"
        }`}>
          <div className="flex items-start gap-4">
            <AlertCircle
              size={24}
              className={`flex-shrink-0 mt-1 ${
                registrationStatus === "open"
                  ? "text-emerald-600"
                  : registrationStatus === "upcoming"
                  ? "text-blue-600"
                  : "text-gray-600"
              }`}
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-3">Registration Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Opens</p>
                  <p className="font-medium text-gray-900">
                    {event.registrationStartDate
                      ? new Date(event.registrationStartDate).toLocaleDateString('en-NP', { month: 'short', day: 'numeric' })
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Closes</p>
                  <p className="font-medium text-gray-900">
                    {event.registrationEndDate
                      ? new Date(event.registrationEndDate).toLocaleDateString('en-NP', { month: 'short', day: 'numeric' })
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p
                    className={`font-medium ${
                      registrationStatus === "open"
                        ? "text-emerald-700"
                        : registrationStatus === "upcoming"
                        ? "text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    {registrationStatus === "open"
                      ? "Open Now"
                      : registrationStatus === "upcoming"
                      ? "Coming Soon"
                      : "Closed"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Information */}
      {(event.maxAttendees || event.expectedAttendees || event.targetAudience || event.dressCode || event.ageRestriction) && (
        <div className="bg-gradient-to-br from-white to-[#fdfaf6] rounded-2xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={20} className="text-[#C0A04C]" />
            Attendance Details
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {event.maxAttendees && (
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <p className="text-purple-600 text-xs font-semibold">Max Attendees</p>
                <p className="text-xl font-bold text-purple-900">{event.maxAttendees}</p>
              </div>
            )}
            {event.expectedAttendees && (
              <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                <p className="text-pink-600 text-xs font-semibold">Expected</p>
                <p className="text-xl font-bold text-pink-900">{event.expectedAttendees}</p>
              </div>
            )}
            {event.dressCode && (
              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                <p className="text-indigo-600 text-xs font-semibold">Dress Code</p>
                <p className="text-sm font-medium text-indigo-900 capitalize">{event.dressCode.replace(/_/g, " ")}</p>
              </div>
            )}
            {event.ageRestriction && (
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 md:col-start-1">
                <p className="text-orange-600 text-xs font-semibold">Age Restriction</p>
                <p className="text-sm font-medium text-orange-900">{event.ageRestriction}</p>
              </div>
            )}
            {event.targetAudience && (
              <div className="bg-teal-50 rounded-lg p-3 border border-teal-200 md:col-span-2">
                <p className="text-teal-600 text-xs font-semibold">Target Audience</p>
                <p className="text-sm font-medium text-teal-900">{event.targetAudience}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Services */}
      {(event.catering || event.decoration) && (
        <div className="flex flex-wrap gap-3">
          {event.catering && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
              <ChefHat size={18} className="text-emerald-600" />
              <span className="text-emerald-900 font-medium text-sm">Catering Included</span>
            </div>
          )}
          {event.decoration && (
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-full">
              <Palette size={18} className="text-rose-600" />
              <span className="text-rose-900 font-medium text-sm">Decoration Available</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
