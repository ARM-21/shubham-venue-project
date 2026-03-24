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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Event Type */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Event Type {!isOrganizerFlow && <span className="text-red-500">*</span>}
        </label>
        <select
          {...register('eventType', isOrganizerFlow ? {} : { required: 'Please select event type' })}
          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 transition-all outline-none hover:border-slate-400"
        >
          <option value="">Select event type...</option>
          {eventTypes && eventTypes.map((type) => (
            <option key={type._id} value={type.name}>
              {type.name}
            </option>
          ))}
        </select>
        {errors.eventType && (
          <p className="text-red-600 text-sm font-medium mt-2 flex items-center gap-1">
            <span>•</span> {errors.eventType.message}
          </p>
        )}
      </div>

      {/* Event Name */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Event Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('eventName', isOrganizerFlow ? {} : { required: 'Event name is required' })}
          placeholder="e.g., Wedding Celebration 2025"
          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 transition-all placeholder:text-slate-400 outline-none hover:border-slate-400"
        />
        {errors.eventName && (
          <p className="text-red-600 text-sm font-medium mt-2 flex items-center gap-1">
            <span>•</span> {errors.eventName.message}
          </p>
        )}
      </div>

      {/* Special Requirements */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Special Requirements (Optional)
        </label>
        <textarea
          {...register('specialRequirements')}
          rows={4}
          placeholder="Any special arrangements, dietary needs, accessibility requirements..."
          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 transition-all resize-none placeholder:text-slate-400 outline-none hover:border-slate-400"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-8 border-t border-slate-200">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-[#C0A04C] text-white rounded-lg font-semibold hover:bg-[#b39041] transition-all shadow-sm hover:shadow-md"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
