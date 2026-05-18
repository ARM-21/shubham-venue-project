'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from 'lib/axios';
import { AlertCircle } from 'lucide-react';
import { inputCls } from './FormInputs';

export default function Step1EventDetails({ data, onUpdate, onNext, onPrev, bookingPurpose }) {
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
        <div className="rounded-2xl border border-[#e8dcc8] bg-[#fbf8f2] px-4 py-3 text-sm text-[#3a1224]/70">
          These details will be used to set up your event listing after payment. You can update them from your organizer dashboard.
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
          className={inputCls}
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
          className={inputCls}
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
          Special Requirements {!isOrganizerFlow && <span className="ml-1 font-normal text-[9px] text-[#3a1224]/30">(optional)</span>}
        </label>
        <textarea
          {...register('specialRequirements')}
          rows={4}
          placeholder={isOrganizerFlow 
            ? 'Equipment setup, technical requirements, seating arrangements, sound/lighting needs...'
            : 'Dietary preferences, special setup, accessibility requirements...'
          }
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="flex h-11 flex-1 items-center justify-center rounded-2xl border border-[#e8dcc8] bg-white text-[11px] font-black uppercase tracking-[0.18em] text-[#3a1224] transition hover:bg-[#f8f4ed]"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#3a1224] text-[11px] font-black uppercase tracking-[0.18em] text-[#C0A04C] transition hover:bg-[#4a172d]"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
