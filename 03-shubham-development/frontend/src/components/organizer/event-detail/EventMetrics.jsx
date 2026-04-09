import { motion } from "framer-motion";
import { Users, Activity, Calendar, ShieldCheck } from "lucide-react";

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("en-GB", { 
      year: "numeric", 
      month: "short", 
      day: "numeric",
      weekday: "short"
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
      label: "Hall Capacity",
      value: hallCapacity > 0 ? hallCapacity : "—",
      subtitle: event.hallId?.name || "No hall assigned",
      color: "from-[#C0A04C] to-[#A68A3C]",
      delay: 0
    },
    {
      icon: Activity,
      label: "Expected",
      value: event.expectedAttendees || 0,
      subtitle: `${
        event.expectedAttendees && hallCapacity > 0
          ? Math.round((event.expectedAttendees / hallCapacity) * 100)
          : "—"
      }% capacity`,
      color: "from-emerald-400 to-emerald-600",
      delay: 0.05
    },
    {
      icon: Calendar,
      label: "Event Date",
      value: formatDate(event.bookingId?.date),
      subtitle: (
        <span className="inline-block text-[9px] font-black text-white bg-[#C0A04C] px-2.5 py-1 rounded-full mt-1">
          {event.bookingId?.slot?.toUpperCase()}
        </span>
      ),
      color: "from-blue-400 to-blue-600",
      delay: 0.1
    },
    {
      icon: ShieldCheck,
      label: "Booking",
      value: event.bookingId?.status,
      subtitle: (
        <div className="w-full bg-[#3a1224]/5 rounded-full h-2 overflow-hidden mt-2">
          <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
        </div>
      ),
      color: "from-purple-400 to-purple-600",
      delay: 0.15
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {metrics.map(({ icon: Icon, label, value, subtitle, color, delay }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay }}
          className="bg-white rounded-2xl border border-[#3a1224]/5 p-6 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-black text-[#3a1224]/40 uppercase tracking-widest mb-2">{label}</p>
          <p className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-black text-[#3a1224] mb-1">{value}</p>
          <div className="text-sm sm:text-base text-[#3a1224]/60 font-semibold">{subtitle}</div>
        </motion.div>
      ))}
    </div>
  );
}
