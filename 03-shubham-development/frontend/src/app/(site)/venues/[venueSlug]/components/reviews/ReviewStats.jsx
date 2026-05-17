"use client";

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import axiosInstance from 'lib/axios';

export const ReviewStats = ({ hallId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/api/v1/reviews/${hallId}/stats`);
        setStats(res.data.stats);
      } catch (error) {
        console.error('Failed to fetch review stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (hallId) fetchStats();
  }, [hallId]);

  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <div className="h-40 animate-pulse rounded-2xl bg-[var(--color-ivory)]" />
        <div className="h-40 animate-pulse rounded-2xl bg-[var(--color-ivory)]" />
      </div>
    );
  }

  const breakdown = stats.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const maxReviews = Math.max(...Object.values(breakdown), 1);
  const averageLabel = stats.totalReviews ? stats.averageRating.toFixed(1) : 'New';

  return (
    <div className="grid gap-4 md:grid-cols-[240px_1fr]">
      <div className="flex flex-col justify-center rounded-2xl border border-[var(--color-sand)] bg-[var(--color-ivory)] p-6">
        <div className="text-5xl font-black text-[#3a1224]">{averageLabel}</div>
        <div className="mt-3 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= Math.round(stats.averageRating)
                  ? 'fill-[#C0A04C] text-[#C0A04C]'
                  : 'text-[#3a1224]/20'
              }`}
            />
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--color-stone)]">
          {stats.totalReviews
            ? `Based on ${stats.totalReviews} approved guest review${stats.totalReviews === 1 ? '' : 's'}.`
            : 'No approved reviews yet. Reviews appear here after admin approval.'}
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--color-sand)] bg-white p-5">
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = breakdown[rating] || 0;
            return (
              <div key={rating} className="grid grid-cols-[52px_1fr_32px] items-center gap-3">
                <div className="flex items-center gap-1 text-sm font-bold text-[#3a1224]/70">
                  <span>{rating}</span>
                  <Star className="h-4 w-4 fill-[#C0A04C] text-[#C0A04C]" />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--color-ivory)]">
                  <div
                    className="h-full rounded-full bg-[#C0A04C] transition-all"
                    style={{ width: `${(count / maxReviews) * 100}%` }}
                  />
                </div>
                <span className="text-right text-sm font-semibold text-[#3a1224]/55">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
