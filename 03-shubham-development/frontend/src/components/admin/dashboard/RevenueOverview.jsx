"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

const Line = dynamic(() => import("react-chartjs-2").then((m) => m.Line), { ssr: false });

function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(96,165,250,${alpha})`;
  const h = hex.replace("#", "").trim();
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function RevenueOverview({ heading = "Revenue Overview", points = [], labels = [], rangeLabel = "Last 6 Months" }) {
  const [colors, setColors] = useState({ primary: "#60a5fa", muted: "#9ca3af" });

  useEffect(() => {
    if (typeof window === "undefined") return;
    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);
    const root = document.documentElement;
    const computed = getComputedStyle(root);
    const primary = computed.getPropertyValue("--admin-primary")?.trim() || "#60a5fa";
    const muted = computed.getPropertyValue("--admin-muted")?.trim() || "#9ca3af";
    setColors({ primary, muted });
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: heading,
        data: points,
        fill: true,
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return hexToRgba(colors.primary, 0.25);
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, hexToRgba(colors.primary, 0.45));
          gradient.addColorStop(1, hexToRgba(colors.primary, 0));
          return gradient;
        },
        borderColor: colors.primary,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: colors.primary,
        pointBorderColor: "#ffffff",
        pointHoverBackgroundColor: colors.primary,
        tension: 0.35,
      },
    ],
  };

  const currencyFormatter = new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 0 });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: "nearest",
        intersect: false,
        callbacks: {
          label: function (context) {
            const value = context.parsed.y ?? context.raw ?? 0;
            return currencyFormatter.format(value);
          },
        },
      },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: colors.muted, autoSkip: true, maxTicksLimit: 6 },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: { color: colors.muted, callback: function(value){ return currencyFormatter.format(Number(value)); } },
      },
    },
    elements: {
      line: { borderJoinStyle: "round" },
    },
  };

  return (
    <div className="bg-[var(--admin-surface)] rounded-xl p-6 border border-white/5 lg:col-span-2">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white text-lg font-bold">{heading}</h3>
        <span className="bg-[var(--admin-surface-strong)] border border-[#3a1a1a] text-xs text-[var(--admin-muted)] rounded-lg px-3 py-1">
          {rangeLabel}
        </span>
      </div>

      <div className="h-64 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
