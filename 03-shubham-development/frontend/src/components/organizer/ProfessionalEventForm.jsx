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
  Upload,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

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
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(initialData?.bannerUrl || null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerError, setBannerError] = useState(null);
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false)
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
      
      // Timing - Extract time from startDateTime/endDateTime
      eventStartTime: initialData?.startDateTime ? new Date(initialData.startDateTime).toISOString().slice(11, 16) : "",
      eventEndTime: initialData?.endDateTime ? new Date(initialData.endDateTime).toISOString().slice(11, 16) : "",
      
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

  // Fetch booking date when component mounts
  useEffect(() => {
    if (initialData?.bookingId && !bookingDate) {
      setBookingLoading(true);
      axiosInstance
        .get(`/api/v1/bookings/${initialData.bookingId}`)
        .then((res) => {
          if (res.data?.booking?.date) {
            setBookingDate(res.data.booking.date);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch booking date:", err);
          toast.error("Could not load booking details");
        })
        .finally(() => setBookingLoading(false));
    }
  }, [initialData?.bookingId, bookingDate]);

  const tabs = [
    { id: "basic", label: "Basic Info", icon: FileText },
    { id: "timing", label: "Timing", icon: Calendar },
    { id: "attendance", label: "Attendance", icon: Users },
    { id: "location", label: "Location", icon: MapPin },
    { id: "requirements", label: "Services", icon: ClipboardList },
    { id: "visibility", label: "Visibility", icon: Sparkles },
  ];

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      setBannerError("Image must be less than 5MB");
      return;
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, GIF, or WEBP allowed");
      setBannerError("Only JPG, PNG, GIF, or WEBP allowed");
      return;
    }

    setBannerFile(file);
    setBannerError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => setBannerPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadBanner = async () => {
    if (!bannerFile) return;
    
    try {
      setBannerUploading(true);
      setBannerError(null);

      // Get presigned URL from backend using menu upload URL
      const ext = `.${bannerFile.name.split('.').pop()}`;
      const { data } = await axiosInstance.post(ROUTES.API.ADMIN.MENU_UPLOAD_URL, {
        fileExtension: ext,
        contentType: bannerFile.type,
      });

      const uploadUrl = data?.data?.uploadUrl;
      const publicUrl = data?.data?.publicUrl;

      if (!uploadUrl || !publicUrl) {
        throw new Error('Upload URL not received');
      }

      // Upload to S3 using presigned URL
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': bannerFile.type },
        body: bannerFile,
      });

      // Update form with the public URL
      setValue('bannerUrl', publicUrl, { shouldDirty: true });
      setBannerFile(null);
      toast.success('Banner uploaded successfully');
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Upload failed';
      toast.error(message);
      setBannerError(message);
    } finally {
      setBannerUploading(false);
    }
  };

  const handleFormSubmit = async (data) => {
    // Validate event times exist
    if (!data.eventStartTime || !data.eventEndTime) {
      toast.error("Event start and end times are required");
      return;
    }

    // Validate event start time < end time
    if (data.eventStartTime >= data.eventEndTime) {
      toast.error("Event start time must be before end time");
      return;
    }

    // Validate registration dates
    if (data.registrationStartDate && data.registrationEndDate) {
      if (new Date(data.registrationStartDate) > new Date(data.registrationEndDate)) {
        toast.error("Registration start date must be before end date");
        return;
      }
    }

    // Validate registration end date is before or on event date
    if (data.registrationEndDate && bookingDate) {
      const regEndDate = new Date(data.registrationEndDate);
      const eventDate = new Date(bookingDate);
      if (regEndDate > eventDate) {
        toast.error("Registration must end before or on event date");
        return;
      }
    }

    // Convert time-only inputs to datetime by combining with booking date
    let startDateTime = null;
    let endDateTime = null;
    
    if (data.eventStartTime && bookingDate) {
      const bookDateStr = new Date(bookingDate).toISOString().split('T')[0];
      startDateTime = `${bookDateStr}T${data.eventStartTime}:00`;
    }
    
    if (data.eventEndTime && bookingDate) {
      const bookDateStr = new Date(bookingDate).toISOString().split('T')[0];
      endDateTime = `${bookDateStr}T${data.eventEndTime}:00`;
    }

    if (onSubmit) {
      await onSubmit({
        ...data,
        startDateTime,
        endDateTime,
        eventDate: bookingDate, // Use booking date as event date
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
                Event Banner Image
              </label>
              <div className="space-y-3">
                {/* Banner Preview */}
                {bannerPreview && (
                  <div className="relative">
                    <img 
                      src={bannerPreview} 
                      alt="Banner preview" 
                      className="w-full h-40 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setBannerPreview(null);
                        setBannerFile(null);
                        setValue('bannerUrl', '');
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Remove banner"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}

                {/* Upload Area */}
                {!bannerPreview ? (
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-amber-300 rounded-lg hover:bg-amber-50 transition-colors">
                        <Upload size={18} className="text-amber-600" />
                        <span className="text-sm font-medium text-amber-900">
                          {bannerFile ? bannerFile.name : 'Choose banner image'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        disabled={bannerUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : null}

                {/* Upload Button - Only show if file is selected but not yet uploaded */}
                {bannerFile && !bannerUploading && (
                  <button
                    type="button"
                    onClick={uploadBanner}
                    className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload size={16} />
                    Upload Banner
                  </button>
                )}

                {/* Uploading State */}
                {bannerUploading && (
                  <div className="w-full px-4 py-2 bg-amber-100 text-amber-900 rounded-lg font-medium text-center animate-pulse">
                    Uploading banner...
                  </div>
                )}

                {/* Error Message */}
                {bannerError && (
                  <p className="text-red-600 text-sm">{bannerError}</p>
                )}

                {/* Hidden input for form */}
                <input
                  type="hidden"
                  {...register("bannerUrl")}
                  value={bannerPreview || ""}
                />
              </div>
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

          {/* Booking Date Info (Locked) */}
          {bookingDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle size={20} className="text-blue-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Event Date Locked to Booking</p>
                <p className="text-sm text-blue-800 mt-1">
                  Your event will be held on <strong>{new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                </p>
                <p className="text-xs text-blue-700 mt-2">You can only adjust the start and end times below.</p>
              </div>
            </div>
          )}

          {bookingLoading && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600 text-sm">
              Loading booking details...
            </div>
          )}

          {/* Event Times */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Event Times</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Start Time *
                </label>
                <input
                  type="time"
                  {...register("eventStartTime", { required: "Start time is required" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {errors.eventStartTime && (
                  <p className="text-red-600 text-sm mt-1">{errors.eventStartTime.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event End Time *
                </label>
                <input
                  type="time"
                  {...register("eventEndTime", { required: "End time is required" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {errors.eventEndTime && (
                  <p className="text-red-600 text-sm mt-1">{errors.eventEndTime.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Duration Calculator */}
          {(() => {
            const startTime = watch("eventStartTime");
            const endTime = watch("eventEndTime");
            let duration = null;
            if (startTime && endTime) {
              const [startH, startM] = startTime.split(":").map(Number);
              const [endH, endM] = endTime.split(":").map(Number);
              const startMins = startH * 60 + startM;
              const endMins = endH * 60 + endM;
              if (endMins > startMins) {
                const diffMins = endMins - startMins;
                const hours = Math.floor(diffMins / 60);
                const mins = diffMins % 60;
                duration = `${hours}h ${mins}m`;
              }
            }
            return duration ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900">Event Duration</p>
                <p className="text-lg font-semibold text-green-700 mt-1">{duration}</p>
              </div>
            ) : null;
          })()}

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
                  Registration Closes *
                </label>
                <input
                  type="date"
                  {...register("registrationEndDate", {
                    required: "Registration close date is required",
                    validate: (value) => {
                      if (!value || !bookingDate) return true;
                      const regDate = new Date(value);
                      const bookDate = new Date(bookingDate);
                      if (regDate > bookDate) {
                        return "Registration cannot close after event date";
                      }
                      return true;
                    }
                  })}
                  max={bookingDate ? new Date(bookingDate).toISOString().split('T')[0] : undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {errors.registrationEndDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.registrationEndDate.message}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">Must be before or on event date</p>
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
