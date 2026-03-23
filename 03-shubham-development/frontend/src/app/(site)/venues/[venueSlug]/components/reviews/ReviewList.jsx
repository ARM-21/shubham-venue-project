"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, User, Calendar, Check } from 'lucide-react';
import axiosInstance from 'lib/axios';

export const ReviewList = ({ hallId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [page, minRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/v1/reviews/${hallId}`, {
        params: { page, limit: 5, minRating: minRating || undefined },
      });
      
      if (page === 1) {
        setReviews(res.data.reviews);
      } else {
        setReviews([...reviews, ...res.data.reviews]);
      }
      
      setHasMore(res.data.pagination.page < res.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'fill-[#C0A04C] text-[#C0A04C]' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  if (loading && page === 1) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[0, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            onClick={() => {
              setMinRating(rating);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              minRating === rating
                ? 'bg-[#C0A04C] text-white'
                : 'bg-gray-100 text-[#3a1224] hover:bg-gray-200'
            }`}
          >
            {rating === 0 ? 'All' : `${rating}+ ⭐`}
          </button>
        ))}
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No reviews yet</p>
        ) : (
          reviews.map((review, idx) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#C0A04C] to-[#3a1224] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#3a1224]">
                      {review.userId?.firstName} {review.userId?.lastName}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.createdAt).toLocaleDateString()}
                      {review.isVerified && (
                        <span className="flex items-center gap-1 text-green-600 font-semibold">
                          <Check className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h5 className="font-bold text-lg text-[#3a1224]">{review.title}</h5>
                <p className="text-gray-600 leading-relaxed">{review.comment}</p>
              </div>

              {/* Aspect Ratings */}
              {review.aspects && Object.keys(review.aspects).length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                  {Object.entries(review.aspects).map(([aspect, rating]) => (
                    <div key={aspect} className="text-center">
                      <p className="text-xs text-gray-600 capitalize mb-1">{aspect}</p>
                      {renderStars(rating)}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <button
          onClick={() => setPage(page + 1)}
          disabled={loading}
          className="w-full py-2 border border-[#C0A04C] text-[#C0A04C] rounded-lg hover:bg-[#C0A04C]/5 transition-all disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load More Reviews'}
        </button>
      )}
    </div>
  );
};
