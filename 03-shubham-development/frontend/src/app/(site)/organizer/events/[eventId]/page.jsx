"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";
import toast from "react-hot-toast";
import { RefreshCcw } from "lucide-react";

const ATTENDEE_LIMIT = 20;

function toLocalInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
  } catch {
    return "-";
  }
}

export default function OrganizerEventDetailPage() {
  const router = useRouter();
  const { eventId } = useParams();
  const { user } = useAuth();
  const isOrganizer = Boolean(user?.isOrganizerEligible) || user?.role?.toLowerCase?.() === "admin";

  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [attendees, setAttendees] = useState([]);
  const [attendeeQuery, setAttendeeQuery] = useState("");
  const [attendeesPage, setAttendeesPage] = useState(1);
  const [attendeesTotal, setAttendeesTotal] = useState(0);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  const [newType, setNewType] = useState({ name: "", price: "", quantityTotal: "" });
  const [savingType, setSavingType] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [editType, setEditType] = useState({ name: "", price: "", quantityTotal: "", isActive: true });

  const [checkinCode, setCheckinCode] = useState("");
  const [checkinLoading, setCheckinLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      type: "",
      description: "",
      visibility: "public",
      accessCode: "",
      bannerUrl: "",
      startDateTime: "",
      endDateTime: "",
      status: "DRAFT",
    },
  });

  const visibility = watch("visibility");

  useEffect(() => {
    let ignore = false;
    async function fetchEvent() {
      try {
        setLoading(true);
        const [eventRes, ticketsRes] = await Promise.all([
          axiosInstance.get(ROUTES.API.ORGANIZER.EVENT(eventId)),
          axiosInstance.get(ROUTES.API.ORGANIZER.EVENT_TICKET_TYPES(eventId)),
        ]);

        if (!ignore) {
          const loadedEvent = eventRes.data?.event;
          setEvent(loadedEvent || null);
          setTicketTypes(ticketsRes.data?.ticketTypes || []);
          if (loadedEvent) {
            reset({
              name: loadedEvent.name || "",
              type: loadedEvent.type || "",
              description: loadedEvent.description || "",
              visibility: loadedEvent.isPublic ? "public" : "private",
              accessCode: loadedEvent.accessCode || "",
              bannerUrl: loadedEvent.bannerUrl || "",
              startDateTime: toLocalInputValue(loadedEvent.startDateTime),
              endDateTime: toLocalInputValue(loadedEvent.endDateTime),
              status: loadedEvent.status || "DRAFT",
            });
          }
        }
      } catch (err) {
        if (!ignore) {
          toast.error(err?.response?.data?.message || "Failed to load event");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (isOrganizer && eventId) fetchEvent();

    return () => {
      ignore = true;
    };
  }, [eventId, isOrganizer, reset]);

  useEffect(() => {
    let ignore = false;
    async function fetchAttendees(pageValue) {
      try {
        setAttendeesLoading(true);
        const res = await axiosInstance.get(ROUTES.API.ORGANIZER.EVENT_ATTENDEES(eventId), {
          params: { page: pageValue, limit: ATTENDEE_LIMIT },
        });
        if (!ignore) {
          setAttendees(res.data?.attendees || []);
          setAttendeesTotal(res.data?.total || 0);
        }
      } catch (err) {
        if (!ignore) {
          toast.error(err?.response?.data?.message || "Failed to load attendees");
        }
      } finally {
        if (!ignore) setAttendeesLoading(false);
      }
    }

    if (isOrganizer && eventId) fetchAttendees(attendeesPage);

    return () => {
      ignore = true;
    };
  }, [attendeesPage, eventId, isOrganizer]);

  const refreshAttendees = async (pageValue = attendeesPage) => {
    try {
      setAttendeesLoading(true);
      const res = await axiosInstance.get(ROUTES.API.ORGANIZER.EVENT_ATTENDEES(eventId), {
        params: { page: pageValue, limit: ATTENDEE_LIMIT },
      });
      setAttendees(res.data?.attendees || []);
      setAttendeesTotal(res.data?.total || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load attendees");
    } finally {
      setAttendeesLoading(false);
    }
  };

  const filteredAttendees = useMemo(() => {
    if (!attendeeQuery.trim()) return attendees;
    const q = attendeeQuery.trim().toLowerCase();
    return attendees.filter((a) => {
      const name = `${a.attendee?.first_name || ""} ${a.attendee?.last_name || ""}`.toLowerCase();
      const email = String(a.attendee?.email || "").toLowerCase();
      const code = String(a.qrCodeValue || "").toLowerCase();
      return name.includes(q) || email.includes(q) || code.includes(q);
    });
  }, [attendees, attendeeQuery]);

  async function saveEvent(values) {
    if (values.visibility === "private" && (!values.accessCode || values.accessCode.trim().length < 4)) {
      toast.error("Access code must be at least 4 characters for private events");
      return;
    }

    try {
      const payload = {
        name: values.name?.trim(),
        type: values.type?.trim(),
        description: values.description?.trim(),
        isPublic: values.visibility === "public",
        accessCode: values.visibility === "private" ? values.accessCode?.trim() : null,
        bannerUrl: values.bannerUrl?.trim(),
        startDateTime: values.startDateTime || undefined,
        endDateTime: values.endDateTime || undefined,
        status: values.status,
      };
      const res = await axiosInstance.patch(ROUTES.API.ORGANIZER.EVENT(eventId), payload);
      setEvent(res.data?.event || null);
      toast.success("Event updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update event");
    }
  }

  async function refreshTicketTypes() {
    try {
      const res = await axiosInstance.get(ROUTES.API.ORGANIZER.EVENT_TICKET_TYPES(eventId));
      setTicketTypes(res.data?.ticketTypes || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load ticket types");
    }
  }

  async function addTicketType() {
    if (savingType) return;
    if (!newType.name.trim()) {
      toast.error("Ticket name is required");
      return;
    }
    const price = Number(newType.price);
    const quantityTotal = Number(newType.quantityTotal);
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Invalid ticket price");
      return;
    }
    if (!Number.isFinite(quantityTotal) || quantityTotal < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    try {
      setSavingType(true);
      await axiosInstance.post(ROUTES.API.ORGANIZER.EVENT_TICKET_TYPES(eventId), {
        name: newType.name.trim(),
        price,
        quantityTotal,
      });
      setNewType({ name: "", price: "", quantityTotal: "" });
      toast.success("Ticket type added");
      refreshTicketTypes();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add ticket type");
    } finally {
      setSavingType(false);
    }
  }

  function startEdit(type) {
    setEditingTypeId(type._id);
    setEditType({
      name: type.name || "",
      price: type.price ?? "",
      quantityTotal: type.quantityTotal ?? "",
      isActive: type.isActive !== false,
    });
  }

  async function saveEdit(typeId) {
    try {
      if (!editType.name.trim()) {
        toast.error("Ticket name is required");
        return;
      }
      const priceValue = Number(editType.price);
      const quantityValue = Number(editType.quantityTotal);
      if (!Number.isFinite(priceValue) || priceValue < 0) {
        toast.error("Invalid ticket price");
        return;
      }
      if (!Number.isFinite(quantityValue) || quantityValue < 1) {
        toast.error("Quantity must be at least 1");
        return;
      }
      const payload = {
        name: editType.name.trim(),
        price: priceValue,
        quantityTotal: quantityValue,
        isActive: Boolean(editType.isActive),
      };
      await axiosInstance.patch(ROUTES.API.ORGANIZER.TICKET_TYPE(typeId), payload);
      toast.success("Ticket type updated");
      setEditingTypeId(null);
      refreshTicketTypes();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update ticket type");
    }
  }

  async function handleCheckin() {
    if (!checkinCode.trim()) {
      toast.error("QR code is required");
      return;
    }
    if (checkinLoading) return;

    try {
      setCheckinLoading(true);
      await axiosInstance.post(ROUTES.API.ORGANIZER.EVENT_CHECKIN(eventId), { qrCodeValue: checkinCode.trim() });
      toast.success("Check-in successful");
      setCheckinCode("");
      setAttendeesPage(1);
      refreshAttendees(1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Check-in failed");
    } finally {
      setCheckinLoading(false);
    }
  }

  if (!isOrganizer) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900">Organizer access required</h2>
        <p className="text-sm text-gray-600 mt-2">Submit your organizer request to manage events.</p>
        <button
          onClick={() => router.push(ROUTES.SITE.ORGANIZER)}
          className="mt-4 px-4 py-2 bg-[#8B0000] text-white rounded-lg text-sm font-semibold"
        >
          Go to Organizer Hub
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-6 text-sm text-gray-600">Loading event...</div>;
  }

  if (!event) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-6 text-sm text-gray-600">Event not found.</div>;
  }

  const totalPages = Math.ceil(attendeesTotal / ATTENDEE_LIMIT) || 1;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500">Event</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{event.name}</h1>
          <p className="text-sm text-gray-600">{event.type || "Event"} · {event.isPublic ? "Public" : "Private"}</p>
        </div>
        <button
          onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENTS)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50"
        >
          Back to events
        </button>
      </div>

      <form onSubmit={handleSubmit(saveEvent)} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Event name *</label>
            <input
              {...register("name", { required: "Event name is required" })}
              className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Event type</label>
            <input
              {...register("type")}
              className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            {...register("description")}
            rows={3}
            className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
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
              {...register("accessCode")}
              className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Required for private events"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Banner URL</label>
          <input
            {...register("bannerUrl")}
            className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
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

        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            {...register("status")}
            className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#8B0000] text-white rounded-lg text-sm font-semibold hover:bg-[#A52A2A] transition disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Ticket types</h2>
          <button onClick={refreshTicketTypes} className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={newType.name}
            onChange={(e) => setNewType((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Ticket name"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={newType.price}
            onChange={(e) => setNewType((prev) => ({ ...prev, price: e.target.value }))}
            placeholder="Price"
            type="number"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={newType.quantityTotal}
            onChange={(e) => setNewType((prev) => ({ ...prev, quantityTotal: e.target.value }))}
            placeholder="Quantity"
            type="number"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={addTicketType}
          disabled={savingType}
          className="px-4 py-2 bg-[#8B0000] text-white rounded-lg text-sm font-semibold hover:bg-[#A52A2A] transition disabled:opacity-60"
        >
          {savingType ? "Adding..." : "Add ticket type"}
        </button>

        {ticketTypes.length === 0 ? (
          <p className="text-sm text-gray-600">No ticket types added yet.</p>
        ) : (
          <div className="space-y-3">
            {ticketTypes.map((type) => (
              <div key={type._id} className="border border-gray-100 rounded-lg p-4">
                {editingTypeId === type._id ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      value={editType.name}
                      onChange={(e) => setEditType((prev) => ({ ...prev, name: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      value={editType.price}
                      onChange={(e) => setEditType((prev) => ({ ...prev, price: e.target.value }))}
                      type="number"
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      value={editType.quantityTotal}
                      onChange={(e) => setEditType((prev) => ({ ...prev, quantityTotal: e.target.value }))}
                      type="number"
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <select
                      value={editType.isActive ? "active" : "inactive"}
                      onChange={(e) => setEditType((prev) => ({ ...prev, isActive: e.target.value === "active" }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <div className="flex gap-2 md:col-span-4">
                      <button
                        onClick={() => saveEdit(type._id)}
                        className="px-3 py-2 bg-[#8B0000] text-white rounded-lg text-sm font-semibold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingTypeId(null)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{type.name}</p>
                      <p className="text-sm text-gray-600">Price: NPR {Number(type.price || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Sold: {type.quantitySold} / {type.quantityTotal}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${type.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {type.isActive ? "Active" : "Inactive"}
                      </span>
                      <button
                        onClick={() => startEdit(type)}
                        className="text-sm font-semibold text-[#8B0000] hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Attendees</h2>
            <p className="text-sm text-gray-600">Manage guests and check-ins.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={attendeeQuery}
              onChange={(e) => setAttendeeQuery(e.target.value)}
              placeholder="Search attendees"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={() => setAttendeesPage(1)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              Search
            </button>
          </div>
        </div>

        <div className="border border-gray-100 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-2">Attendee</th>
                <th className="text-left px-4 py-2">Ticket</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Check-in</th>
              </tr>
            </thead>
            <tbody>
              {attendeesLoading ? (
                <tr><td colSpan={4} className="px-4 py-3 text-gray-600">Loading attendees...</td></tr>
              ) : filteredAttendees.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-3 text-gray-600">No attendees found.</td></tr>
              ) : (
                filteredAttendees.map((ticket) => (
                  <tr key={ticket.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">
                        {(ticket.attendee?.first_name || "") + " " + (ticket.attendee?.last_name || "")}
                      </p>
                      <p className="text-xs text-gray-500">{ticket.attendee?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{ticket.ticketType?.name || "Ticket"}</p>
                      <p className="text-xs text-gray-500">NPR {Number(ticket.ticketType?.price || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{ticket.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {ticket.checkedInAt ? formatDate(ticket.checkedInAt) : "Not checked in"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Page {attendeesPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setAttendeesPage((p) => Math.max(1, p - 1))}
              disabled={attendeesPage <= 1}
              className="px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-60"
            >
              Prev
            </button>
            <button
              onClick={() => setAttendeesPage((p) => Math.min(totalPages, p + 1))}
              disabled={attendeesPage >= totalPages}
              className="px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Quick Check-in</h2>
        <p className="text-sm text-gray-600">Enter a QR code to confirm attendance.</p>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={checkinCode}
            onChange={(e) => setCheckinCode(e.target.value)}
            placeholder="QR code"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={handleCheckin}
            disabled={checkinLoading}
            className="px-4 py-2 bg-[#8B0000] text-white rounded-lg text-sm font-semibold hover:bg-[#A52A2A] transition disabled:opacity-60"
          >
            {checkinLoading ? "Checking..." : "Check in"}
          </button>
        </div>
      </div>
    </div>
  );
}
