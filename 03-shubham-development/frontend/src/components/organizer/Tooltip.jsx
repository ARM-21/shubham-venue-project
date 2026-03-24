'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';

export default function Tooltip({ 
  content, 
  title,
  position = 'top',
  icon = true,
  children 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-3',
    bottom: 'top-full mt-3',
    left: 'right-full mr-3',
    right: 'left-full ml-3',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#3a1224]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-[#3a1224]',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-[#3a1224]',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-[#3a1224]',
  };

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {children || (
          <button 
            className="p-1.5 rounded-full hover:bg-[#C0A04C]/10 transition-colors"
            aria-label="help"
          >
            <HelpCircle size={16} className="text-[#C0A04C]" />
          </button>
        )}
      </div>

      {/* Tooltip Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${positionClasses[position]} z-50 pointer-events-none`}
          >
            <div className="relative pointer-events-auto">
              {/* Arrow */}
              <div className={`absolute w-0 h-0 ${arrowClasses[position]}`} />
              
              {/* Content */}
              <div className="bg-[#3a1224] text-white rounded-lg shadow-xl max-w-xs px-4 py-3">
                {title && (
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#C0A04C] mb-2">
                    {title}
                  </p>
                )}
                <p className="text-[12px] leading-relaxed font-light">
                  {content}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Toast-like floating help message (typically shown on first use)
 */
export function HelpToast({ message, title, onDismiss, autoClose = 6000 }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:max-w-sm z-50"
      onAnimationComplete={() => {
        if (autoClose) {
          setTimeout(handleDismiss, autoClose);
        }
      }}
    >
      <div className="bg-[#3a1224] text-white rounded-xl shadow-2xl p-4 border-l-4 border-[#C0A04C]">
        {title && (
          <p className="text-[9px] font-black uppercase tracking-widest text-[#C0A04C] mb-2">
            {title}
          </p>
        )}
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13px] leading-relaxed font-light flex-1">
            {message}
          </p>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
