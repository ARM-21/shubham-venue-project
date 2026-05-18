import { RichTextDisplay } from "components/shared/RichTextDisplay";

function cateringLabel(event) {
  if (event.cateringPlan === "choose_now") {
    return event.cateringMenus?.[0]?.name || "Menu requested";
  }
  if (event.cateringPlan === "decide_later") return "Decide later";
  return event.catering ? "Requested" : "Not needed";
}

export function EventOverview({ event }) {
  return (
    <section className="border border-[#e8dcc8] bg-white">
      <div className="border-b border-[#e8dcc8] px-5 py-4">
        <h2 className="text-base font-black text-[#3a1224]">Event overview</h2>
        <p className="mt-1 text-xs text-[#3a1224]/45">Public-facing details and service notes.</p>
      </div>

      <div className="grid grid-cols-2 gap-px bg-[#e8dcc8] md:grid-cols-3">
        <MetricItem label="Category" value={event.type || "Not specified"} />
        <MetricItem label="Dress code" value={event.dressCode ? event.dressCode.charAt(0).toUpperCase() + event.dressCode.slice(1) : "Not specified"} />
        <MetricItem label="Age limit" value={event.ageRestriction ? `${event.ageRestriction}+` : "No limit"} />
        <MetricItem label="Catering" value={cateringLabel(event)} />
        <MetricItem label="Decoration" value={event.decoration ? "Available" : "Not available"} />
        <MetricItem label="Tickets" value={event.requiresTicket ? "Required" : "Not required"} />
      </div>

      <div className="px-5 py-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">Description</p>
        <div className="mt-3">
          {event.description ? (
            <RichTextDisplay content={event.description} className="text-[#3a1224]/70" />
          ) : (
            <p className="text-sm leading-6 text-[#3a1224]/60">No description provided.</p>
          )}
        </div>

        {event.specialRequirements && (
          <div className="mt-6 border-t border-[#e8dcc8] pt-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">Special requirements</p>
            <p className="mt-3 border border-amber-200 bg-amber-50 p-4 text-sm font-medium leading-6 text-amber-800">
              {event.specialRequirements}
            </p>
          </div>
        )}

        {event.cateringPlan && event.cateringPlan !== "none" && (
          <div className="mt-6 border-t border-[#e8dcc8] pt-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">Catering request</p>
            <div className="mt-3 border border-[#e8dcc8] bg-[#fbf8f2] p-4 text-sm leading-6 text-[#3a1224]/70">
              <p className="font-black text-[#3a1224]">{cateringLabel(event)}</p>
              {event.cateringGuestCount ? <p>Guests: {event.cateringGuestCount}</p> : null}
              {event.cateringServiceTime ? <p>Service time: {event.cateringServiceTime}</p> : null}
              {event.cateringNotes ? <p className="mt-2">{event.cateringNotes}</p> : null}
            </div>
          </div>
        )}

        {event.tags && event.tags.length > 0 && (
          <div className="mt-6 border-t border-[#e8dcc8] pt-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">Topics</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {event.tags.map((tag, index) => (
                <span key={index} className="border border-[#e8dcc8] bg-[#fbf8f2] px-3 py-1.5 text-xs font-bold text-[#3a1224]/70">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function MetricItem({ label, value }) {
  return (
    <div className="bg-white px-5 py-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">{label}</p>
      <p className="mt-1 text-sm font-black text-[#3a1224]">{value}</p>
    </div>
  );
}
