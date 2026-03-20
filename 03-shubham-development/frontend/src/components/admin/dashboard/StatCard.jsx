export default function StatCard({
  icon: Icon,
  title,
  value,
  trend,
  tone = "neutral",
  tag,
}) {
  const toneClasses = {
    positive: "text-green-400 bg-green-500/10 border-green-500/20",
    negative: "text-red-400 bg-red-500/10 border-red-500/20",
    neutral: "text-[var(--admin-muted)] bg-white/5 border-white/5",
  }[tone];

  return (
    <div className="bg-[var(--admin-surface)] rounded-xl p-6 border border-white/5 hover:border-[var(--admin-primary)]/30 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-white/5 text-white group-hover:bg-white/10 transition-colors">
          {Icon ? <Icon className="size-5" strokeWidth={2.4} /> : null}
        </div>
        {tag ? (
          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${toneClasses}`}>
            {tag}
          </span>
        ) : null}
      </div>
      <p className="text-[var(--admin-muted)] text-sm font-medium mb-1">{title}</p>
      <p className="text-white text-3xl font-bold">{value}</p>
      {trend ? (
        <p className="mt-2 text-xs text-[var(--admin-muted)]">{trend}</p>
      ) : null}
    </div>
  );
}
