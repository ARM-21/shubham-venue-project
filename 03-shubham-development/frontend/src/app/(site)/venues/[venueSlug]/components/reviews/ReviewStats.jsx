"use client";
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import axiosInstance from 'lib/axios';

export const ReviewStats = ({ hallId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [hallId]);

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get(`/api/v1/reviews/${hallId}/stats`);
      setStats(res.data.stats);
    } catch (error) {
      console.error('Failed to fetch review stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div>Loading ratings...</div>;
  }

  const maxReviews = Math.max(...Object.values(stats.ratingBreakdown), 1);

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
      <h3 className="text-2xl font-bold text-[#3a1224] mb-6">Guest Reviews</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Overall Rating */}
        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#C0A04C]/10 to-[#3a1224]/5 rounded-xl">
          <div className="text-5xl font-bold text-[#C0A04C] mb-2">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(stats.averageRating)
                    ? 'fill-[#C0A04C] text-[#C0A04C]'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Based on {stats.totalReviews} reviews
          </p>
        </div>

        {/* Rating Breakdown */}
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium text-gray-600">{rating}</span>
                <Star className="w-4 h-4 fill-[#C0A04C] text-[#C0A04C]" />
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C0A04C] transition-all"
                  style={{
                    width: `${
                      ((stats.ratingBreakdown[rating] || 0) / maxReviews) * 100
                    }%`,
                  }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8 text-right">
                {stats.ratingBreakdown[rating] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
