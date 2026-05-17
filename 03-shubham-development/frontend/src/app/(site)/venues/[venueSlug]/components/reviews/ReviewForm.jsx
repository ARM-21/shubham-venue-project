"use client";
import { useState } from 'react';
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
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[var(--color-sand)] bg-[var(--color-ivory)] p-5 sm:p-6"
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C0A04C]">After your booking</p>
          <h3 className="mt-2 text-2xl font-black text-[#3a1224]">Share your experience</h3>
        </div>
        <p className="max-w-sm text-sm leading-6 text-[var(--color-stone)]">
          Reviews are checked before they are shown publicly.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-green-700 text-sm">Thank you! Your review has been submitted for approval.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <div>
          <label className="mb-3 block text-sm font-black text-[#3a1224]">Overall rating</label>
          <div className="flex flex-wrap items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className="cursor-pointer rounded-lg transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C0A04C]"
                aria-label={`Set overall rating to ${star}`}
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
            <span className="ml-1 text-sm font-bold text-[#3a1224]">
              {ratingLabels[formData.rating - 1]}
            </span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-black text-[#3a1224]">Title</label>
          <input
            type="text"
            required
            placeholder="Summarize your experience"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-xl border border-[var(--color-sand)] bg-white px-4 py-3 text-[#3a1224] outline-none transition focus:border-[#C0A04C]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-black text-[#3a1224]">Your review</label>
          <textarea
            required
            placeholder="Share details about your experience..."
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            rows={5}
            className="w-full rounded-xl border border-[var(--color-sand)] bg-white px-4 py-3 text-[#3a1224] outline-none transition focus:border-[#C0A04C]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(formData.aspects).map(([aspect, rating]) => (
            <div key={aspect} className="rounded-xl bg-white p-4">
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#3a1224]/60">
                {aspect}
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleAspectChange(aspect, star)}
                    className="cursor-pointer rounded-md transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C0A04C]"
                    aria-label={`Set ${aspect} rating to ${star}`}
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

        <button
          type="submit"
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#3a1224] py-3.5 font-black uppercase tracking-[0.12em] text-white transition-all hover:bg-[#3a1224]/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </motion.div>
  );
};
