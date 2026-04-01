'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from 'lib/axios';
import { AlertCircle } from 'lucide-react';

export default function Step1EventDetails({ data, onUpdate, onNext, bookingPurpose }) {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(false);
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
        setLoading(true);
        const response = await axiosInstance.get('/api/v1/event-types', {
          params: { audience: isOrganizerFlow ? 'organizer' : 'customer' }
        });
        setEventTypes(response.data.events || []);
      } catch (error) {
        console.error('Failed to fetch event types:', error);
        // Fallback to default event types
        if (isOrganizerFlow) {
          setEventTypes([
            { _id: 1, name: 'Conference' },
            { _id: 2, name: 'Workshop' },
            { _id: 3, name: 'Seminar' },
            { _id: 4, name: 'Corporate Event' },
            { _id: 5, name: 'Product Launch' },
            { _id: 6, name: 'Trade Show' },
            { _id: 7, name: 'Fundraiser' },
            { _id: 8, name: 'Other' }
          ]);
        } else {
          setEventTypes([
            { _id: 1, name: 'Wedding' },
            { _id: 2, name: 'Birthday Party' },
            { _id: 3, name: 'Anniversary' },
            { _id: 4, name: 'Engagement' },
            { _id: 5, name: 'Corporate Party' },
            { _id: 6, name: 'Other' }
          ]);
        }
      } finally {
        setLoading(false);
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
      {/* Header for Organizer Flow */}
      {isOrganizerFlow && (
        <div className="bg-gradient-to-r from-[#C0A04C]/10 to-[#D4B557]/5 border border-[#C0A04C]/20 rounded-xl p-4 space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C0A04C] mt-1.5 flex-shrink-0" />
            <p className="text-sm font-medium text-[#3a1224]">
              <span className="font-bold">Professional Event Details:</span> Provide key information about your event. These details will be used to create a professional listing.
            </p>
          </div>
        </div>
      )}

      {/* Event Type */}
      <div>
        <label className="block text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.2em] mb-3">
          Event Type {<span className="text-red-500">*</span>}
        </label>
        <select
          {...register('eventType', { required: 'Please select an event type' })}
          disabled={loading}
          className="w-full px-6 py-4 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-2xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-[#C0A04C]/20 focus:border-[#C0A04C] transition-all outline-none hover:border-[#3a1224]/10 disabled:opacity-50"
        >
          <option value="">
            {loading ? 'Loading event types...' : 'Select event type...'}
          </option>
          {eventTypes && eventTypes.map((type) => (
            <option key={type._id} value={typeof type.name === 'string' ? type.name : type}>
              {typeof type.name === 'string' ? type.name : type}
            </option>
          ))}
        </select>
        {errors.eventType && (
          <p className="text-red-600 text-xs font-semibold mt-2 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {errors.eventType.message}
          </p>
        )}
        <p className="text-xs font-medium text-[#3a1224]/50 mt-2">
          {isOrganizerFlow 
            ? 'Select the category that best describes your professional event'
            : 'Choose the type of personal event you are planning'
          }
        </p>
      </div>

      {/* Event Name */}
      <div>
        <label className="block text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.2em] mb-3">
          Event Name {<span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          {...register('eventName', { required: 'Event name is required', minLength: { value: 3, message: 'Event name must be at least 3 characters' } })}
          placeholder={isOrganizerFlow ? 'e.g., Annual Tech Conference 2025' : 'e.g., Sarah & Raj Wedding Celebration'}
          className="w-full px-6 py-4 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-2xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-[#C0A04C]/20 focus:border-[#C0A04C] transition-all placeholder:text-[#3a1224]/30 outline-none hover:border-[#3a1224]/10"
        />
        {errors.eventName && (
          <p className="text-red-600 text-xs font-semibold mt-2 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {errors.eventName.message}
          </p>
        )}
      </div>

      {/* Special Requirements */}
      <div>
        <label className="block text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.2em] mb-3">
          Special Requirements {!isOrganizerFlow && <span className="text-slate-400 font-normal text-[9px]">(Optional)</span>}
        </label>
        <textarea
          {...register('specialRequirements')}
          rows={4}
          placeholder={isOrganizerFlow 
            ? 'Equipment setup, technical requirements, seating arrangements, sound/lighting needs...'
            : 'Dietary preferences, special setup, accessibility requirements...'
          }
          className="w-full px-6 py-4 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-2xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-[#C0A04C]/20 focus:border-[#C0A04C] transition-all resize-none placeholder:text-[#3a1224]/30 outline-none hover:border-[#3a1224]/10"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-6 border-t border-[#3a1224]/5">
        <button
          type="submit"
          className="flex-1 px-6 py-4 bg-[#C0A04C] hover:bg-[#b39041] text-white font-black uppercase tracking-widest rounded-xl transition-all"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
