import { RichTextDisplay } from "components/shared/RichTextDisplay";

export function EventOverview({ event }) {
  return (
    <section className="bg-white rounded-2xl border border-[#3a1224]/5 p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 bg-[#3a1224] rounded-lg flex items-center justify-center text-[#C0A04C] font-black">📋</div>
        <h3 className="text-xl font-black text-[#3a1224] uppercase tracking-wider">Event Overview</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <MetricItem label="Category" value={event.type || 'Not specified'} />
        <MetricItem label="Dress Code" value={event.dressCode ? event.dressCode.charAt(0).toUpperCase() + event.dressCode.slice(1) : 'Not specified'} />
        <MetricItem label="Age Limit" value={event.ageRestriction ? `${event.ageRestriction}+` : 'No limit'} />
        <MetricItem label="Catering" value={event.catering ? '✓ Included' : '✗ Not included'} />
        <MetricItem label="Decoration" value={event.decoration ? '✓ Available' : '✗ Not available'} />
        <MetricItem label="Tickets" value={event.requiresTicket ? '✓ Required' : '✗ Not required'} />
      </div>

      <div className="border-t border-[#3a1224]/5 pt-6">
        <p className="text-sm sm:text-base font-bold text-[#3a1224]/40 uppercase tracking-widest mb-3">Description</p>
        {event.description ? (
          <RichTextDisplay content={event.description} className="text-[#3a1224]/70" />
        ) : (
          <p className="text-sm sm:text-base text-[#3a1224]/70 leading-relaxed font-medium">
            No description provided
          </p>
        )}
      </div>

      {event.specialRequirements && (
        <div className="mt-6 pt-6 border-t border-[#3a1224]/5">
          <p className="text-sm sm:text-base font-bold text-[#3a1224]/40 uppercase tracking-widest mb-3">Special Requirements</p>
          <p className="text-sm sm:text-base text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-4 font-medium">
            {event.specialRequirements}
          </p>
        </div>
      )}

      {event.tags && event.tags.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[#3a1224]/5">
          <p className="text-sm sm:text-base font-bold text-[#3a1224]/40 uppercase tracking-widest mb-3">Topics</p>
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-[#3a1224]/5 text-[#3a1224] rounded-full text-xs font-bold uppercase tracking-widest border border-[#3a1224]/10">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function MetricItem({ label, value }) {
  return (
    <div>
      <p className="text-xs sm:text-sm font-bold text-[#3a1224]/40 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-lg sm:text-xl font-black text-[#3a1224]">{value}</p>
    </div>
  );
}
