"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, AlertCircle } from 'lucide-react';
import axiosInstance from 'lib/axios';

export const ReviewForm = ({ hallId, onReviewSubmitted, bookingId }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    aspects: {
      cleanliness: 5,
      service: 5,
      ambiance: 5,
      value: 5,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRatingChange = (value) => {
    setFormData({ ...formData, rating: value });
  };

  const handleAspectChange = (aspect, value) => {
    setFormData({
      ...formData,
      aspects: { ...formData.aspects, [aspect]: value },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        bookingId,
      };

      await axiosInstance.post(`/api/v1/reviews/${hallId}`, payload);

      setSuccess(true);
      setFormData({
        rating: 5,
        title: '',
        comment: '',
        aspects: { cleanliness: 5, service: 5, ambiance: 5, value: 5 },
      });

      setTimeout(() => {
        setSuccess(false);
        onReviewSubmitted?.();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg"
    >
      <h3 className="text-2xl font-bold text-[#3a1224] mb-6">Share Your Experience</h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">Thank you! Your review has been submitted for approval.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <div>
          <label className="block text-sm font-semibold text-[#3a1224] mb-3">Overall Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= formData.rating
                      ? 'fill-[#C0A04C] text-[#C0A04C]'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 text-sm text-[#3a1224] font-medium">
              {ratingLabels[formData.rating - 1]}
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-[#3a1224] mb-2">Title</label>
          <input
            type="text"
            required
            placeholder="Summarize your experience"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C0A04C]"
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-semibold text-[#3a1224] mb-2">Your Review</label>
          <textarea
            required
            placeholder="Share details about your experience..."
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            rows={5}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C0A04C]"
          />
        </div>

        {/* Aspect Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(formData.aspects).map(([aspect, rating]) => (
            <div key={aspect}>
              <label className="block text-sm font-semibold text-[#3a1224] mb-2 capitalize">
                {aspect}
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleAspectChange(aspect, star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-[#C0A04C] text-[#C0A04C]'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3a1224] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#3a1224]/90 disabled:opacity-50 transition-all"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </motion.div>
  );
};
