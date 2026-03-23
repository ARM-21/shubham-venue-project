'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const eventTypes = [
  'Wedding',
  'Birthday Party',
  'Corporate Event',
  'Conference',
  'Product Launch',
  'Engagement',
  'Anniversary',
  'Other'
];

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
      // API call to save profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    <div className="min-h-screen bg-gradient-to-br from-[#fdfaf6] to-[#f5f0eb] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-black text-[#3a1224] mb-2">
            Complete Your Profile ✨
          </h1>
          <p className="text-lg text-[#3a1224]/60">
            Just a few details to personalize your experience
          </p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Name Section */}
          <div className="bg-white/95 border border-[#3a1224]/5 rounded-3xl p-8 shadow-lg">
            <h2 className="text-lg font-display font-black text-[#3a1224] mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3">
                  First Name *
                </label>
                <input
                  type="text"
                  {...register('firstName', { required: 'First name is required' })}
                  placeholder="John"
                  className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl text-[#3a1224] focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-[10px] font-black mt-2">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3">
                  Last Name *
                </label>
                <input
                  type="text"
                  {...register('lastName', { required: 'Last name is required' })}
                  placeholder="Doe"
                  className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl text-[#3a1224] focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-[10px] font-black mt-2">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  {...register('phone', { required: 'Phone is required', minLength: { value: 10, message: 'Enter valid phone' } })}
                  placeholder="9841234567"
                  className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl text-[#3a1224] focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20"
                />
                {errors.phone && (
                  <p className="text-red-600 text-[10px] font-black mt-2">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3">
                  City *
                </label>
                <select
                  {...register('city')}
                  className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl text-[#3a1224] focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20"
                >
                  <option>Kathmandu</option>
                  <option>Pokhara</option>
                  <option>Lalitpur</option>
                  <option>Bhaktapur</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-[#3a1224]/50 mt-3">Email: {userEmail}</p>
          </div>

          {/* Event Types Section */}
          <div className="bg-white/95 border border-[#3a1224]/5 rounded-3xl p-8 shadow-lg">
            <h2 className="text-lg font-display font-black text-[#3a1224] mb-2">What events are you interested in?</h2>
            <p className="text-sm text-[#3a1224]/60 mb-6">Select at least one (you can change this later)</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {eventTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleEventType(type)}
                  className={`p-4 rounded-xl border-2 transition-all font-black text-sm cursor-pointer ${
                    selectedEventTypes.includes(type)
                      ? 'bg-[#3a1224] border-[#3a1224] text-[#C0A04C]'
                      : 'bg-white border-[#3a1224]/10 text-[#3a1224] hover:border-[#C0A04C]/30'
                  }`}
                >
                  <span>{selectedEventTypes.includes(type) ? '✓ ' : ''}{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 px-6 bg-[#3a1224] text-[#C0A04C] font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-[#4a172d] transition-colors shadow-lg cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Setting up...' : (
                <>
                  <span>Continue to App</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
