'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from 'lib/axios';

export default function Step1EventDetails({ data, onUpdate, onNext, bookingPurpose }) {
  const [eventTypes, setEventTypes] = useState([]);
  const isOrganizerFlow = bookingPurpose === 'organizer';
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      eventType: data.eventType,
      eventName: data.eventName,
      specialRequirements: data.specialRequirements,
    }
  });

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const response = await axiosInstance.get('/api/v1/event-types', {
          params: { audience: isOrganizerFlow ? 'organizer' : 'customer' }
        });
        setEventTypes(response.data.events || []);
      } catch (error) {
        console.error('Failed to fetch event types:', error);
      }
    };

    fetchEventTypes();
  }, [isOrganizerFlow]);

  useEffect(() => {
    reset({
      eventType: data.eventType,
      eventName: data.eventName,
      specialRequirements: data.specialRequirements,
    });
  }, [data.eventType, data.eventName, data.specialRequirements, reset]);

  const onSubmit = (formData) => {
    onUpdate(formData);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-[#C0A04C]" />
          <span className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Step 1</span>
        </div>
        <h2 className="text-3xl font-display font-bold text-[#3a1224]">Event Details</h2>
        <p className="text-sm text-[#3a1224]/60 mt-2">Tell us about your event</p>
      </div>

      {/* Event Type */}
      <div>
        <label className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3 block">
          {isOrganizerFlow ? 'Event Type (Optional)' : 'Event Type *'}
        </label>
        <select
          {...register('eventType', isOrganizerFlow ? {} : { required: 'Please select event type' })}
          className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl text-[#3a1224] text-sm focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all outline-none"
        >
          <option value="">Select event type...</option>
          {eventTypes && eventTypes.map((type) => (
            <option key={type._id} value={type.name}>
              {type.name}
            </option>
          ))}
        </select>
        {errors.eventType && (
          <p className="text-red-600 text-[10px] font-black ms-error mt-2">{errors.eventType.message}</p>
        )}
      </div>

      {/* Event Name */}
      <div>
        <label className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3 block">
          Event Name *
        </label>
        <input
          type="text"
          {...register('eventName', isOrganizerFlow ? {} : { required: 'Event name is required' })}
          placeholder="e.g., Wedding Celebration 2025"
          className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl text-[#3a1224] text-sm focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all placeholder:text-[#3a1224]/30"
        />
        {errors.eventName && (
          <p className="text-red-600 text-[10px] font-black mt-2">{errors.eventName.message}</p>
        )}
      </div>

      {/* Special Requirements */}
      <div>
        <label className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-3 block">
          Special Requirements (Optional)
        </label>
        <textarea
          {...register('specialRequirements')}
          rows={4}
          placeholder="Any special arrangements, dietary needs, accessibility requirements..."
          className="w-full px-5 py-3 bg-gray-50 border border-[#3a1224]/10 rounded-xl text-[#3a1224] text-sm focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all resize-none placeholder:text-[#3a1224]/30"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          className="flex-1 h-12 bg-[#3a1224] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:shadow-xl transition-all cursor-pointer"
        >
          {isOrganizerFlow ? 'Continue to Payment' : 'Continue to Menu Selection'}
        </button>
      </div>
    </form>
  );
}
