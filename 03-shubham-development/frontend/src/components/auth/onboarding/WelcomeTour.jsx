'use client';

import { useState } from 'react';
import { ChevronRight, CheckCircle } from 'lucide-react';

const benefitList = [
  {
    icon: '🔍',
    title: 'Search & Book Venues',
    description: 'Browse 50+ verified halls with real-time availability in your city'
  },
  {
    icon: '🎨',
    title: 'Customize Everything',
    description: 'Personalize menus, decorations, timings, and special requests'
  },
  {
    icon: '💰',
    title: 'Smart Pricing',
    description: 'All-inclusive pricing with no hidden charges or surprises'
  },
  {
    icon: '✅',
    title: 'Instant Confirmation',
    description: 'Get booking confirmed in 2 minutes with dedicated support'
  },
];

export default function WelcomeTour({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < benefitList.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const benefit = benefitList[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3a1224] to-[#4a172d] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-black text-[#C0A04C] mb-2">
            Welcome! 👋
          </h1>
          <p className="text-white/70">
            Plan your perfect event in minutes
          </p>
        </div>

        {/* Slide Container */}
        <div className="mb-12 h-80 flex flex-col items-center justify-center">
          <div className="text-6xl mb-6 animate-bounce">{benefit.icon}</div>
          <h2 className="text-2xl font-display font-black text-white text-center mb-4">
            {benefit.title}
          </h2>
          <p className="text-white/80 text-center">
            {benefit.description}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-12">
          {benefitList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSlide
                  ? 'bg-[#C0A04C] w-8'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {currentSlide > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 h-12 px-6 border-2 border-[#C0A04C] text-[#C0A04C] font-black rounded-xl hover:bg-[#C0A04C] hover:text-[#3a1224] transition-all"
            >
              ← Back
            </button>
          )}
          
          <button
            onClick={handleNext}
            className="flex-1 h-12 px-6 bg-[#C0A04C] text-[#3a1224] font-black rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {currentSlide === benefitList.length - 1 ? (
              <>
                <span>Let's Go</span>
                <CheckCircle className="w-5 h-5" />
              </>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
