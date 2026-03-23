"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Calendar,
  Users,
  Tag,
  MapPin,
  ClipboardList,
  Sparkles,
  AlertCircle,
  ChefHat,
  Palette,
  Ticket,
  Clock,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

export const EVENT_CATEGORIES = [
  { value: "WEDDING", label: "Wedding" },
  { value: "CORPORATE", label: "Corporate Event" },
  { value: "CONFERENCE", label: "Conference" },
  { value: "SEMINAR", label: "Seminar" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "TRADE_SHOW", label: "Trade Show" },
  { value: "PRODUCT_LAUNCH", label: "Product Launch" },
  { value: "FUNDRAISER", label: "Fundraiser" },
  { value: "EDUCATIONAL", label: "Educational" },
  { value: "CULTURAL", label: "Cultural Event" },
  { value: "SPORTS", label: "Sports Event" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "PRIVATE_PARTY", label: "Private Party" },
  { value: "OTHER", label: "Other" },
];

export default function ProfessionalEventForm({ initialData = null, onSubmit, isLoading = false }) {
  const [activeTab, setActiveTab] = useState("basic");
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      // Basic Info
      name: initialData?.name || "",
      type: initialData?.type || "",
      description: initialData?.description || "",
      eventCategory: initialData?.eventCategory || "OTHER",
      bannerUrl: initialData?.bannerUrl || "",
      
      // Timing
      startDateTime: initialData?.startDateTime ? new Date(initialData.startDateTime).toISOString().slice(0, 16) : "",
      endDateTime: initialData?.endDateTime ? new Date(initialData.endDateTime).toISOString().slice(0, 16) : "",
      eventDate: initialData?.eventDate ? new Date(initialData.eventDate).toISOString().slice(0, 10) : "",
      
      // Registration
      registrationStartDate: initialData?.registrationStartDate ? new Date(initialData.registrationStartDate).toISOString().slice(0, 10) : "",
      registrationEndDate: initialData?.registrationEndDate ? new Date(initialData.registrationEndDate).toISOString().slice(0, 10) : "",
      
      // Attendance
      maxAttendees: initialData?.maxAttendees || "",
      expectedAttendees: initialData?.expectedAttendees || "",
      targetAudience: initialData?.targetAudience || "",
      dressCode: initialData?.dressCode || "",
      ageRestriction: initialData?.ageRestriction || "",
      
      // Tags
      tags: initialData?.tags?.join(", ") || "",
      
      // Location
      city: initialData?.location?.city || "",
      state: initialData?.location?.state || "",
      country: initialData?.location?.country || "",
      
      // Requirements
      specialRequirements: initialData?.specialRequirements || "",
      catering: initialData?.catering || false,
      decoration: initialData?.decoration || false,
      requiresTicket: initialData?.requiresTicket !== false,
      
      // Visibility
      visibility: initialData?.isPublic ? "public" : "private",
      accessCode: initialData?.accessCode || "",
    },
  });

  const visibility = watch("visibility");

  const tabs = [
    { id: "basic", label: "Basic Info", icon: FileText },
    { id: "timing", label: "Timing", icon: Calendar },
    { id: "attendance", label: "Attendance", icon: Users },
    { id: "location", label: "Location", icon: MapPin },
    { id: "requirements", label: "Services", icon: ClipboardList },
    { id: "visibility", label: "Visibility", icon: Sparkles },
  ];

  const handleFormSubmit = async (data) => {
    // Validate registration dates
    if (data.registrationStartDate && data.registrationEndDate) {
      if (new Date(data.registrationStartDate) > new Date(data.registrationEndDate)) {
        toast.error("Registration start date must be before end date");
        return;
      }
      if (new Date(data.registrationEndDate) > new Date(data.eventDate)) {
        toast.error("Registration must end before or on event date");
        return;
      }
    }

    // Validate event timing
    if (data.startDateTime && data.endDateTime) {
      if (new Date(data.startDateTime) >= new Date(data.endDateTime)) {
        toast.error("Event start time must be before end time");
        return;
      }
    }

    if (onSubmit) {
      await onSubmit({
        ...data,
        tags: data.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        isPublic: visibility === "public",
        maxAttendees: data.maxAttendees ? parseInt(data.maxAttendees) : null,
        expectedAttendees: data.expectedAttendees ? parseInt(data.expectedAttendees) : null,
        location: {
          city: data.city || null,
          state: data.state || null,
          country: data.country || null,
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === id
                ? "bg-amber-100 text-amber-900 border-b-2 border-amber-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon size={18} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Basic Info Tab */}
      {activeTab === "basic" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-amber-600" />
            Event Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Name *
              </label>
              <input
                type="text"
                placeholder="Enter event name"
                {...register("name", { required: "Event name is required" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Category *
              </label>
              <select
                {...register("eventCategory", { required: "Category is required" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {EVENT_CATEGORIES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.eventCategory && (
                <p className="text-red-600 text-sm mt-1">{errors.eventCategory.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <input
                type="text"
                placeholder="e.g., formal dinner, product showcase"
                {...register("type")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/banner.jpg"
                {...register("bannerUrl")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              rows="4"
              placeholder="Detailed event description, objectives, and key highlights"
              {...register("description", { required: "Description is required" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="wedding, celebration, formal, etc."
              {...register("tags")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <p className="text-gray-500 text-xs mt-1">
              Add tags to help attendees find your event
            </p>
          </div>
        </div>
      )}

      {/* Timing Tab */}
      {activeTab === "timing" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-amber-600" />
            Event Timing & Registration
          </h3>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Event Date is when the event actually happens. Start/End DateTime is the duration during which the event runs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date (when event happens) *
              </label>
              <input
                type="date"
                {...register("eventDate", { required: "Event date is required" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {errors.eventDate && (
                <p className="text-red-600 text-sm mt-1">{errors.eventDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="datetime-local"
                {...register("startDateTime")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="datetime-local"
                {...register("endDateTime")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Registration Period</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Opens
                </label>
                <input
                  type="date"
                  {...register("registrationStartDate")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <p className="text-gray-500 text-xs mt-1">When registration opens for attendees</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Closes
                </label>
                <input
                  type="date"
                  {...register("registrationEndDate")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <p className="text-gray-500 text-xs mt-1">Final day attendees can register</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-amber-600" />
            Attendance & Audience
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Attendees
              </label>
              <input
                type="number"
                min="1"
                placeholder="Expected capacity"
                {...register("maxAttendees")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Attendees
              </label>
              <input
                type="number"
                min="0"
                placeholder="Anticipated number"
                {...register("expectedAttendees")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <input
                type="text"
                placeholder="e.g., corporate professionals, families, youth"
                {...register("targetAudience")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dress Code
              </label>
              <select
                {...register("dressCode")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Not specified</option>
                <option value="casual">Casual</option>
                <option value="business_casual">Business Casual</option>
                <option value="business">Business Formal</option>
                <option value="black_tie">Black Tie</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Restriction
              </label>
              <input
                type="text"
                placeholder="e.g., 18+, 21+, or All ages"
                {...register("ageRestriction")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Location Tab */}
      {activeTab === "location" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin size={20} className="text-amber-600" />
            Event Location
          </h3>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-blue-700 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              These fields are for additional location context beyond the booking venue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                placeholder="e.g., Kathmandu"
                {...register("city")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                placeholder="State or province"
                {...register("state")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                placeholder="e.g., Nepal"
                {...register("country")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Requirements Tab */}
      {activeTab === "requirements" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardList size={20} className="text-amber-600" />
            Services & Requirements
          </h3>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                {...register("catering")}
                className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <ChefHat size={18} className="text-amber-600" />
                  Catering Included
                </p>
                <p className="text-sm text-gray-500">Event includes food and beverages</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                {...register("decoration")}
                className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Palette size={18} className="text-amber-600" />
                  Decoration Services
                </p>
                <p className="text-sm text-gray-500">Professional venue decoration included</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                {...register("requiresTicket")}
                className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Ticket size={18} className="text-amber-600" />
                  Requires Ticket Purchase
                </p>
                <p className="text-sm text-gray-500">Attendees must purchase tickets</p>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requirements
            </label>
            <textarea
              rows="4"
              placeholder="Any special requirements, arrangements, or notes for the venue staff"
              {...register("specialRequirements")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Visibility Tab */}
      {activeTab === "visibility" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles size={20} className="text-amber-600" />
            Event Visibility & Access
          </h3>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              style={{ borderColor: visibility === "public" ? "#C0A04C" : undefined }}>
              <input
                type="radio"
                value="public"
                {...register("visibility")}
                className="w-5 h-5 border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <p className="font-medium text-gray-900">Public Event</p>
                <p className="text-sm text-gray-500">Anyone can view and register for this event</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              style={{ borderColor: visibility === "private" ? "#C0A04C" : undefined }}>
              <input
                type="radio"
                value="private"
                {...register("visibility")}
                className="w-5 h-5 border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <p className="font-medium text-gray-900">Private Event</p>
                <p className="text-sm text-gray-500">Only invited guests can access with code</p>
              </div>
            </label>
          </div>

          {visibility === "private" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Code
              </label>
              <input
                type="text"
                placeholder="e.g., WEDDING2024"
                {...register("accessCode")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-gray-500 text-xs mt-1">
                Share this code with invited guests to access the event
              </p>
            </div>
          )}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-4 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {isLoading ? "Saving..." : initialData ? "Update Event" : "Create Event"}
        </button>
        <button
          type="button"
          className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
