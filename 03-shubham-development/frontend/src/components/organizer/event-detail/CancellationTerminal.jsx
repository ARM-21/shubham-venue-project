import { AlertCircle, CheckCircle2, Users } from "lucide-react";

export function CancellationTerminal({ cancellationData }) {
  if (!cancellationData) return null;

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="border border-emerald-200 bg-emerald-50">
      <div className="flex items-start gap-3 border-b border-emerald-200 px-5 py-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />
        <div>
          <h2 className="text-base font-black text-emerald-950">Cancellation processed</h2>
          <p className="mt-1 text-xs text-emerald-800">{formatTime(cancellationData.timestamp)}</p>
        </div>
      </div>

      <div className="grid gap-px bg-emerald-200 sm:grid-cols-3">
        <Metric icon={Users} label="Attendees notified" value={cancellationData.attendeesNotified} note="Cancellation email sent" />
        <Metric icon={AlertCircle} label="Tickets cancelled" value={cancellationData.ticketsCancelled} note="Pending refund handling" />
        <Metric icon={CheckCircle2} label="Admin notified" value="Yes" note="Logged for review" />
      </div>

      {cancellationData.cancellationReason && (
        <div className="border-t border-emerald-200 px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-800">Cancellation reason</p>
          <p className="mt-2 text-sm leading-6 text-emerald-950">{cancellationData.cancellationReason}</p>
        </div>
      )}
    </section>
  );
}

function Metric({ icon: Icon, label, value, note }) {
  return (
    <div className="bg-emerald-50 px-5 py-4">
      <div className="flex items-center gap-2 text-emerald-800">
        <Icon className="h-4 w-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.18em]">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-black text-emerald-950">{value}</p>
      <p className="mt-1 text-xs text-emerald-800/75">{note}</p>
    </div>
  );
}
