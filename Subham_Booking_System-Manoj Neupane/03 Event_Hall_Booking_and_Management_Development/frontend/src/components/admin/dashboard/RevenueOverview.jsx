function buildChartPaths(points) {
  const height = 180;
  const width = Math.max(640, (points.length - 1) * 120);
  const maxValue = Math.max(...points, 1);

  const coords = points.map((value, index) => {
    const x = (width / (points.length - 1 || 1)) * index;
    const y = height - (value / maxValue) * height;
    return { x, y };
  });

  const linePath = coords
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return { linePath, areaPath, width, height, coords };
}

export default function RevenueOverview({ heading = "Revenue Overview", points, labels, rangeLabel = "Last 6 Months" }) {
  const { linePath, areaPath, width, height, coords } = buildChartPaths(points);

  return (
    <div className="bg-[var(--admin-surface)] rounded-xl p-6 border border-white/5 lg:col-span-2">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white text-lg font-bold">{heading}</h3>
        <span className="bg-[var(--admin-surface-strong)] border border-[#3a1a1a] text-xs text-[var(--admin-muted)] rounded-lg px-3 py-1">
          {rangeLabel}
        </span>
      </div>

      <div className="h-64 w-full">
        <svg
          className="w-full h-full overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="adminChartGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--admin-primary)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--admin-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              y1={height * ratio}
              x2={width}
              y2={height * ratio}
              stroke="white"
              strokeOpacity="0.05"
            />
          ))}

          <path d={areaPath} fill="url(#adminChartGradient)" />
          <path
            d={linePath}
            fill="none"
            stroke="var(--admin-primary)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {coords.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={4}
              fill="var(--admin-primary)"
              stroke="white"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>

      <div className="flex justify-between mt-4 text-xs text-[var(--admin-muted)] font-medium px-1">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
