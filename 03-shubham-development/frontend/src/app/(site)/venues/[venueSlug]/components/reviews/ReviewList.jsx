"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, MessageSquare, Star, User } from 'lucide-react';
import axiosInstance from 'lib/axios';

export const ReviewList = ({ hallId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/api/v1/reviews/${hallId}`, {
          params: { page, limit: 5, minRating: minRating || undefined },
        });

        const nextReviews = res.data.reviews || [];
        setReviews((current) => (page === 1 ? nextReviews : [...current, ...nextReviews]));
        setHasMore(res.data.pagination?.page < res.data.pagination?.pages);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (hallId) fetchReviews();
  }, [hallId, page, minRating]);

  const renderStars = (rating) => (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'fill-[#C0A04C] text-[#C0A04C]' : 'text-[#3a1224]/20'
          }`}
        />
      ))}
    </div>
  );

  if (loading && page === 1) {
    return (
      <div className="space-y-3">
        {[1, 2].map((item) => (
          <div key={item} className="h-36 animate-pulse rounded-2xl bg-[var(--color-ivory)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {[0, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => {
              setMinRating(rating);
              setPage(1);
            }}
            className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${
              minRating === rating
                ? 'border-[#C0A04C] bg-[#C0A04C] text-[#3a1224]'
                : 'border-[var(--color-sand)] bg-white text-[#3a1224] hover:border-[#C0A04C]'
            }`}
          >
            {rating === 0 ? 'All reviews' : `${rating}+ stars`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-sand)] bg-[var(--color-ivory)] px-6 py-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-8 w-8 text-[#C0A04C]" />
            <p className="font-bold text-[#3a1224]">No approved reviews yet.</p>
            <p className="mt-2 text-sm text-[var(--color-stone)]">
              Reviews submitted by guests will appear after approval.
            </p>
          </div>
        ) : (
          reviews.map((review, idx) => (
            <motion.article
              key={review._id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-[var(--color-sand)] bg-white p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-ivory)] text-[#3a1224]">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#3a1224]">
                      {review.userId?.firstName || 'Guest'} {review.userId?.lastName || ''}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-stone)]">
                      <Calendar className="h-3.5 w-3.5" />
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
                      {review.isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 font-bold text-green-700">
                          <Check className="h-3 w-3" />
                          Verified booking
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              <div className="mt-5">
                {review.title ? <h5 className="text-lg font-black text-[#3a1224]">{review.title}</h5> : null}
                <p className="mt-2 leading-7 text-[var(--color-stone)]">{review.comment}</p>
              </div>

              {review.aspects && Object.keys(review.aspects).length > 0 ? (
                <div className="mt-5 grid gap-2 rounded-2xl bg-[var(--color-ivory)] p-3 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(review.aspects).map(([aspect, rating]) => (
                    <div key={aspect} className="rounded-xl bg-white px-3 py-2">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#3a1224]/45">{aspect}</p>
                      {renderStars(rating)}
                    </div>
                  ))}
                </div>
              ) : null}
            </motion.article>
          ))
        )}
      </div>

      {hasMore ? (
        <button
          type="button"
          onClick={() => setPage(page + 1)}
          disabled={loading}
          className="w-full cursor-pointer rounded-full border border-[#C0A04C] bg-white py-3 text-sm font-black uppercase tracking-[0.12em] text-[#3a1224] transition hover:bg-[#C0A04C]/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load more reviews'}
        </button>
      ) : null}
    </div>
  );
};
