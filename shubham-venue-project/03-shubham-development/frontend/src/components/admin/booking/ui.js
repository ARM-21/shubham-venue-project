import React from "react";

export function StatusPill({ tone = "neutral", children }) {
  const palette = {
    positive: "bg-emerald-950 text-emerald-300 border border-emerald-900",
    warning: "bg-yellow-950 text-yellow-300 border border-yellow-900",
    danger: "bg-red-950 text-red-300 border border-red-900",
    info: "bg-indigo-950 text-indigo-300 border border-indigo-900",
    neutral: "bg-white/5 text-white border border-white/10",
  };
  return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${palette[tone]}`}>{children}</span>;
}

export function PaymentPill({ tone = "neutral", children }) {
  const palette = {
    positive: "bg-emerald-900/20 text-emerald-400 border border-emerald-900/30",
    warning: "bg-yellow-900/20 text-yellow-400 border border-yellow-900/30",
    danger: "bg-red-900/20 text-red-400 border border-red-900/30",
    neutral: "bg-white/5 text-white border border-white/10",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${palette[tone]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function ActionIconButton({ title, tone = "muted", children, onClick, disabled = false }) {
  const palette = {
    muted: "text-gray-400 hover:text-white hover:bg-[#482323]",
    primary: "bg-primary/20 text-primary hover:bg-primary hover:text-white",
    danger: "bg-red-900/20 text-red-400 hover:bg-red-900 hover:text-white",
  };
  return (
    <button
      className={`p-1.5 rounded transition-colors ${palette[tone]} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      title={title}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
