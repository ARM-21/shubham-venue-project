"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Star, Share2, Heart, ChevronRight, ChevronLeft } from 'lucide-react';

export const VenueHero = ({ venueData, images, activeIndex, setActiveIndex }) => {
  const mainImage = images[activeIndex];
  
  const handlePrevImage = () => setActiveIndex(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
  const handleNextImage = () => setActiveIndex(activeIndex === images.length - 1 ? 0 : activeIndex + 1);

  return (
    <div className="relative pt-20 pb-12 lg:pb-16 z-10 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 overflow-hidden">
        {/* Main Image Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative group overflow-hidden rounded-[2.5rem] shadow-[0_40px_100px_rgba(58,18,36,0.15)] border border-white/20 mb-10"
          style={{ height: '600px' }}
        >
          {/* Main Image */}
          <img 
            alt={venueData.name} 
            className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-105" 
            src={mainImage} 
            key={activeIndex}
          />
          
          {/* Enhanced Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          
          {/* Info Content - Bottom Left */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12 z-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="max-w-2xl"
            >
              {/* Badges */}
              <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
                <motion.div 
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#C0A04C] rounded-lg text-[9px] sm:text-[10px] font-black tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[#3a1224] flex items-center gap-2 shadow-2xl backdrop-blur-sm whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Premium Venue
                </motion.div>
                <motion.div 
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white/15 backdrop-blur-md border border-white/30 rounded-lg text-[9px] sm:text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-white whitespace-nowrap"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                >
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-[#C0A04C] text-[#C0A04C]" />
                    Top Rated
                  </div>
                </motion.div>
              </div>

              {/* Title and Details */}
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-display font-bold text-white mb-5 tracking-tight leading-[1.1] drop-shadow-lg">
                {venueData.name}
              </h1>
              
              <div className="flex flex-col gap-2 sm:gap-4 text-white/90">
                <div className="flex items-center gap-2 sm:gap-3">
                  <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-[#C0A04C] flex-shrink-0" />
                  <span className="text-xs sm:text-base font-medium tracking-tight sm:tracking-wide break-words">{venueData.location?.address}, {venueData.location?.city}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#C0A04C] flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-light italic break-words">{venueData.description?.substring(0, 80)}...</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Controls */}
          {images.length > 1 && (
            <>
              {/* Previous Button */}
              <motion.button 
                onClick={handlePrevImage}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-white/20 hover:bg-[#C0A04C] backdrop-blur-lg border border-white/30 rounded-full text-white hover:text-[#3a1224] transition-all duration-500 shadow-lg group"
              >
                <ChevronLeft className="w-6 h-6 transition-transform group-hover:scale-125" />
              </motion.button>

              {/* Next Button */}
              <motion.button 
                onClick={handleNextImage}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-white/20 hover:bg-[#C0A04C] backdrop-blur-lg border border-white/30 rounded-full text-white hover:text-[#3a1224] transition-all duration-500 shadow-lg group"
              >
                <ChevronRight className="w-6 h-6 transition-transform group-hover:scale-125" />
              </motion.button>

              {/* Image Counter */}
              <div className="absolute top-6 right-6 z-30 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/20 rounded-lg text-white text-[11px] font-black tracking-widest">
                {activeIndex + 1} / {images.length}
              </div>
            </>
          )}

          {/* Action Buttons - Top Right */}
          <div className="absolute top-8 left-8 flex flex-col gap-3 z-20">
            {[Share2, Heart].map((Icon, i) => (
              <motion.button 
                key={i}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="p-3.5 bg-white/20 hover:bg-[#C0A04C] backdrop-blur-lg border border-white/30 rounded-lg text-white hover:text-[#3a1224] transition-all duration-500 shadow-xl"
              >
                <Icon className="w-5 h-5" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveIndex(i)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.05), duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                className={`relative flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-500 shadow-lg ${
                  activeIndex === i 
                    ? 'border-[#C0A04C] ring-2 ring-[#C0A04C]/30 w-24 h-24' 
                    : 'border-white/10 hover:border-white/30 w-20 h-20'
                }`}
              >
                <img 
                  alt={`thumbnail-${i}`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                  src={img}
                />
                {activeIndex === i && (
                  <div className="absolute inset-0 ring-inset ring-2 ring-[#C0A04C] animate-pulse" />
                )}
                {i >= 5 && i === images.length - 1 && images.length > 6 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[#C0A04C] text-sm font-black">
                    +{images.length - 5}
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
