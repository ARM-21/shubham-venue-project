"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, Calendar, ClipboardList, Eye, FileText, MapPin, Trash2, Upload, UtensilsCrossed, Users } from "lucide-react";
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

function deriveEventTimeRange(slot) {
  if (slot === "morning") return { startTime: "07:00", endTime: "12:00", displayStartTime: "7:00 AM", displayEndTime: "12:00 PM" };
  if (slot === "afternoon") return { startTime: "13:00", endTime: "18:00", displayStartTime: "1:00 PM", displayEndTime: "6:00 PM" };
  if (slot === "evening") return { startTime: "19:00", endTime: "22:30", displayStartTime: "7:00 PM", displayEndTime: "10:30 PM" };
  if (slot === "wholeday") return { startTime: "07:00", endTime: "22:30", displayStartTime: "7:00 AM", displayEndTime: "10:30 PM" };
  return { startTime: "", endTime: "", displayStartTime: "", displayEndTime: "" };
}

function formatTime24to12(time24) {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

function dateInputValue(value) {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
}

function readHallLocation(hall) {
  if (!hall) return { city: "", state: "", country: "" };
  return {
    city: hall.location?.city || hall.city || "",
    state: hall.location?.state || hall.state || "",
    country: hall.location?.country || hall.country || "",
  };
}

export default function ProfessionalEventForm({ initialData = null, booking = null, onSubmit, isLoading = false }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [bannerPreview, setBannerPreview] = useState(initialData?.bannerUrl || "");
  const [bannerError, setBannerError] = useState(null);
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingSlot, setBookingSlot] = useState(null);
  const [hallLocation, setHallLocation] = useState(null);
  const [hallCapacity, setHallCapacity] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [menuPackages, setMenuPackages] = useState([]);
  const [menusLoading, setMenusLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "",
      description: initialData?.description || "",
      eventCategory: initialData?.eventCategory || "OTHER",
      bannerUrl: initialData?.bannerUrl || "",
      eventStartTime: initialData?.startDateTime ? new Date(initialData.startDateTime).toISOString().slice(11, 16) : "",
      eventEndTime: initialData?.endDateTime ? new Date(initialData.endDateTime).toISOString().slice(11, 16) : "",
      registrationStartDate: initialData?.registrationStartDate ? new Date(initialData.registrationStartDate).toISOString().slice(0, 10) : "",
      registrationEndDate: initialData?.registrationEndDate ? new Date(initialData.registrationEndDate).toISOString().slice(0, 10) : "",
      maxAttendees: initialData?.maxAttendees || "",
      expectedAttendees: initialData?.expectedAttendees || "",
      targetAudience: initialData?.targetAudience || "",
      dressCode: initialData?.dressCode || "",
      ageRestriction: initialData?.ageRestriction || "",
      tags: initialData?.tags?.join(", ") || "",
      city: initialData?.location?.city || "",
      state: initialData?.location?.state || "",
      country: initialData?.location?.country || "",
      specialRequirements: initialData?.specialRequirements || "",
      cateringPlan: initialData?.cateringPlan || (initialData?.catering ? (initialData?.cateringMenus?.length ? "choose_now" : "decide_later") : "none"),
      cateringMenuId: initialData?.cateringMenus?.[0]?._id || initialData?.cateringMenus?.[0] || "",
      cateringGuestCount: initialData?.cateringGuestCount || initialData?.expectedAttendees || "",
      cateringServiceTime: initialData?.cateringServiceTime || "",
      cateringNotes: initialData?.cateringNotes || "",
      decoration: initialData?.decoration || false,
      requiresTicket: initialData?.requiresTicket !== false,
      visibility: initialData?.isPublic ? "public" : "private",
      accessCode: initialData?.accessCode || "",
    },
  });

  const visibility = watch("visibility");
  const maxAttendees = watch("maxAttendees");
  const expectedAttendees = watch("expectedAttendees");
  const bannerUrl = watch("bannerUrl");
  const registrationStartDate = watch("registrationStartDate");
  const cateringPlan = watch("cateringPlan");
  const todayDate = dateInputValue(new Date());
  const bookingDateInput = dateInputValue(bookingDate);

  useEffect(() => {
    if (cateringPlan !== "choose_now" || menuPackages.length) return;
    let ignore = false;
    setMenusLoading(true);
    axiosInstance
      .get(ROUTES.API.MENUS.ROOT)
      .then((res) => {
        const menus = res.data?.menus || res.data?.data || (Array.isArray(res.data) ? res.data : []);
        if (!ignore) setMenuPackages(menus.filter((menu) => menu.isActive !== false));
      })
      .catch(() => {
        if (!ignore) toast.error("Could not load menu packages");
      })
      .finally(() => {
        if (!ignore) setMenusLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [cateringPlan, menuPackages.length]);

  useEffect(() => {
    const bookingId = initialData?.bookingId || booking?._id;
    if (!bookingId) return;

    setBookingDate(null);
    setBookingSlot(null);
    setHallLocation(null);
    setHallCapacity(null);

    const applyBooking = (bookingPayload) => {
      if (!bookingPayload) return;
      if (bookingPayload.date) setBookingDate(bookingPayload.date);
      const slot = bookingPayload.slot;
      setBookingSlot(slot);
      const timeRange = deriveEventTimeRange(slot);
      if (timeRange.startTime && timeRange.endTime) {
        setValue("eventStartTime", timeRange.startTime);
        setValue("eventEndTime", timeRange.endTime);
      }

      const embeddedHall = typeof bookingPayload.hallId === "object" ? bookingPayload.hallId : null;
      if (embeddedHall) {
        const location = readHallLocation(embeddedHall);
        setHallCapacity(embeddedHall.capacity || null);
        if (location.city || location.state || location.country) {
          setHallLocation(location);
          setValue("city", location.city);
          setValue("state", location.state);
          setValue("country", location.country);
        }
      }
    };

    applyBooking(booking);

    if (bookingId) {
      setBookingLoading(true);
      axiosInstance
        .get(`/api/v1/bookings/${bookingId}`)
        .then((res) => {
          const bookingPayload = res.data?.booking;
          applyBooking(bookingPayload);

          if (bookingPayload?.hallId?._id || bookingPayload?.hallId || booking?.hallId?._id || booking?.hallId) {
            const embeddedHall = typeof bookingPayload?.hallId === "object" ? bookingPayload.hallId : typeof booking?.hallId === "object" ? booking.hallId : null;
            const embeddedLocation = readHallLocation(embeddedHall);
            if (embeddedLocation.city || embeddedLocation.state || embeddedLocation.country) {
              setHallLocation(embeddedLocation);
              setHallCapacity(embeddedHall?.capacity || null);
              setValue("city", embeddedLocation.city);
              setValue("state", embeddedLocation.state);
              setValue("country", embeddedLocation.country);
            } else {
              const hallId = bookingPayload?.hallId?._id || bookingPayload?.hallId || booking?.hallId?._id || booking?.hallId;
              axiosInstance
                .get(`/api/v1/halls/${hallId}`)
                .then((hallRes) => {
                  const hall = hallRes.data?.hall || hallRes.data?.data;
                  if (hall) {
                    const location = readHallLocation(hall);
                    setHallLocation(location);
                    setHallCapacity(hall.capacity || null);
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
  }, [initialData?.bookingId, booking, setValue]);

  useEffect(() => {
    if (bannerUrl && bannerUrl !== bannerPreview) setBannerPreview(bannerUrl);
  }, [bannerUrl, bannerPreview]);

  const tabs = [
    { id: "basic", label: "Basics", icon: FileText },
    { id: "timing", label: "Timing", icon: Calendar },
    { id: "attendance", label: "Audience", icon: Users },
    { id: "location", label: "Location", icon: MapPin },
    { id: "requirements", label: "Services", icon: ClipboardList },
    { id: "visibility", label: "Access", icon: Eye },
  ];

  const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const activeMeta = tabs[currentIndex] || tabs[0];

  const handleBannerChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setBannerError("Image must be less than 5MB");
      toast.error("Image must be less than 5MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      setBannerError("Only JPG, PNG, GIF, or WEBP allowed");
      toast.error("Only JPG, PNG, GIF, or WEBP allowed");
      return;
    }
    setBannerError("Image preview only. Add a hosted image URL if you want this saved now.");
    const reader = new FileReader();
    reader.onloadend = () => setBannerPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (data) => {
    if (!data.eventStartTime || !data.eventEndTime) {
      toast.error("Event start and end times are required");
      return;
    }
    if (data.eventStartTime >= data.eventEndTime) {
      toast.error("Event start time must be before end time");
      return;
    }
    if (data.registrationStartDate && data.registrationEndDate && new Date(data.registrationStartDate) > new Date(data.registrationEndDate)) {
      toast.error("Registration start date must be before end date");
      return;
    }
    if (data.registrationStartDate && dateInputValue(data.registrationStartDate) < todayDate) {
      toast.error("Registration cannot open before today");
      return;
    }
    if (data.registrationEndDate && dateInputValue(data.registrationEndDate) < todayDate) {
      toast.error("Registration cannot close before today");
      return;
    }
    if (data.registrationEndDate && bookingDate && new Date(data.registrationEndDate) > new Date(bookingDate)) {
      toast.error("Registration must end before or on event date");
      return;
    }

    const maxAttendeesNum = data.maxAttendees ? parseInt(data.maxAttendees) : null;
    const expectedAttendeesNum = data.expectedAttendees ? parseInt(data.expectedAttendees) : null;

    if (hallCapacity) {
      if (maxAttendeesNum && maxAttendeesNum > hallCapacity) {
        toast.error(`Maximum attendees (${maxAttendeesNum}) cannot exceed hall capacity (${hallCapacity})`);
        return;
      }
      if (expectedAttendeesNum && expectedAttendeesNum > hallCapacity) {
        toast.error(`Expected attendees (${expectedAttendeesNum}) cannot exceed hall capacity (${hallCapacity})`);
        return;
      }
    }
    if (maxAttendeesNum && expectedAttendeesNum && expectedAttendeesNum > maxAttendeesNum) {
      toast.error("Expected attendees cannot exceed maximum attendees");
      return;
    }
    if (data.cateringPlan === "choose_now" && !data.cateringMenuId) {
      toast.error("Choose a menu package or select Decide later");
      return;
    }
    const cateringGuestCount = data.cateringGuestCount ? parseInt(data.cateringGuestCount) : expectedAttendeesNum || maxAttendeesNum || null;
    if (data.cateringPlan !== "none" && cateringGuestCount !== null && cateringGuestCount < 0) {
      toast.error("Catering guest count cannot be negative");
      return;
    }

    let startDateTime = null;
    let endDateTime = null;
    if (data.eventStartTime && bookingDate) {
      const bookDateStr = new Date(bookingDate).toISOString().split("T")[0];
      startDateTime = `${bookDateStr}T${data.eventStartTime}:00`;
    }
    if (data.eventEndTime && bookingDate) {
      const bookDateStr = new Date(bookingDate).toISOString().split("T")[0];
      endDateTime = `${bookDateStr}T${data.eventEndTime}:00`;
    }

    if (onSubmit) {
      await onSubmit({
        ...data,
        startDateTime,
        endDateTime,
        eventDate: bookingDate,
        tags: data.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        isPublic: visibility === "public",
        maxAttendees: maxAttendeesNum,
        expectedAttendees: expectedAttendeesNum,
        catering: data.cateringPlan !== "none",
        cateringPlan: data.cateringPlan,
        cateringMenus: data.cateringPlan === "choose_now" && data.cateringMenuId ? [data.cateringMenuId] : [],
        cateringGuestCount: data.cateringPlan === "none" ? null : cateringGuestCount,
        cateringServiceTime: data.cateringPlan === "none" ? "" : data.cateringServiceTime?.trim(),
        cateringNotes: data.cateringPlan === "none" ? "" : data.cateringNotes?.trim(),
        location: {
          city: data.city || null,
          state: data.state || null,
          country: data.country || null,
        },
      });
    }
  };

  const goNext = () => setActiveTab(tabs[Math.min(currentIndex + 1, tabs.length - 1)].id);
  const goPrev = () => setActiveTab(tabs[Math.max(currentIndex - 1, 0)].id);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="border border-[#e8dcc8] bg-[#fbf8f2] p-4 lg:sticky lg:top-24 lg:self-start">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#3a1224]/42">Listing steps</p>
        <div className="mt-4 space-y-1">
          {tabs.map(({ id, label, icon: Icon }, index) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex w-full items-center gap-3 border px-3 py-3 text-left transition ${
                  active ? "border-[#3a1224] bg-white text-[#3a1224]" : "border-transparent text-[#3a1224]/55 hover:bg-white/70"
                }`}
              >
                <span className={`flex h-7 w-7 items-center justify-center text-xs font-black ${active ? "bg-[#3a1224] text-white" : "bg-white text-[#3a1224]/45"}`}>
                  {index + 1}
                </span>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-sm font-black">{label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-5 border-t border-[#e8dcc8] pt-4">
          <p className="text-xs font-bold leading-5 text-[#3a1224]/48">
            The booking controls date and venue. This form only shapes the guest-facing listing.
          </p>
        </div>
      </aside>

      <section className="border border-[#e8dcc8] bg-white">
        <div className="border-b border-[#e8dcc8] px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#C0A04C]">Step {currentIndex + 1} of {tabs.length}</p>
          <h3 className="mt-1 text-xl font-black text-[#3a1224]">{activeMeta.label}</h3>
        </div>

        <div className="p-5">
          {activeTab === "basic" && (
            <div className="space-y-5">
              <FieldGrid>
                <TextField label="Event name" required error={errors.name?.message}>
                  <input {...register("name", { required: "Event name is required" })} placeholder="e.g., Product launch evening" className={inputClass} />
                </TextField>
                <TextField label="Event category" required error={errors.eventCategory?.message}>
                  <select {...register("eventCategory", { required: "Category is required" })} className={inputClass}>
                    {EVENT_CATEGORIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </TextField>
                <TextField label="Subtype">
                  <input {...register("type")} placeholder="e.g., formal dinner, workshop" className={inputClass} />
                </TextField>
                <TextField label="Banner image">
                  <div className="space-y-3">
                    {bannerPreview ? (
                      <div className="overflow-hidden border border-[#e8dcc8]">
                        <img src={bannerPreview} alt="Banner preview" className="h-28 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setBannerPreview("");
                            setValue("bannerUrl", "");
                            setBannerError(null);
                          }}
                          className="flex w-full items-center justify-center gap-2 border-t border-[#e8dcc8] bg-white px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove preview
                        </button>
                      </div>
                    ) : null}
                    <label className="flex h-11 cursor-pointer items-center justify-center gap-2 border border-dashed border-[#e8dcc8] bg-[#fbf8f2] text-sm font-bold text-[#3a1224]/60 hover:bg-white">
                      <Upload className="h-4 w-4" />
                      Preview image
                      <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                    </label>
                    <input {...register("bannerUrl")} placeholder="Hosted banner URL, optional" className={inputClass} />
                    {bannerError && <p className="text-xs font-bold text-amber-700">{bannerError}</p>}
                  </div>
                </TextField>
              </FieldGrid>

              <TextField label="Description" required error={errors.description?.message}>
                <textarea {...register("description", { required: "Description is required" })} rows={5} placeholder="Explain what guests will attend, who it is for, and what they should expect." className={`${inputClass} h-auto resize-none py-3 leading-6`} />
              </TextField>

              <TextField label="Tags">
                <input {...register("tags")} placeholder="workshop, networking, dinner" className={inputClass} />
                <p className="mt-1 text-xs text-[#3a1224]/42">Separate tags with commas.</p>
              </TextField>
            </div>
          )}

          {activeTab === "timing" && (
            <div className="space-y-5">
              {bookingDate && <InfoBox title="Event date locked to booking" text={`This event will be held on ${formatDate(bookingDate)}.`} tone="blue" />}
              {bookingLoading && <InfoBox title="Loading booking details" text="We are reading the venue booking date and slot." />}

              <FieldGrid>
                <TextField label="Start time" error={errors.eventStartTime?.message}>
                  <div className="flex gap-2">
                    <input type="time" {...register("eventStartTime", { required: "Start time is required" })} disabled={!!bookingSlot} className={inputClass} />
                    {bookingSlot && <TimeBadge value={formatTime24to12(watch("eventStartTime"))} />}
                  </div>
                </TextField>
                <TextField label="End time" error={errors.eventEndTime?.message}>
                  <div className="flex gap-2">
                    <input type="time" {...register("eventEndTime", { required: "End time is required" })} disabled={!!bookingSlot} className={inputClass} />
                    {bookingSlot && <TimeBadge value={formatTime24to12(watch("eventEndTime"))} />}
                  </div>
                </TextField>
                <TextField label="Registration opens">
                  <input
                    type="date"
                    {...register("registrationStartDate")}
                    min={todayDate}
                    max={bookingDateInput || undefined}
                    className={inputClass}
                  />
                </TextField>
                <TextField label="Registration closes" required error={errors.registrationEndDate?.message}>
                  <input
                    type="date"
                    {...register("registrationEndDate", {
                      required: "Registration close date is required",
                      validate: (value) => {
                        if (!value || !bookingDate) return true;
                        if (dateInputValue(value) < todayDate) return "Registration cannot close before today";
                        if (registrationStartDate && new Date(value) < new Date(registrationStartDate)) return "Registration cannot close before it opens";
                        if (new Date(value) > new Date(bookingDate)) return "Registration cannot close after event date";
                        return true;
                      },
                    })}
                    min={registrationStartDate || todayDate}
                    max={bookingDateInput || undefined}
                    className={inputClass}
                  />
                </TextField>
              </FieldGrid>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="space-y-5">
              {hallCapacity && <InfoBox title={`Hall capacity: ${hallCapacity}`} text="Maximum and expected attendees cannot exceed this capacity." tone="blue" />}
              <FieldGrid>
                <TextField label="Maximum attendees">
                  <input type="number" min="1" max={hallCapacity || undefined} {...register("maxAttendees")} className={inputClass} />
                  {maxAttendees && hallCapacity && parseInt(maxAttendees) > hallCapacity && <p className="mt-1 text-xs font-bold text-red-600">Exceeds hall capacity.</p>}
                </TextField>
                <TextField label="Expected attendees">
                  <input type="number" min="0" max={hallCapacity || undefined} {...register("expectedAttendees")} className={inputClass} />
                  {expectedAttendees && maxAttendees && parseInt(expectedAttendees) > parseInt(maxAttendees) && <p className="mt-1 text-xs font-bold text-red-600">Cannot exceed maximum attendees.</p>}
                </TextField>
                <TextField label="Target audience">
                  <input {...register("targetAudience")} placeholder="e.g., corporate professionals, families" className={inputClass} />
                </TextField>
                <TextField label="Dress code">
                  <select {...register("dressCode")} className={inputClass}>
                    <option value="">Not specified</option>
                    <option value="casual">Casual</option>
                    <option value="business_casual">Business Casual</option>
                    <option value="business">Business Formal</option>
                    <option value="black_tie">Black Tie</option>
                    <option value="custom">Custom</option>
                  </select>
                </TextField>
                <TextField label="Age restriction">
                  <input {...register("ageRestriction")} placeholder="e.g., 18+, 21+, or All ages" className={inputClass} />
                </TextField>
              </FieldGrid>
            </div>
          )}

          {activeTab === "location" && (
            <div className="space-y-5">
              <InfoBox
                title={hallLocation ? "Location locked to booked venue" : "Location comes from booking"}
                text={hallLocation ? "The event location is inherited from the selected venue booking." : "Location details will fill in once booking details load."}
                tone={hallLocation ? "green" : "blue"}
              />
              <FieldGrid>
                <TextField label="City">
                  <input {...register("city")} disabled={!!hallLocation} className={inputClass} />
                </TextField>
                <TextField label="State / province">
                  <input {...register("state")} disabled={!!hallLocation} className={inputClass} />
                </TextField>
                <TextField label="Country">
                  <input {...register("country")} disabled={!!hallLocation} className={inputClass} />
                </TextField>
              </FieldGrid>
            </div>
          )}

          {activeTab === "requirements" && (
            <div className="space-y-5">
              <TextField label="Venue notes">
                <textarea {...register("specialRequirements")} rows={5} placeholder="Any special arrangements, setup notes, accessibility needs, or venue staff instructions." className={`${inputClass} h-auto resize-none py-3 leading-6`} />
              </TextField>
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">Catering plan</p>
                <div className="grid gap-3 lg:grid-cols-3">
                  <RadioCard register={register} active={cateringPlan === "none"} name="cateringPlan" value="none" title="No catering" text="This event does not need venue catering." />
                  <RadioCard register={register} active={cateringPlan === "choose_now"} name="cateringPlan" value="choose_now" title="Choose menu now" text="Select a package and send it with the event setup." />
                  <RadioCard register={register} active={cateringPlan === "decide_later"} name="cateringPlan" value="decide_later" title="Decide later" text="Create the event first and request catering later." />
                </div>
              </div>
              {cateringPlan === "choose_now" && (
                <div className="border border-[#e8dcc8] bg-[#fbf8f2] p-4">
                  <div className="mb-4 flex items-start gap-3">
                    <UtensilsCrossed className="mt-0.5 h-5 w-5 text-[#3a1224]/45" />
                    <div>
                      <p className="text-sm font-black text-[#3a1224]">Menu package request</p>
                      <p className="mt-1 text-xs leading-5 text-[#3a1224]/50">This records the organizer's catering request. Venue/admin confirmation can still happen before payment or service delivery.</p>
                    </div>
                  </div>
                  <FieldGrid>
                    <TextField label="Menu package">
                      <select {...register("cateringMenuId")} className={inputClass} disabled={menusLoading}>
                        <option value="">{menusLoading ? "Loading packages..." : "Select a package"}</option>
                        {menuPackages.map((menu) => (
                          <option key={menu._id} value={menu._id}>
                            {menu.name} - NPR {Number(menu.pricePerPerson || 0).toLocaleString()} / person
                          </option>
                        ))}
                      </select>
                    </TextField>
                    <TextField label="Catering guests">
                      <input type="number" min="0" max={hallCapacity || undefined} {...register("cateringGuestCount")} placeholder={expectedAttendees || maxAttendees || "Estimated count"} className={inputClass} />
                    </TextField>
                    <TextField label="Service time">
                      <input type="time" {...register("cateringServiceTime")} className={inputClass} />
                    </TextField>
                  </FieldGrid>
                </div>
              )}
              {cateringPlan === "decide_later" && (
                <InfoBox title="Catering can be requested later" text="The event will be created without menu pricing. Add a catering request from event services once the plan is clearer." tone="blue" />
              )}
              {cateringPlan !== "none" && (
                <TextField label="Catering notes">
                  <textarea {...register("cateringNotes")} rows={3} placeholder="Dietary notes, preferred service style, or timing requirements." className={`${inputClass} h-auto resize-none py-3 leading-6`} />
                </TextField>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <CheckOption register={register} name="decoration" label="Decoration needed" />
                <CheckOption register={register} name="requiresTicket" label="Tickets required" />
              </div>
            </div>
          )}

          {activeTab === "visibility" && (
            <div className="space-y-5">
              <div className="grid gap-3 md:grid-cols-2">
                <RadioCard register={register} active={visibility === "public"} value="public" title="Public event" text="Visible in event discovery and open for registration." />
                <RadioCard register={register} active={visibility === "private"} value="private" title="Private event" text="Only guests with the access code can open it." />
              </div>
              {visibility === "private" && (
                <TextField label="Access code">
                  <input {...register("accessCode")} placeholder="e.g., WEDDING2026" className={inputClass} />
                </TextField>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#e8dcc8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button type="button" onClick={goPrev} disabled={currentIndex === 0} className="h-10 border border-[#e8dcc8] px-4 text-sm font-bold text-[#3a1224] hover:bg-[#fbf8f2] disabled:opacity-40">Back</button>
            <button type="button" onClick={goNext} disabled={currentIndex === tabs.length - 1} className="h-10 border border-[#e8dcc8] px-4 text-sm font-bold text-[#3a1224] hover:bg-[#fbf8f2] disabled:opacity-40">Next</button>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => window.history.back()} className="h-10 border border-[#e8dcc8] px-4 text-sm font-bold text-[#3a1224]/65 hover:bg-[#fbf8f2]">Cancel</button>
            <button type="submit" disabled={isLoading} className="h-10 bg-[#3a1224] px-5 text-sm font-bold text-white hover:bg-[#4b1830] disabled:opacity-50">
              {isLoading ? "Saving..." : initialData ? "Update event" : "Create event"}
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}

const inputClass = "h-11 w-full border border-[#e8dcc8] bg-white px-3 text-sm font-bold text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15 disabled:cursor-not-allowed disabled:bg-[#fbf8f2] disabled:text-[#3a1224]/45";

function FieldGrid({ children }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function TextField({ label, required, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">
        {label}{required ? " *" : ""}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-bold text-red-600">{error}</span>}
    </label>
  );
}

function InfoBox({ title, text, tone = "neutral" }) {
  const tones = {
    neutral: "border-[#e8dcc8] bg-[#fbf8f2] text-[#3a1224]",
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };
  return (
    <div className={`flex gap-3 border p-4 ${tones[tone]}`}>
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-black">{title}</p>
        <p className="mt-1 text-sm leading-6 opacity-80">{text}</p>
      </div>
    </div>
  );
}

function TimeBadge({ value }) {
  return <span className="flex h-11 shrink-0 items-center border border-emerald-200 bg-emerald-50 px-3 text-sm font-black text-emerald-700">{value}</span>;
}

function CheckOption({ register, name, label }) {
  return (
    <label className="flex items-center gap-3 border border-[#e8dcc8] bg-[#fbf8f2] px-4 py-3">
      <input type="checkbox" {...register(name)} className="h-4 w-4 accent-[#3a1224]" />
      <span className="text-sm font-bold text-[#3a1224]">{label}</span>
    </label>
  );
}

function RadioCard({ register, active, value, title, text, name = "visibility" }) {
  return (
    <label className={`flex cursor-pointer gap-3 border p-4 ${active ? "border-[#3a1224] bg-[#fbf8f2]" : "border-[#e8dcc8] bg-white"}`}>
      <input type="radio" value={value} {...register(name)} className="mt-1 h-4 w-4 accent-[#3a1224]" />
      <span>
        <span className="block text-sm font-black text-[#3a1224]">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-[#3a1224]/50">{text}</span>
      </span>
    </label>
  );
}
