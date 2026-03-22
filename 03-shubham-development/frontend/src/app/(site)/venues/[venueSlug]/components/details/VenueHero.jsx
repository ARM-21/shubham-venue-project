"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Star, Share2, Heart } from 'lucide-react';

export const VenueHero = ({ venueData, images, activeIndex, setActiveIndex }) => {
  const mainImage = images[activeIndex];

  return (
    <div className="relative pt-32 pb-4 z-10">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[400px] lg:h-[550px]">
          {/* Main Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8 relative group overflow-hidden rounded-xl shadow-[-20px_40px_80px_rgba(0,0,0,0.3)] border border-white/10"
          >
            <img 
              alt={venueData.name} 
              className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
              src={mainImage} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute inset-0 p-10 flex flex-col justify-end">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-5 py-2 bg-[#C0A04C] backdrop-blur-xl rounded-md text-[10px] font-black tracking-[0.2em] uppercase text-[#3a1224] flex items-center gap-2 shadow-2xl">
                    <Sparkles className="w-3 h-3" /> Best Venue
                  </div>
                  <div className="px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-md text-[10px] font-bold tracking-[0.2em] uppercase text-white">
                    Top Rated
                  </div>
                </div>
                <h1 className="text-5xl lg:text-7xl font-display font-bold text-white mb-4 tracking-tight leading-[1.1]">
                  {venueData.name}
                </h1>
                <div className="flex items-center gap-6 text-white/80">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#C0A04C]" />
                    <span className="text-sm font-medium tracking-wide">{venueData.location?.address}, {venueData.location?.city}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C0A04C]" />
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#C0A04C] fill-[#C0A04C]" />
                    <span className="text-sm font-bold">Good Rating</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="absolute top-10 right-10 flex flex-col gap-3">
              {[Share2, Heart].map((Icon, i) => (
                <button key={i} className="p-4 bg-white/10 hover:bg-[#C0A04C] backdrop-blur-xl border border-white/20 rounded-lg text-white hover:text-[#3a1224] transition-all duration-500 shadow-2xl group/btn">
                  <Icon className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Thumbnail Grid */}
          <div className="lg:col-span-4 grid grid-rows-2 gap-6 h-full">
            {images.slice(1, 3).map((img, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (i * 0.2), duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative group overflow-hidden rounded-xl cursor-pointer shadow-2xl border border-white/10" 
                onClick={() => setActiveIndex(i + 1)}
              >
                <img 
                  alt={`venue-view-${i}`} 
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                  src={img} 
                />
                <div className="absolute inset-0 bg-[#3a1224]/20 group-hover:bg-transparent transition-all duration-700" />
                
                {i === 1 && images.length > 3 && (
                  <div className="absolute inset-0 bg-[#3a1224]/80 flex flex-col items-center justify-center text-[#C0A04C] backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="w-16 h-16 rounded-lg border border-[#C0A04C]/30 flex items-center justify-center mb-4">
                      <span className="text-3xl font-display font-bold">+{images.length - 3}</span>
                    </div>
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-80">Images</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
