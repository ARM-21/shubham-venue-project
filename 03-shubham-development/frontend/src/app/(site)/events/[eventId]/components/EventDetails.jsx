import { CalendarDays, Clock, MapPin, Users, UserCircle } from "lucide-react";
import { SLOT_LABELS } from "constants/slots";
import ReportEventButton from "components/events/ReportEventButton";

function formatDate(value) {
  if (!value) return "Not set";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "Not set";
  }
}

function formatTime(value) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return null;
  }
}

function getTimeLabel(event) {
  if (event.startDateTime && event.endDateTime) {
    const start = formatTime(event.startDateTime);
    const end = formatTime(event.endDateTime);
    if (start && end) return `${start} – ${end}`;
  }
  const slot = event.bookingId?.slot || event.slot;
  return SLOT_LABELS[slot] || "Time not specified";
}

function getRegistrationStatus(event) {
  const now = new Date();
  const starts = event.registrationStartDate ? new Date(event.registrationStartDate) : null;
  const ends = event.registrationEndDate ? new Date(event.registrationEndDate) : null;
  if (!starts && !ends) return null;
  if (starts && now < starts) return "Opens soon";
  if (ends && now > ends) return "Closed";
  return "Open";
}

export function EventDetails({ event, hallName }) {
  const eventDate = event.startDateTime || event.eventDate || event.bookingId?.date;
  const registrationStatus = getRegistrationStatus(event);
  const organizer = event.organizerId;
  const organizerName =
    organizer?.businessName ||
    organizer?.organizationName ||
    (organizer?.firstName ? `${organizer.firstName} ${organizer.lastName || ""}`.trim() : null) ||
    organizer?.name ||
    null;

  const rows = [
    { icon: CalendarDays, label: "Date", value: formatDate(eventDate) },
    { icon: Clock, label: "Time", value: getTimeLabel(event) },
    {
      icon: MapPin,
      label: "Venue",
      value: hallName || "Venue",
      sub: event.hallId?.capacity ? `${Number(event.hallId.capacity).toLocaleString()} guests capacity` : null,
    },
    organizerName
      ? { icon: UserCircle, label: "Organizer", value: organizerName }
      : null,
    registrationStatus
      ? {
          icon: Users,
          label: "Registration",
          value: registrationStatus,
          sub: event.isPublic ? "Public event" : "Private — access code may be required",
        }
      : null,
  ].filter(Boolean);

  return (
    <section>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="site-eyebrow mb-1.5">Event details</p>
          <h2 className="text-2xl font-black text-[#3a1224]">Schedule & info</h2>
        </div>
        <ReportEventButton eventId={event._id} eventName={event.name} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white divide-y divide-[#e8dcc8]">
        {rows.map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="flex items-start gap-4 px-5 py-4">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#fbf8f2] text-[#C0A04C]">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/40">{label}</p>
              <p className="mt-0.5 text-[15px] font-bold text-[#3a1224]">{value}</p>
              {sub && <p className="mt-0.5 text-xs text-[#3a1224]/50">{sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {(event.eventCategory || event.dressCode || event.ageRestriction || event.targetAudience) && (
        <div className="mt-3 rounded-2xl border border-[#e8dcc8] bg-[#fbf8f2] px-5 py-4">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#3a1224]/40">Useful to know</p>
          <div className="flex flex-wrap gap-x-8 gap-y-1.5 text-sm">
            {event.eventCategory && (
              <span className="text-[#3a1224]/60">
                Category: <strong className="font-bold text-[#3a1224]">{String(event.eventCategory).replace(/_/g, " ")}</strong>
              </span>
            )}
            {event.dressCode && (
              <span className="text-[#3a1224]/60">
                Dress code: <strong className="font-bold text-[#3a1224]">{String(event.dressCode).replace(/_/g, " ")}</strong>
              </span>
            )}
            {event.ageRestriction && (
              <span className="text-[#3a1224]/60">
                Age limit: <strong className="font-bold text-[#3a1224]">{event.ageRestriction}</strong>
              </span>
            )}
            {event.targetAudience && (
              <span className="text-[#3a1224]/60">
                Audience: <strong className="font-bold text-[#3a1224]">{event.targetAudience}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {(event.catering || event.decoration || event.tags?.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {event.catering && (
            <span className="rounded-full bg-[#3a1224]/5 px-3 py-1.5 text-xs font-bold text-[#3a1224]">Catering</span>
          )}
          {event.decoration && (
            <span className="rounded-full bg-[#3a1224]/5 px-3 py-1.5 text-xs font-bold text-[#3a1224]">Decoration</span>
          )}
          {(event.tags || []).slice(0, 5).map((tag) => (
            <span key={tag} className="rounded-full bg-[#C0A04C]/10 px-3 py-1.5 text-xs font-bold text-[#3a1224]">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
