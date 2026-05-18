import { Users, Activity, Calendar, ShieldCheck } from "lucide-react";

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

export function EventMetrics({ event }) {
  const hallCapacity = event.hallId?.capacity || 0;
  const metrics = [
    {
      icon: Users,
      label: "Hall capacity",
      value: hallCapacity > 0 ? hallCapacity : "-",
      subtitle: event.hallId?.name || "No hall assigned",
    },
    {
      icon: Activity,
      label: "Expected guests",
      value: event.expectedAttendees || 0,
      subtitle: `${event.expectedAttendees && hallCapacity > 0 ? Math.round((event.expectedAttendees / hallCapacity) * 100) : "-"}% capacity`,
    },
    {
      icon: Calendar,
      label: "Event date",
      value: formatDate(event.bookingId?.date),
      subtitle: event.bookingId?.slot ? `${event.bookingId.slot} slot` : "Slot not set",
    },
    {
      icon: ShieldCheck,
      label: "Booking",
      value: event.bookingId?.status || "-",
      subtitle: "Source booking status",
    },
  ];

  return (
    <div className="grid gap-px overflow-hidden border border-[#e8dcc8] bg-[#e8dcc8] sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(({ icon: Icon, label, value, subtitle }) => (
        <div key={label} className="bg-white px-5 py-4">
          <div className="mb-3 flex items-center gap-2 text-[#3a1224]/45">
            <Icon className="h-4 w-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.18em]">{label}</p>
          </div>
          <p className="text-xl font-black capitalize text-[#3a1224]">{value}</p>
          <p className="mt-1 text-xs capitalize text-[#3a1224]/45">{subtitle}</p>
        </div>
      ))}
    </div>
  );
}
