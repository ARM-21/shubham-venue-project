"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";
import ProfessionalEventForm from "components/organizer/ProfessionalEventForm";
import { ORGANIZER_EVENTS_QUERY_KEY } from "@api/organizer/events-list-fetcher";
import { AlertCircle, CalendarDays, Fingerprint, MapPin, Users, Zap } from "lucide-react";

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("en-GB", { 
      year: "numeric", 
      month: "short", 
      day: "numeric",
      weekday: "short"
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

export default function OrganizerEventCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const preselectedBookingId = searchParams.get("bookingId") || "";
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [preselectedNotFound, setPreselectedNotFound] = useState(false);
  const [status, setStatus] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchStatus() {
      try {
        const res = await axiosInstance.get(ROUTES.API.ORGANIZER_REQUESTS.ME);
        if (!ignore) setStatus(res.data || null);
      } catch (err) {
        if (!ignore) setStatus(null);
      }
    }
    if (user) fetchStatus();
    return () => { ignore = true; };
  }, [user]);

  const statusValue = String(status?.organizerStatus || (user?.isOrganizerEligible ? "approved" : user?.organizerStatus || "none")).toLowerCase();
  const isApproved = status?.isOrganizerEligible || statusValue === "approved" || user?.isOrganizerEligible;

  useEffect(() => {
    let ignore = false;
    async function fetchBookings() {
      try {
        setLoadingBookings(true);
        const res = await axiosInstance.get(ROUTES.API.ORGANIZER.BOOKINGS, { params: { eligibleForEvent: true } });
        const fetched = res.data?.bookings || [];
        if (!ignore) {
          setBookings(fetched);
          if (preselectedBookingId) {
            const match = fetched.find((b) => String(b._id) === String(preselectedBookingId));
            if (match) {
              setSelectedBookingId(preselectedBookingId);
            } else {
              setPreselectedNotFound(true);
            }
          }
        }
      } catch (err) {
        if (!ignore) toast.error(err?.response?.data?.message || "Failed to load eligible bookings");
      } finally {
        if (!ignore) setLoadingBookings(false);
      }
    }

    if (isApproved) fetchBookings();

    return () => {
      ignore = true;
    };
  }, [isApproved]);

  const selectedBooking = bookings.find((b) => String(b._id) === String(selectedBookingId));

  async function onFormSubmit(formData) {
    if (!selectedBookingId) {
      toast.error("Please select a booking first");
      return;
    }

    // Get hallId from selected booking
    const booking = bookings.find((b) => String(b._id) === String(selectedBookingId));
    const hallId = booking?.hallId?._id || booking?.hallId;
    
    if (!hallId) {
      toast.error("Hall information not found in booking");
      return;
    }

    const payload = {
      bookingId: selectedBookingId,
      hallId: hallId,  // Now explicitly sending hallId
      name: formData.name?.trim(),
      type: formData.type?.trim(),
      description: formData.description?.trim(),
      eventCategory: formData.eventCategory,
      tags: formData.tags || [],
      isPublic: formData.isPublic,
      accessCode: formData.isPublic ? null : formData.accessCode?.trim(),
      bannerUrl: formData.bannerUrl?.trim(),
      startDateTime: formData.startDateTime || undefined,
      endDateTime: formData.endDateTime || undefined,
      eventDate: formData.eventDate || undefined,
      registrationStartDate: formData.registrationStartDate || undefined,
      registrationEndDate: formData.registrationEndDate || undefined,
      maxAttendees: formData.maxAttendees || undefined,
      expectedAttendees: formData.expectedAttendees || undefined,
      targetAudience: formData.targetAudience?.trim(),
      dressCode: formData.dressCode,
      ageRestriction: formData.ageRestriction?.trim(),
      specialRequirements: formData.specialRequirements?.trim(),
      catering: formData.catering || false,
      cateringPlan: formData.cateringPlan || "none",
      cateringMenus: formData.cateringMenus || [],
      cateringGuestCount: formData.cateringGuestCount || undefined,
      cateringServiceTime: formData.cateringServiceTime || "",
      cateringNotes: formData.cateringNotes || "",
      decoration: formData.decoration || false,
      requiresTicket: formData.requiresTicket !== false,
      location: {
        city: formData.city?.trim(),
        state: formData.state?.trim(),
        country: formData.country?.trim(),
      },
    };

    try {
      setIsCreating(true);
      const res = await axiosInstance.post(ROUTES.API.ORGANIZER.EVENTS, payload);
      
      // Check if event is pending approval or published
      const eventStatus = res.data?.event?.status;
      if (eventStatus === "PENDING_REVIEW") {
        toast.success("Event created! Awaiting admin approval before publication.");
      } else if (eventStatus === "PUBLISHED") {
        toast.success("Event created and published successfully!");
      } else {
        toast.success("Event created successfully");
      }
      
      queryClient.invalidateQueries({ queryKey: [ORGANIZER_EVENTS_QUERY_KEY] });

      const id = res.data?.event?._id;
      if (id) {
        router.push(ROUTES.SITE.ORGANIZER_EVENT_DETAIL(id));
      } else {
        router.push(ROUTES.SITE.ORGANIZER_EVENTS);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create event");
    } finally {
      setIsCreating(false);
    }
  }

  if (!isApproved) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-md border border-[#e8dcc8] bg-white p-8 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-[#e8dcc8] bg-[#fbf8f2]">
            <Fingerprint className="w-8 sm:w-10 h-8 sm:h-10 text-[#3a1224]" />
          </div>
          <h2 className="text-2xl font-black text-[#3a1224]">Verification required</h2>
          <p className="mt-3 text-sm leading-6 text-[#3a1224]/60">
            You need verified organizer access before creating events. Check your application status on the dashboard.
          </p>
          <button
            onClick={() => router.push(ROUTES.SITE.ORGANIZER)}
            className="mt-7 w-full cursor-pointer bg-[#3a1224] px-6 py-3 text-sm font-bold text-white hover:bg-[#4b1830]"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 pb-12">
      <header className="overflow-hidden border border-[#e8dcc8] bg-white">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="px-5 py-6 sm:px-7 lg:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">Create event</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-[#3a1224] sm:text-4xl">Turn a confirmed venue booking into a public event.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#3a1224]/58">
              Start with the booking so the date, venue, and capacity are trustworthy. Then shape the listing guests will actually read.
            </p>
          </div>
          <div className="border-t border-[#e8dcc8] bg-[#fbf8f2] p-5 lg:border-l lg:border-t-0 lg:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#3a1224]/42">Workflow</p>
            <div className="mt-4 space-y-3">
              {["Select booking", "Write listing", "Set access", "Create event"].map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center bg-white text-xs font-black text-[#3a1224]">{index + 1}</span>
                  <span className="text-sm font-bold text-[#3a1224]/68">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5">
          {/* Step 1: Booking Selection */}
          <section className="border border-[#e8dcc8] bg-white">
            <div className="border-b border-[#e8dcc8] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center bg-[#3a1224] text-sm font-black text-white">1</span>
                <div>
                  <h2 className="text-base font-black text-[#3a1224]">Select booking</h2>
                  <p className="mt-1 text-xs text-[#3a1224]/45">Only eligible confirmed bookings can be converted to events.</p>
                </div>
              </div>
            </div>

              <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">Confirmed booking</label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full cursor-pointer border border-[#e8dcc8] bg-white px-4 py-3 text-sm font-bold text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15"
                  >
                    <option value="">Select a booking...</option>
                    {bookings.map((booking) => (
                      <option key={booking._id} value={booking._id}>
                        {booking.hallId?.name || "Hall"} - {formatDate(booking.date)} - {booking.guests} guests
                      </option>
                    ))}
                  </select>
                  {loadingBookings && (
                    <p className="flex items-center gap-2 text-xs font-bold text-[#C0A04C]">
                      <Zap className="w-3 h-3 animate-pulse" /> Loading bookings...
                    </p>
                  )}
                  {!loadingBookings && bookings.length === 0 && (
                    <div className="border border-amber-200 bg-amber-50 p-3">
                      <p className="text-sm font-medium text-amber-800">No eligible hall bookings found. Create or confirm a booking first.</p>
                    </div>
                  )}
                  {!loadingBookings && preselectedNotFound && (
                    <div className="border border-blue-200 bg-blue-50 p-3">
                      <p className="text-sm font-medium text-blue-800">The booking from your recent payment was not found. It may already be linked to an event or still confirming.</p>
                    </div>
                  )}
                </div>

                {selectedBooking && (
                  <div className="border border-[#e8dcc8] bg-[#fbf8f2]">
                    <div className="border-b border-[#e8dcc8] px-5 py-4">
                      <h3 className="text-base font-black text-[#3a1224]">{selectedBooking.hallId?.name || "Venue name"}</h3>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/35">Booking details</p>
                    </div>
                    
                    <div className="grid gap-px bg-[#e8dcc8] sm:grid-cols-3">
                      <BookingFact icon={CalendarDays} label="Date" value={formatDate(selectedBooking.date)} />
                      <BookingFact icon={Users} label="Guests" value={selectedBooking.guests || 0} />
                      <BookingFact icon={MapPin} label="Slot" value={selectedBooking.slot || "-"} />
                    </div>
                  </div>
                )}
                {!selectedBooking && (
                  <div className="border border-dashed border-[#e8dcc8] bg-[#fbf8f2] p-5">
                    <CalendarDays className="h-6 w-6 text-[#3a1224]/25" />
                    <p className="mt-3 text-sm font-black text-[#3a1224]">Choose a booking to continue</p>
                    <p className="mt-1 text-xs leading-5 text-[#3a1224]/45">The event form appears after a booking is selected.</p>
                  </div>
                )}
              </div>
          </section>

          {/* Step 2: Event Details Form */}
          {selectedBookingId && (
            <section className="border border-[#e8dcc8] bg-white">
              <div className="border-b border-[#e8dcc8] px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center bg-[#3a1224] text-sm font-black text-white">2</span>
                  <div>
                    <h2 className="text-base font-black text-[#3a1224]">Event listing</h2>
                    <p className="mt-1 text-xs text-[#3a1224]/45">Add the information guests will see before booking a ticket.</p>
                  </div>
                </div>
              </div>
                
              <div className="p-5">
                <div className="mb-6 flex gap-3 border border-blue-200 bg-blue-50 p-4">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-6 text-blue-800">
                    Keep this practical: title, timing, audience, access rules, and any venue-specific instructions.
                  </p>
                </div>
                
                <ProfessionalEventForm 
                  initialData={{ bookingId: selectedBookingId }}
                  booking={selectedBooking}
                  onSubmit={onFormSubmit}
                  isLoading={isCreating}
                />
              </div>
            </section>
          )}
      </div>
    </main>
  );
}

function BookingFact({ icon: Icon, label, value }) {
  return (
    <div className="bg-[#fbf8f2] px-4 py-4">
      <div className="flex items-center gap-2 text-[#3a1224]/45">
        <Icon className="h-4 w-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.18em]">{label}</p>
      </div>
      <p className="mt-2 text-sm font-black capitalize text-[#3a1224]">{value}</p>
    </div>
  );
}
