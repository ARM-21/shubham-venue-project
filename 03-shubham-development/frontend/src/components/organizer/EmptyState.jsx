'use client';

import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Search,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const EmptyStates = {
  NO_EVENTS: {
    icon: Calendar,
    title: 'No Events Yet',
    description: 'Start creating events to manage bookings and reach more customers.',
    cta: 'Create Your First Event',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50'
  },
  NO_ATTENDEES: {
    icon: Users,
    title: 'No Attendees',
    description: 'Attendees will appear here once people start registering for your events.',
    cta: 'Promote Your Event',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50'
  },
  NO_DATA: {
    icon: BarChart3,
    title: 'No Analytics Data',
    description: 'Analytics will be available once your events get registrations.',
    cta: 'View Events',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50'
  },
  NO_RESULTS: {
    icon: Search,
    title: 'No Results Found',
    description: 'Try adjusting your search filters to find what you\'re looking for.',
    cta: 'Clear Filters',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50'
  },
  NO_SELECTION: {
    icon: Sparkles,
    title: 'No Events Selected',
    description: 'Select events to perform bulk actions like export, duplicate, or delete.',
    cta: 'Select Events',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50'
  }
};

export default function EmptyState({ 
  type = 'NO_EVENTS', 
  onCtaClick,
  ctaText,
  description,
  title
}) {
  const config = EmptyStates[type];
  const Icon = config.icon;
  
  const displayTitle = title || config.title;
  const displayDesc = description || config.description;
  const displayCta = ctaText || config.cta;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-24 px-4 sm:px-6"
    >
      {/* Icon Container */}
      <motion.div
        className={`${config.bgColor} rounded-full p-5 sm:p-6 lg:p-8 mb-4 sm:mb-6`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <Icon size={36} className={`${config.color} sm:w-12 lg:w-12`} />
      </motion.div>

      {/* Content */}
      <div className="text-center max-w-md mb-6 sm:mb-8">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-[#3a1224] mb-2 sm:mb-3">
          {displayTitle}
        </h3>
        <p className="text-[12px] sm:text-[13px] lg:text-[15px] text-[#3a1224]/60 leading-relaxed">
          {displayDesc}
        </p>
      </div>

      {/* CTA Button */}
      {onCtaClick && (
        <motion.button
          onClick={onCtaClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#3a1224] text-white rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest shadow-lg hover:shadow-2xl transition-shadow"
        >
          {displayCta}
          <ArrowRight size={13} />
        </motion.button>
      )}

      {/* Decorative Elements */}
      <div className="mt-8 sm:mt-10 lg:mt-12 w-full max-w-xs opacity-30">
        <svg viewBox="0 0 400 100" className="w-full h-auto">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#C0A04C', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#3a1224', stopOpacity: 0.1 }} />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="30" fill="url(#grad)" opacity="0.5" />
          <circle cx="350" cy="50" r="25" fill="url(#grad)" opacity="0.3" />
        </svg>
      </div>
    </motion.div>
  );
}
