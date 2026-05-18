import { ArrowLeft, XCircle } from "lucide-react";

export function EventBanner({ event, onBack }) {
  if (!event) {
    return (
      <div className="border border-dashed border-[#e8dcc8] bg-white py-24 text-center">
        <XCircle className="mx-auto mb-5 h-10 w-10 text-rose-500/30" />
        <p className="text-sm font-bold text-[#3a1224]/45">Event record not found</p>
      </div>
    );
  }

  function statusTone(status) {
    switch (status?.toUpperCase()) {
      case "PUBLISHED":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "PENDING_REVIEW":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "DRAFT":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "CANCELLED":
        return "text-rose-700 bg-rose-50 border-rose-200";
      default:
        return "text-[#3a1224]/60 bg-[#fbf8f2] border-[#e8dcc8]";
    }
  }

  function statusLabel(status) {
    switch (status?.toUpperCase()) {
      case "PUBLISHED":
        return "Published";
      case "PENDING_REVIEW":
        return "Pending admin review";
      case "DRAFT":
        return "Draft";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status || "Unknown";
    }
  }

  return (
    <section className="border-b border-[#e8dcc8] bg-white">
      {event.bannerUrl ? (
        <div className="h-48 w-full overflow-hidden bg-[#fbf8f2] sm:h-60">
          <img src={event.bannerUrl} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-4 py-6 sm:px-6 md:px-8 lg:px-10">
        <button onClick={onBack} className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[#3a1224]/60 hover:text-[#3a1224]">
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </button>
        <div>
          <span className={`inline-flex border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${statusTone(event.status)}`}>
            {statusLabel(event.status)}
          </span>
          <h1 className="mt-3 max-w-4xl text-2xl font-black leading-tight text-[#3a1224] sm:text-3xl lg:text-4xl">{event.name}</h1>
          <p className="mt-2 text-sm font-semibold text-[#3a1224]/55">
            {[event.type, event.eventCategory].filter(Boolean).join(" / ") || "Event details"}
          </p>
        </div>
      </div>
    </section>
  );
}
