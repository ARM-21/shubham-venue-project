'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronRight, CheckCircle, User, Phone, MapPin, Sparkles, Heart, Cake, Briefcase, Diamond, Mic, Zap, Gift, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const eventTypes = [
  { name: 'Wedding', icon: Heart },
  { name: 'Birthday', icon: Cake },
  { name: 'Corporate', icon: Briefcase },
  { name: 'Engagement', icon: Diamond },
  { name: 'Conference', icon: Mic },
  { name: 'Product Launch', icon: Zap },
  { name: 'Anniversary', icon: Gift },
  { name: 'Other', icon: MoreHorizontal }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export default function ProfileCompletion({ userEmail, onComplete }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      city: 'Kathmandu',
      eventTypes: [],
    }
  });

  const [selectedEventTypes, setSelectedEventTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(1);

  const toggleEventType = (type) => {
    setSelectedEventTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const onSubmit = async (formData) => {
    if (selectedEventTypes.length === 0) {
      toast.error('Please select at least one event type');
      return;
    }

    setIsSubmitting(true);
    try {
      const profileData = {
        ...formData,
        eventTypes: selectedEventTypes,
      };
      onComplete(profileData);
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] relative selection:bg-[#C0A04C]/30 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-[700px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/80 to-[#fdfaf6] pointer-events-none z-0" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-6">
        <motion.div 
          className="max-w-2xl w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-12 text-center"
          >
            <div className="inline-block mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                <Sparkles size={14} className="text-[#C0A04C]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C0A04C]">Step {formStep} of 2</span>
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-display font-bold text-white mb-3 leading-[1.2]">
              {formStep === 1 ? (
                <>Complete Your <span className="text-[#C0A04C] italic font-serif">Profile</span></>
              ) : (
                <>Your Event <span className="text-[#C0A04C] italic font-serif">Preferences</span></>
              )}
            </h1>
            <p className="text-white/60 text-lg font-light">
              {formStep === 1 ? 'Help us personalize your Shubham experience' : 'Tell us about your ideal events'}
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Personal Information */}
            {formStep === 1 && (
              <motion.div variants={itemVariants} className="space-y-6">
                {/* Form Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.1)] border border-[#3a1224]/5 p-10 md:p-14 space-y-8">
                  {/* Personal Info Section */}
                  <div>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-full bg-[#C0A04C]/20 flex items-center justify-center">
                        <User size={20} className="text-[#C0A04C]" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-[#3a1224] tracking-tight">Personal Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div variants={itemVariants}>
                        <label className="block text-[9px] font-black text-[#3a1224]/50 uppercase tracking-widest mb-3">
                          First Name *
                        </label>
                        <input
                          type="text"
                          {...register('firstName', { required: 'Required' })}
                          placeholder="John"
                          className="w-full px-5 py-3.5 bg-[#fdfaf6] border border-[#3a1224]/10 rounded-2xl text-[#3a1224] font-medium placeholder-[#3a1224]/30 focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all"
                        />
                        {errors.firstName && <p className="text-red-500 text-[9px] font-black mt-2 uppercase">Required</p>}
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <label className="block text-[9px] font-black text-[#3a1224]/50 uppercase tracking-widest mb-3">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          {...register('lastName', { required: 'Required' })}
                          placeholder="Doe"
                          className="w-full px-5 py-3.5 bg-[#fdfaf6] border border-[#3a1224]/10 rounded-2xl text-[#3a1224] font-medium placeholder-[#3a1224]/30 focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all"
                        />
                        {errors.lastName && <p className="text-red-500 text-[9px] font-black mt-2 uppercase">Required</p>}
                      </motion.div>
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="pt-6 border-t border-[#3a1224]/10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-full bg-[#C0A04C]/20 flex items-center justify-center">
                        <Phone size={20} className="text-[#C0A04C]" />
                      </div>
                      <h3 className="text-lg font-display font-bold text-[#3a1224]">Contact Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div variants={itemVariants}>
                        <label className="block text-[9px] font-black text-[#3a1224]/50 uppercase tracking-widest mb-3">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          {...register('phone', { required: 'Required', minLength: { value: 10, message: 'Valid phone required' } })}
                          placeholder="+977 98XXXXXXXX"
                          className="w-full px-5 py-3.5 bg-[#fdfaf6] border border-[#3a1224]/10 rounded-2xl text-[#3a1224] font-medium placeholder-[#3a1224]/30 focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all"
                        />
                        {errors.phone && <p className="text-red-500 text-[9px] font-black mt-2 uppercase">Valid phone</p>}
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <label className="block text-[9px] font-black text-[#3a1224]/50 uppercase tracking-widest mb-3">
                          <span className="flex items-center gap-2">
                            <MapPin size={12} /> City
                          </span>
                        </label>
                        <select
                          {...register('city')}
                          className="w-full px-5 py-3.5 bg-[#fdfaf6] border border-[#3a1224]/10 rounded-2xl text-[#3a1224] font-medium focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all appearance-none cursor-pointer"
                        >
                          <option>Kathmandu</option>
                          <option>Pokhara</option>
                          <option>Lalitpur</option>
                          <option>Bhaktapur</option>
                          <option>Other</option>
                        </select>
                      </motion.div>
                    </div>

                    <div className="mt-6 p-4 bg-[#C0A04C]/5 border border-[#C0A04C]/20 rounded-2xl flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#C0A04C] flex-shrink-0 mt-1" />
                      <p className="text-[10px] text-[#3a1224]/60 font-medium">Email: <span className="font-black text-[#3a1224]">{userEmail}</span></p>
                    </div>
                  </div>
                </div>

                {/* Next Button */}
                <motion.button
                  variants={itemVariants}
                  type="button"
                  onClick={() => setFormStep(2)}
                  className="w-full h-12 px-6 bg-gradient-to-r from-[#C0A04C] to-[#D4B557] text-[#3a1224] font-black text-sm uppercase tracking-widest rounded-full hover:shadow-lg hover:shadow-[#C0A04C]/30 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Continue</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Event Preferences */}
            {formStep === 2 && (
              <motion.div variants={itemVariants} className="space-y-6">
                {/* Event Types Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.1)] border border-[#3a1224]/5 p-10 md:p-14">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-[#C0A04C]/20 flex items-center justify-center">
                      <Sparkles size={20} className="text-[#C0A04C]" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-[#3a1224] tracking-tight">Event Interests</h2>
                  </div>

                  <p className="text-[#3a1224]/60 text-sm font-medium mb-8">
                    Select the events you're planning (you can change this anytime)
                  </p>

                  {/* Event Type Grid */}
                  <motion.div 
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6"
                    variants={containerVariants}
                  >
                    {eventTypes.map((event) => (
                      <motion.button
                        key={event.name}
                        type="button"
                        variants={itemVariants}
                        onClick={() => toggleEventType(event.name)}
                        className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm cursor-pointer group relative ${
                          selectedEventTypes.includes(event.name)
                            ? 'bg-[#3a1224] border-[#3a1224] text-[#C0A04C] shadow-lg shadow-[#3a1224]/20'
                            : 'bg-white border-[#3a1224]/10 text-[#3a1224] hover:border-[#C0A04C]/30 hover:shadow-md'
                        }`}
                      >
                        <div className="mb-3 flex justify-center">
                          {event.icon && <event.icon size={24} />}
                        </div>
                        <div className="text-[11px] leading-tight uppercase tracking-wider">{event.name}</div>
                        {selectedEventTypes.includes(event.name) && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle size={16} className="text-[#C0A04C]" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>

                  {selectedEventTypes.length === 0 && (
                    <p className="text-red-500/60 text-[10px] font-black uppercase tracking-wider">Please select at least one event type</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <motion.button
                    variants={itemVariants}
                    type="button"
                    onClick={() => setFormStep(1)}
                    className="px-8 py-3 border-2 border-white/20 text-[#3a1224] font-black text-sm uppercase tracking-widest rounded-full hover:bg-white/5 hover:border-[#C0A04C]/50 transition-all"
                  >
                    ← Back
                  </motion.button>

                  <motion.button
                    variants={itemVariants}
                    type="submit"
                    disabled={isSubmitting || selectedEventTypes.length === 0}
                    className="flex-1 h-12 px-6 bg-gradient-to-r from-[#C0A04C] to-[#D4B557] text-[#3a1224] font-black text-sm uppercase tracking-widest rounded-full hover:shadow-lg hover:shadow-[#C0A04C]/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#3a1224] border-t-transparent rounded-full animate-spin" />
                        <span>Setting Up...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Setup</span>
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>
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
      `}</style>
    </div>
  );
}
