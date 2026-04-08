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

// Function to derive event time range based on booking slot
function deriveEventTimeRange(slot) {
  if (slot === "morning") {
    return { startTime: "09:00", endTime: "13:00", displayStartTime: "9:00 AM", displayEndTime: "1:00 PM" };
  } else if (slot === "afternoon") {
    return { startTime: "13:00", endTime: "17:00", displayStartTime: "1:00 PM", displayEndTime: "5:00 PM" };
  } else if (slot === "evening") {
    return { startTime: "17:00", endTime: "21:00", displayStartTime: "5:00 PM", displayEndTime: "9:00 PM" };
  } else if (slot === "wholeday") {
    return { startTime: "09:00", endTime: "21:00", displayStartTime: "9:00 AM", displayEndTime: "9:00 PM" };
  }
  return { startTime: "", endTime: "", displayStartTime: "", displayEndTime: "" };
}

// Helper function to convert 24-hour time to 12-hour format
function formatTime24to12(time24) {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

export default function ProfessionalEventForm({ initialData = null, onSubmit, isLoading = false }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(initialData?.bannerUrl || null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerError, setBannerError] = useState(null);
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingSlot, setBookingSlot] = useState(null);
  const [hallLocation, setHallLocation] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
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
      
      // Visibility
      visibility: initialData?.isPublic ? "public" : "private",
      accessCode: initialData?.accessCode || "",
    },
  });

  const visibility = watch("visibility");

  // Fetch booking date and slot when component mounts
  useEffect(() => {
    if (initialData?.bookingId && !bookingDate) {
      setBookingLoading(true);
      axiosInstance
        .get(`/api/v1/bookings/${initialData.bookingId}`)
        .then((res) => {
          const booking = res.data?.booking;
          if (booking?.date) {
            setBookingDate(booking.date);
            const slot = booking.slot;
            setBookingSlot(slot);
            
            // Auto-populate time fields based on slot
            const timeRange = deriveEventTimeRange(slot);
            if (timeRange.startTime && timeRange.endTime) {
              setValue("eventStartTime", timeRange.startTime);
              setValue("eventEndTime", timeRange.endTime);
            }
            
            // Fetch hall details for location info
            if (booking.hallId?._id || booking.hallId) {
              const hallId = booking.hallId?._id || booking.hallId;
              axiosInstance
                .get(`/api/v1/halls/${hallId}`)
                .then((hallRes) => {
                  const hall = hallRes.data?.hall || hallRes.data?.data;
                  if (hall) {
                    const location = {
                      city: hall.location?.city || hall.city || "",
                      state: hall.location?.state || hall.state || "",
                      country: hall.location?.country || hall.country || "",
                    };
                    setHallLocation(location);
                    // Auto-populate location fields
                    setValue("city", location.city);
                    setValue("state", location.state);
                    setValue("country", location.country);
                  }
                })
                .catch((err) => {
                  console.error("Failed to fetch hall details:", err);
                });
            }
          }
        })
        .catch((err) => {
          console.error("Failed to fetch booking date:", err);
          toast.error("Could not load booking details");
        })
        .finally(() => setBookingLoading(false));
    }
  }, [initialData?.bookingId, bookingDate, setValue]);



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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 sm:space-y-8">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[#3a1224]/10 pb-3 sm:pb-4 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === id
                ? "bg-[#3a1224] text-[#C0A04C] shadow-md"
                : "bg-[#fdfaf6] text-[#3a1224]/60 border border-[#3a1224]/5 hover:border-[#C0A04C]/30"
            }`}
          >
            <Icon size={16} className="flex-shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Basic Info Tab */}
      {activeTab === "basic" && (
        <div className="space-y-5 sm:space-y-6">
          <h3 className="text-lg sm:text-xl font-black text-[#3a1224] flex items-center gap-3 uppercase tracking-wider">
            <FileText size={20} className="text-[#C0A04C]" />
            Event Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <div>
              <label className="block text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2 mb-2 sm:mb-3">
                Event Name *
              </label>
              <input
                type="text"
                placeholder="Enter event name"
                {...register("name", { required: "Event name is required" })}
                className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-lg sm:rounded-xl text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 outline-none transition-all"
              />
              {errors.name && (
                <p className="text-rose-500 text-[8px] sm:text-xs mt-1.5 font-bold ml-2">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2 mb-2 sm:mb-3">
                Event Category *
              </label>
              <select
                {...register("eventCategory", { required: "Category is required" })}
                className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-lg sm:rounded-xl text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 outline-none transition-all appearance-none"
              >
                {EVENT_CATEGORIES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.eventCategory && (
                <p className="text-rose-500 text-[8px] sm:text-xs mt-1.5 font-bold ml-2">{errors.eventCategory.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2 mb-2 sm:mb-3">
                Event Type / Subtype
              </label>
              <input
                type="text"
                placeholder="e.g., formal dinner, product showcase"
                {...register("type")}
                className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-lg sm:rounded-xl text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2 mb-2 sm:mb-3">
                Event Banner Image
              </label>
              <div className="space-y-2 sm:space-y-3">
                {bannerPreview && (
                  <div className="relative">
                    <img 
                      src={bannerPreview} 
                      alt="Banner preview" 
                      className="w-full h-24 sm:h-32 object-cover rounded-lg sm:rounded-xl border border-[#3a1224]/5"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setBannerPreview(null);
                        setBannerFile(null);
                        setValue('bannerUrl', '');
                      }}
                      className="absolute top-2 right-2 p-1 sm:p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                      title="Remove banner"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                {!bannerPreview && (
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-3 sm:py-4 border-2 border-dashed border-[#C0A04C]/40 rounded-lg sm:rounded-xl bg-[#C0A04C]/5 hover:bg-[#C0A04C]/10 transition-colors">
                      <Upload size={16} className="text-[#C0A04C] flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-[#3a1224]/60 uppercase tracking-widest">
                        {bannerFile ? bannerFile.name : 'Upload Image'}
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
                )}

                {bannerFile && !bannerUploading && (
                  <button
                    type="button"
                    onClick={uploadBanner}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#3a1224] text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-[#3a1224]/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Upload size={14} />
                    Upload Banner
                  </button>
                )}

                {bannerUploading && (
                  <div className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#C0A04C]/10 text-[#C0A04C] rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-center uppercase animate-pulse">
                    Uploading...
                  </div>
                )}

                {bannerError && (
                  <p className="text-rose-500 text-xs font-bold">{bannerError}</p>
                )}

                <input type="hidden" {...register("bannerUrl")} value={bannerPreview || ""} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2 mb-2 sm:mb-3">
              Description *
            </label>
            <textarea
              rows={4}
              placeholder="Detailed event description, objectives, and key highlights..."
              {...register("description", { required: "Description is required" })}
              className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-lg sm:rounded-xl text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 outline-none transition-all resize-none"
            />
            {errors.description && (
              <p className="text-rose-500 text-[8px] sm:text-xs mt-1.5 font-bold ml-2">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2 mb-2 sm:mb-3">
              Event Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="wedding, celebration, formal, training, etc."
              {...register("tags")}
              className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-lg sm:rounded-xl text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 outline-none transition-all"
            />
            <p className="text-[8px] sm:text-[9px] text-[#3a1224]/50 font-semibold ml-2 mt-1.5">Add tags to help attendees find your event</p>
          </div>
        </div>
      )}

      {/* Timing Tab */}
      {activeTab === "timing" && (
        <div className="space-y-5 sm:space-y-6">
          <h3 className="text-lg sm:text-xl font-black text-[#3a1224] flex items-center gap-3 uppercase tracking-wider">
            <Calendar size={20} className="text-[#C0A04C]" />
            Event Timing & Registration
          </h3>

          {bookingDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 flex gap-3">
              <AlertCircle size={18} className="text-blue-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-black text-blue-900 uppercase tracking-widest">Event Date Locked to Booking</p>
                <p className="text-blue-800 mt-1 font-semibold">
                  Your event will be held on <strong>{new Date(bookingDate).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                </p>
              </div>
            </div>
          )}

          {bookingLoading && (
            <div className="bg-[#3a1224]/5 border border-[#3a1224]/10 rounded-lg sm:rounded-xl p-3 sm:p-4 text-[#3a1224]/60 text-xs sm:text-sm font-semibold">
              Loading booking details...
            </div>
          )}

          <div>
            <h4 className="font-black text-[#3a1224] text-sm sm:text-base uppercase tracking-widest mb-3 sm:mb-4">Event Times</h4>
            <p className="text-[9px] sm:text-[10px] font-bold text-[#3a1224]/50 uppercase tracking-widest ml-2 mb-4">Automatically set based on your booking slot</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <div>
                <label className="block text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2 mb-2 sm:mb-3">
                  Start Time
                </label>
                <div className="flex gap-3">
                  <input
                    type="time"
                    {...register("eventStartTime", { required: "Start time is required" })}
                    disabled={!!bookingSlot}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-lg sm:rounded-xl text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {bookingSlot && (
                    <div className="flex items-center px-4 bg-emerald-50 border border-emerald-200 rounded-lg sm:rounded-xl">
                      <span className="font-bold text-emerald-700 text-sm sm:text-base whitespace-nowrap">
                        {formatTime24to12(watch("eventStartTime"))}
                      </span>
                    </div>
                  )}
                </div>
                {errors.eventStartTime && (
                  <p className="text-rose-500 text-[8px] sm:text-xs mt-1.5 font-bold ml-2">{errors.eventStartTime.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2 mb-2 sm:mb-3">
                  End Time
                </label>
                <div className="flex gap-3">
                  <input
                    type="time"
                    {...register("eventEndTime", { required: "End time is required" })}
                    disabled={!!bookingSlot}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-lg sm:rounded-xl text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {bookingSlot && (
                    <div className="flex items-center px-4 bg-emerald-50 border border-emerald-200 rounded-lg sm:rounded-xl">
                      <span className="font-bold text-emerald-700 text-sm sm:text-base whitespace-nowrap">
                        {formatTime24to12(watch("eventEndTime"))}
                      </span>
                    </div>
                  )}
                </div>
                {errors.eventEndTime && (
                  <p className="text-rose-500 text-[8px] sm:text-xs mt-1.5 font-bold ml-2">{errors.eventEndTime.message}</p>
                )}
              </div>
            </div>
          </div>

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
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <p className="text-[9px] sm:text-xs font-black text-emerald-700 uppercase tracking-widest">Event Duration & Timing</p>
                <p className="text-lg sm:text-xl font-black text-emerald-600 mt-1">{duration}</p>
                <p className="text-sm text-emerald-700 font-semibold mt-2">
                  {formatTime24to12(startTime)} - {formatTime24to12(endTime)}
                </p>
              </div>
            ) : null;
          })()}

          <div className="border-t border-[#3a1224]/5 pt-4 sm:pt-5">
            <h4 className="font-black text-[#3a1224] text-sm sm:text-base uppercase tracking-widest mb-3 sm:mb-4">Registration Period</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <div>
                <label className="block text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2 mb-2 sm:mb-3">
                  Registration Opens
                </label>
                <input
                  type="date"
                  {...register("registrationStartDate")}
                  className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-lg sm:rounded-xl text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 outline-none transition-all"
                />
                <p className="text-[8px] sm:text-[9px] text-[#3a1224]/50 font-semibold ml-2 mt-1.5">When registration opens for attendees</p>
              </div>

              <div>
                <label className="block text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2 mb-2 sm:mb-3">
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
                  className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-lg sm:rounded-xl text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 outline-none transition-all"
                />
                {errors.registrationEndDate && (
                  <p className="text-rose-500 text-[8px] sm:text-xs mt-1.5 font-bold ml-2">{errors.registrationEndDate.message}</p>
                )}
                <p className="text-[8px] sm:text-[9px] text-[#3a1224]/50 font-semibold ml-2 mt-1.5">Must be before or on event date</p>
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

          {hallLocation ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex gap-3">
              <AlertCircle size={20} className="text-emerald-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800">
                Location is locked to your booked venue. You cannot change this location.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle size={20} className="text-blue-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Location will be automatically set once you select a booking
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                placeholder="e.g., Kathmandu"
                {...register("city")}
                disabled={!!hallLocation}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50"
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
                disabled={!!hallLocation}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50"
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
                disabled={!!hallLocation}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50"
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
            Special Requirements
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
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
