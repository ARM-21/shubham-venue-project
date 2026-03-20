"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";
import toast from "react-hot-toast";

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
  } catch {
    return "-";
  }
}

export default function OrganizerEventCreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const isOrganizer = Boolean(user?.isOrganizerEligible) || user?.role?.toLowerCase?.() === "admin";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      bookingId: "",
      name: "",
      type: "",
      description: "",
      visibility: "public",
      accessCode: "",
      bannerUrl: "",
      startDateTime: "",
      endDateTime: "",
    },
  });

  const visibility = watch("visibility");
  const selectedBookingId = watch("bookingId");

  useEffect(() => {
    let ignore = false;
    async function fetchBookings() {
      try {
        setLoadingBookings(true);
        const res = await axiosInstance.get(ROUTES.API.ORGANIZER.BOOKINGS, { params: { eligibleForEvent: true } });
        if (!ignore) setBookings(res.data?.bookings || []);
      } catch (err) {
        if (!ignore) toast.error(err?.response?.data?.message || "Failed to load eligible bookings");
      } finally {
        if (!ignore) setLoadingBookings(false);
      }
    }

    if (isOrganizer) fetchBookings();

    return () => {
      ignore = true;
    };
  }, [isOrganizer]);

  const selectedBooking = useMemo(() => bookings.find((b) => String(b._id) === String(selectedBookingId)), [bookings, selectedBookingId]);

  async function onSubmit(values) {
    const payload = {
      bookingId: values.bookingId,
      name: values.name?.trim(),
      type: values.type?.trim(),
      description: values.description?.trim(),
      isPublic: values.visibility === "public",
      accessCode: values.visibility === "private" ? values.accessCode?.trim() : null,
      bannerUrl: values.bannerUrl?.trim(),
      startDateTime: values.startDateTime || undefined,
      endDateTime: values.endDateTime || undefined,
    };

    try {
      const res = await axiosInstance.post(ROUTES.API.ORGANIZER.EVENTS, payload);
      toast.success("Event created");
      const id = res.data?.event?._id;
      if (id) {
        router.push(ROUTES.SITE.ORGANIZER_EVENT_DETAIL(id));
      } else {
        router.push(ROUTES.SITE.ORGANIZER_EVENTS);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create event");
    }
  }

  if (!isOrganizer) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900">Organizer access required</h2>
        <p className="text-sm text-gray-600 mt-2">Submit your organizer request to unlock event creation.</p>
        <button
          onClick={() => router.push(ROUTES.SITE.ORGANIZER)}
          className="mt-4 px-4 py-2 bg-[#8B0000] text-white rounded-lg text-sm font-semibold"
        >
          Go to Organizer Hub
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-900">Create a New Event</h1>
        <p className="text-sm text-gray-600 mt-2">Select a confirmed booking and add event details.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
        <div>
          <label className="text-sm font-medium">Booking *</label>
          <select
            {...register("bookingId", { required: "Booking is required" })}
            className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select booking</option>
            {bookings.map((booking) => (
              <option key={booking._id} value={booking._id}>
                {booking.hallId?.name || "Hall"} - {formatDate(booking.date)} ({booking.slot})
              </option>
            ))}
          </select>
          {loadingBookings && <p className="text-xs text-gray-500 mt-2">Loading bookings...</p>}
          {!loadingBookings && bookings.length === 0 && (
            <p className="text-xs text-gray-500 mt-2">No eligible bookings found.</p>
          )}
          {errors.bookingId && <p className="text-xs text-red-600 mt-1">{errors.bookingId.message}</p>}
        </div>

        {selectedBooking && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
            <p><span className="font-semibold">Hall:</span> {selectedBooking.hallId?.name || "Hall"}</p>
            <p><span className="font-semibold">Date:</span> {formatDate(selectedBooking.date)} · {selectedBooking.slot}</p>
            <p><span className="font-semibold">Guests:</span> {selectedBooking.guests}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Event name *</label>
            <input
              {...register("name", { required: "Event name is required" })}
              className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Event name"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Event type</label>
            <input
              {...register("type")}
              className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Wedding, conference, etc."
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            {...register("description")}
            className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            rows={4}
            placeholder="Describe your event"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Visibility</label>
            <select
              {...register("visibility")}
              className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Access code</label>
            <input
              {...register("accessCode", {
                validate: (value) => {
                  if (visibility !== "private") return true;
                  return value && value.trim().length >= 4 ? true : "Access code must be at least 4 characters";
                },
              })}
              className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Only required for private events"
            />
            {errors.accessCode && <p className="text-xs text-red-600 mt-1">{errors.accessCode.message}</p>}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Banner URL</label>
          <input
            {...register("bannerUrl")}
            className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="https://..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Start date/time</label>
            <input
              type="datetime-local"
              {...register("startDateTime")}
              className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">End date/time</label>
            <input
              type="datetime-local"
              {...register("endDateTime")}
              className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#8B0000] text-white rounded-lg text-sm font-semibold hover:bg-[#A52A2A] transition disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create Event"}
          </button>
          <button
            type="button"
            onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENTS)}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
