import React from "react";

export default function StatusBadge({ tone = "neutral", children }) {
  const palette = {
    positive: "bg-emerald-900/40 text-emerald-300 border border-emerald-800",
    warning: "bg-yellow-900/40 text-yellow-300 border border-yellow-800",
    danger: "bg-red-900/40 text-red-300 border border-red-800",
    info: "bg-indigo-900/40 text-indigo-300 border border-indigo-800",
    neutral: "bg-white/5 text-white border border-white/10",
  };

  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${palette[tone]}`}>{children}</span>;
}
