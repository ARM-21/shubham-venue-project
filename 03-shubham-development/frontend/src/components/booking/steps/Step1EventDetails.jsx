'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/lib/axios';

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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Event Details</h2>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {isOrganizerFlow ? 'Organizer Event Type (Optional)' : 'Event Type *'}
        </label>
        <select
          {...register('eventType', isOrganizerFlow ? {} : { required: 'Please select event type' })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
        >
          <option value="">Select event type</option>
          {eventTypes && eventTypes.map((type) => (
            <option key={type._id} value={type.name}>
              {type.name}
            </option>
          ))}
        </select>
        {errors.eventType && (
          <p className="text-red-600 text-sm mt-1">{errors.eventType.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Event Name *
        </label>
        <input
          type="text"
          {...register('eventName', isOrganizerFlow ? {} : { required: 'Event name is required' })}
          placeholder="e.g., John & Jane's Wedding"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
        />
        {errors.eventName && (
          <p className="text-red-600 text-sm mt-1">{errors.eventName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Special Requirements (Optional)
        </label>
        <textarea
          {...register('specialRequirements')}
          rows={4}
          placeholder="Any special arrangements, dietary restrictions, accessibility needs, etc."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#41202b] hover:bg-[#fffbfd] border hover:border-[#41202b] hover:text-black cursor-pointer text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {isOrganizerFlow ? 'Continue to Payment' : 'Continue to Menu Selection'}
      </button>
    </form>
  );
}
