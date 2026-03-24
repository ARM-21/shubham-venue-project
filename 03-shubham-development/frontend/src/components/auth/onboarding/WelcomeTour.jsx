'use client';

import { useState } from 'react';
import { ChevronRight, Sparkles, Search, Wand2, Gem, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const benefitList = [
  {
    icon: Search,
    title: 'Discover Venues',
    description: '50+ exquisite halls with real-time availability at your fingertips'
  },
  {
    icon: Wand2,
    title: 'Premium Customization',
    description: 'Personalize every detail—menus, décor, timing, and special requests'
  },
  {
    icon: Gem,
    title: 'Transparent Pricing',
    description: 'Luxury service with all-inclusive pricing and zero hidden fees'
  },
  {
    icon: Zap,
    title: 'Instant Bookings',
    description: 'Professional confirmation in minutes with dedicated support'
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
  const progress = ((currentSlide + 1) / benefitList.length) * 100;

  return (
    <div className="min-h-screen bg-[#fdfaf6] relative selection:bg-[#C0A04C]/30 overflow-hidden flex items-center justify-center">
      {/* Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/80 to-[#fdfaf6] pointer-events-none z-0" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#C0A04C]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#C0A04C]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

      <div className="max-w-2xl w-full mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
              <Sparkles size={14} className="text-[#C0A04C]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C0A04C]">Tour {currentSlide + 1} of {benefitList.length}</span>
            </div>
          </div>
          
          <motion.h1 
            key={`title-${currentSlide}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl lg:text-7xl font-display font-bold text-white mb-4 leading-[1.1]"
          >
            Welcome <span className="text-[#C0A04C] italic font-serif">Aboard</span>
          </motion.h1>
          <p className="text-white/60 text-lg font-light">Discover how Shubham transforms event planning</p>
        </div>

        {/* Slide Content */}
        <motion.div 
          key={`slide-${currentSlide}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.1)] border border-[#3a1224]/5 p-12 md:p-16 text-center mb-12"
        >
          {/* Icon */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
            className="mb-8 flex justify-center"
          >
            <div className="w-24 h-24 bg-gradient-to-b from-[#C0A04C]/20 to-[#C0A04C]/10 rounded-full flex items-center justify-center">
              {benefit.icon && <benefit.icon size={56} className="text-[#C0A04C]" />}
            </div>
          </motion.div>

          {/* Content */}
          <h2 className="text-3xl font-display font-bold text-[#3a1224] mb-4 tracking-tight">
            {benefit.title}
          </h2>
          <p className="text-[#3a1224]/70 text-lg font-light leading-relaxed max-w-xl mx-auto">
            {benefit.description}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#C0A04C] to-[#D4B557]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-3">
            <span className="text-[10px] font-black text-white/50 uppercase tracking-wider">Progress</span>
            <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-wider">{currentSlide + 1} / {benefitList.length}</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mt-12">
          {currentSlide > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onClick={handlePrev}
              className="px-8 py-3 border-2 border-white/20 text-white font-black text-sm uppercase tracking-widest rounded-full hover:bg-white/10 hover:border-[#C0A04C]/50 transition-all"
            >
              ← Back
            </motion.button>
          )}
          
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={handleNext}
            className="flex-1 h-12 px-6 bg-gradient-to-r from-[#C0A04C] to-[#D4B557] text-[#3a1224] font-black text-sm uppercase tracking-widest rounded-full hover:shadow-lg hover:shadow-[#C0A04C]/30 transition-all flex items-center justify-center gap-2 group"
          >
            <span>{currentSlide === benefitList.length - 1 ? 'Complete Tour' : 'Next Step'}</span>
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center gap-2 mt-8">
          {benefitList.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`rounded-full transition-all ${
                idx === currentSlide
                  ? 'bg-[#C0A04C] w-8 h-2'
                  : 'bg-white/20 hover:bg-white/40 w-2 h-2'
              }`}
              whileHover={{ scale: 1.1 }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
