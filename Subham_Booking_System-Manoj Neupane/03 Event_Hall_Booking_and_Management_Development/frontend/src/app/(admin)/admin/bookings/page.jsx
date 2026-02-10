"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ROUTES } from "@/config/routes";
import AdminTopbar from "@/components/admin/dashboard/AdminTopbar";
import axiosInstance from "@/lib/axios";
import { CalendarClock, CalendarDays, Plus } from "lucide-react";
import StatCards from "./components/StatCards";
import FiltersBar from "./components/FiltersBar";
import BookingTable from "./components/BookingTable";
import EditBookingModal from "./components/EditBookingModal";
import ViewBookingModal from "./components/ViewBookingModal";

export default function AdminBookingsPage() {
  const [overview, setOverview] = useState(null);
  const [overviewError, setOverviewError] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [bookingsPages, setBookingsPages] = useState(1);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState(null);
  const [viewModal, setViewModal] = useState({ open: false, loading: false, data: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const emptyEditModal = {
    open: false,
    id: null,
    date: "",
    slot: "morning",
    guests: "",
    status: "PENDING",
    paymentStatus: "initiated",
    paymentId: null,
    originalStatus: "PENDING",
    originalPaymentStatus: "initiated",
  };
  const [editModal, setEditModal] = useState(emptyEditModal);

  const [halls, setHalls] = useState([]);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [filters, setFilters] = useState({ status: "ALL", hallId: "ALL", dateFrom: "", dateTo: "" });
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await axiosInstance.get(ROUTES.API.ADMIN.OVERVIEW);
        setOverview(res.data || null);
        setOverviewError(null);
      } catch (err) {
        console.error(err);
        setOverviewError(err?.response?.data?.message || "Failed to load overview");
      }
    }

    fetchOverview();
  }, []);

  useEffect(() => {
    async function fetchHalls() {
      try {
        const res = await axiosInstance.get(ROUTES.API.HALLS.ROOT, { params: { limit: 100 } });
        const options = Array.isArray(res.data?.halls)
          ? res.data.halls.map((h) => ({ id: h._id, name: h.name || "Hall" }))
          : [];
        setHalls(options);
      } catch (err) {
        console.error("Failed to load halls", err);
      }
    }

    fetchHalls();
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setBookingsLoading(true);
      const params = { page, limit: pageSize };
      if (filters.status !== "ALL") params.status = filters.status;
      if (filters.hallId !== "ALL") params.hallId = filters.hallId;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (searchTerm) params.q = searchTerm;

      const res = await axiosInstance.get(ROUTES.API.ADMIN.BOOKINGS, { params });
      setBookings(res.data?.items || []);
      setBookingsTotal(res.data?.total || 0);
      setBookingsPages(res.data?.pages || 1);
      setBookingsError(null);
    } catch (err) {
      console.error(err);
      setBookingsError(err?.response?.data?.message || "Failed to load bookings");
    } finally {
      setBookingsLoading(false);
    }
  }, [filters.dateFrom, filters.dateTo, filters.hallId, filters.status, page, pageSize, searchTerm]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSearch = () => {
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const updateStatus = async (bookingId, status, reason = "") => {
    if (!bookingId) return;
    try {
      setActionLoading(true);
      await axiosInstance.patch(ROUTES.API.ADMIN.BOOKING_STATUS(bookingId), { status, reason });
      await fetchBookings();
    } catch (err) {
      console.error("Failed to update status", err);
      setBookingsError(err?.response?.data?.message || "Failed to update booking");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!bookingId) return;
    const ok = typeof window !== "undefined" ? window.confirm("Delete this booking?") : true;
    if (!ok) return;
    try {
      setActionLoading(true);
      await axiosInstance.delete(ROUTES.API.ADMIN.BOOKING_DELETE(bookingId));
      await fetchBookings();
    } catch (err) {
      console.error("Failed to delete booking", err);
      setBookingsError(err?.response?.data?.message || "Failed to delete booking");
    } finally {
      setActionLoading(false);
      setOpenMenuId(null);
    }
  };

  const handleView = async (bookingId) => {
    if (!bookingId) return;
    setViewModal({ open: true, loading: true, data: null });
    setOpenMenuId(null);
    try {
      const res = await axiosInstance.get(ROUTES.API.ADMIN.BOOKING_DETAIL(bookingId));
      setViewModal({ open: true, loading: false, data: res.data });
    } catch (err) {
      console.error("Failed to load booking", err);
      setBookingsError(err?.response?.data?.message || "Failed to load booking");
      setViewModal({ open: false, loading: false, data: null });
    }
  };

  const handleEdit = (bookingId) => {
    const target = bookings.find((b) => b.id === bookingId || b._id === bookingId);
    const isoDate = target?.date ? new Date(target.date).toISOString().slice(0, 10) : "";
    setEditModal({
      open: true,
      id: bookingId,
      date: isoDate,
      slot: target?.slot || "morning",
      guests: target?.guests ?? "",
      status: (target?.status || "PENDING").toUpperCase(),
      paymentStatus: (target?.payment?.status || "initiated").toLowerCase(),
      paymentId: target?.payment?.id || null,
      originalStatus: (target?.status || "PENDING").toUpperCase(),
      originalPaymentStatus: (target?.payment?.status || "initiated").toLowerCase(),
    });
    setOpenMenuId(null);
  };

  const saveEdit = async () => {
    if (!editModal.id) return;
    try {
      setActionLoading(true);
      await axiosInstance.patch(ROUTES.API.ADMIN.BOOKING_UPDATE(editModal.id), {
        date: editModal.date,
        slot: editModal.slot,
        guests: Number(editModal.guests),
      });
      const statusChanged = editModal.status && editModal.status !== editModal.originalStatus;
      if (statusChanged) {
        await axiosInstance.patch(ROUTES.API.ADMIN.BOOKING_STATUS(editModal.id), { status: editModal.status });
      }

      const paymentChanged = editModal.paymentStatus && editModal.paymentStatus !== editModal.originalPaymentStatus;
      if (paymentChanged) {
        await axiosInstance.patch(ROUTES.API.ADMIN.BOOKING_PAYMENT(editModal.id), {
          status: editModal.paymentStatus,
        });
      }

      setEditModal(emptyEditModal);
      await fetchBookings();
    } catch (err) {
      console.error("Failed to update booking", err);
      setBookingsError(err?.response?.data?.message || "Failed to update booking");
    } finally {
      setActionLoading(false);
    }
  };

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 0 }),
    [],
  );

  const stats = useMemo(
    () => {
      const totals = overview?.totals || {};
      const statusCounts = overview?.statusCounts || {};
      const totalBookings = totals.bookings || 0;
      const occupied = (statusCounts.CONFIRMED || 0) + (statusCounts.COMPLETED || 0);
      const occupancyRate = totalBookings ? Math.round((occupied / totalBookings) * 100) : 0;
      return [
        {
          label: "Pending Requests",
          value: String(totals.pending ?? 0).padStart(2, "0"),
          badge: totals.pending ? "" : "",
          icon: CalendarClock,
          tone: totals.pending ? "warning" : "neutral",
        },
        {
          label: "Upcoming Events (7d)",
          value: String(overview?.upcoming?.length ?? 0).padStart(2, "0"),
          icon: CalendarDays,
          tone: "neutral",
        },
        {
          label: "Occupancy Rate",
          value: `${occupancyRate}%`,
          badge: "",
          icon: CalendarDays,
          tone: occupancyRate >= 80 ? "positive" : "neutral",
        },
      ];
    },
    [overview],
  );

  const rows = useMemo(() => {
    const items = bookings || [];
    if (!items.length) return [];

    return items.map((b) => {
      const statusKey = (b.status || "").toLowerCase();
      const statusTone =
        statusKey === "confirmed" || statusKey === "completed"
          ? "positive"
          : statusKey === "pending"
            ? "warning"
            : statusKey === "cancelled"
              ? "danger"
              : "info";

      const paymentKey = (b.payment?.status || "initiated").toLowerCase();
      const paymentLabel =
        paymentKey === "completed"
          ? "Paid"
          : paymentKey === "refunded"
            ? "Refunded"
            : paymentKey === "failed"
              ? "Failed"
              : "Pending";
      const paymentTone =
        paymentKey === "completed"
          ? "positive"
          : paymentKey === "failed"
            ? "danger"
            : paymentKey === "refunded"
              ? "neutral"
              : "warning";

      const dateLabel = b.date
        ? new Date(b.date).toLocaleDateString("en-NP", { month: "short", day: "numeric", year: "numeric" })
        : "-";

      const customerLabel =
        [b.user?.firstName, b.user?.lastName].filter(Boolean).join(" ") || b.user?.email || b.client || "Client";

      return {
        id: b.id || b._id || "—",
        customer: customerLabel,
        email: b.user?.email || b.email || "",
        avatar: b.user?.profilePicture || b.profilePicture || null,
        hall: b.hall?.name || b.hall || "Hall",
        eventDate: dateLabel,
        guests: b.guests || "-",
        amount: b.amount != null ? currencyFormatter.format(Number(b.amount)) : b.totalAmount != null ? currencyFormatter.format(Number(b.totalAmount)) : "-",
        payment: { label: paymentLabel, tone: paymentTone },
        status: { label: b.statusLabel || b.status || "Pending", tone: statusTone },
      };
    });
  }, [bookings, currencyFormatter]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="Booking Management" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {overviewError ? (
            <div className="bg-red-900/40 border border-red-700 text-red-100 px-4 py-3 rounded-lg">{overviewError}</div>
          ) : null}
          {bookingsError ? (
            <div className="bg-red-900/40 border border-red-700 text-red-100 px-4 py-3 rounded-lg">{bookingsError}</div>
          ) : null}

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">All Bookings</h1>
              <p className="text-[var(--admin-muted)] mt-2">Manage requests, approvals, and scheduling for all event halls.</p>
            </div>
            <button className="flex items-center gap-2 bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-dark)] text-white px-5 py-2.5 rounded-lg shadow-lg shadow-[var(--admin-primary)]/25 transition-all font-medium active:scale-95">
              <Plus className="size-5" />
              <span>New Booking</span>
            </button>
          </div>

          <StatCards stats={stats} />

          <div className="space-y-4">
            <FiltersBar
              filters={filters}
              setFilters={setFilters}
              halls={halls}
              setPage={setPage}
              fromDateRef={fromDateRef}
              toDateRef={toDateRef}
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              onSearch={handleSearch}
            />

            <BookingTable
              rows={rows}
              bookingsLoading={bookingsLoading}
              bookingsTotal={bookingsTotal}
              page={page}
              pageSize={pageSize}
              bookingsPages={bookingsPages}
              setPage={setPage}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={deleteBooking}
            />
          </div>
        </div>
      </div>

      <EditBookingModal
        editModal={editModal}
        setEditModal={setEditModal}
        saveEdit={saveEdit}
        actionLoading={actionLoading}
        onClose={() => setEditModal(emptyEditModal)}
      />

      <ViewBookingModal viewModal={viewModal} setViewModal={setViewModal} currencyFormatter={currencyFormatter} />
    </div>
  );
}
