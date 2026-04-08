"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ROUTES } from "config/routes";
import AdminTopbar from "components/admin/dashboard/AdminTopbar";
import axiosInstance from "lib/axios";
import { useQueryBookings } from "@queries/bookings";
import { useQueryHalls } from "@queries/halls";
import { 
  CalendarClock, 
  CalendarDays, 
  Plus, 
  AlertCircle, 
  Loader2, 
  Download, 
  FilterX,
  RefreshCw
} from "lucide-react";

// Components
import StatCards from "components/admin/booking/StatCards";
import FiltersBar from "components/admin/booking/FiltersBar";
import BookingTable from "components/admin/booking/BookingTable";
import EditBookingModal from "components/admin/booking/ui/EditBookingModal";
import ViewBookingModal from "components/admin/booking/ui/ViewBookingModal";
import NewBookingModal from "components/admin/booking/ui/NewBookingModal"; // New Component

export default function AdminBookingsPage() {
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Modal & Menu States
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, id: null });

  // --- Filters & Search ---
  const defaultFilters = { status: "ALL", hallId: "ALL", dateFrom: "", dateTo: "" };
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(defaultFilters);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);

  // --- Data Fetching ---
  const { data: hallsData } = useQueryHalls({ params: { limit: 100 } });
  const halls = useMemo(() => {
    const source = hallsData?.data?.halls || hallsData?.halls || [];
    return source.map((h) => ({ id: h._id || h.id, name: h.name }));
  }, [hallsData]);

  const { data: overviewData } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => (await axiosInstance.get(ROUTES.API.ADMIN.OVERVIEW)).data,
  });

  const bookingsParams = useMemo(() => ({
    page,
    limit: 10,
    ...(filters.status !== "ALL" && { status: filters.status }),
    ...(filters.hallId !== "ALL" && { hallId: filters.hallId }),
    ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
    ...(filters.dateTo && { dateTo: filters.dateTo }),
    ...(searchTerm && { q: searchTerm }),
  }), [page, filters, searchTerm]);

  const { data: bookingsData, isLoading: bookingsLoading, isFetching, refetch: refetchBookings } = useQueryBookings({ params: bookingsParams, staleTime: 5000 });

  // --- Mutations ---
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
  };

  const createBookingMutation = useMutation({
    mutationFn: (payload) => axiosInstance.post(ROUTES.API.ADMIN.BOOKINGS, payload),
    onSuccess: () => {
      invalidateAll();
      setIsNewBookingOpen(false);
      setSuccessMsg("Booking created successfully!");
    }
  });

  const bookingUpdateMutation = useMutation({
    mutationFn: async ({ id, type, payload }) => {
      const endpoints = {
        update: ROUTES.API.ADMIN.BOOKING_UPDATE(id),
        status: ROUTES.API.ADMIN.BOOKING_STATUS(id),
        payment: ROUTES.API.ADMIN.BOOKING_PAYMENT(id),
      };
      return axiosInstance.patch(endpoints[type], payload);
    },
    onSuccess: () => invalidateAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(ROUTES.API.ADMIN.BOOKING_DELETE(id)),
    onSuccess: () => {
      invalidateAll();
      setOpenMenuId(null);
      setSuccessMsg("Booking deleted.");
    },
  });

  // --- Handlers ---
  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setSearchInput("");
    setSearchTerm("");
    setPage(1);
  };

  const handleRefresh = useCallback(() => {
    toast.promise(
      refetchBookings(),
      {
        loading: 'Refreshing bookings...',
        success: 'Bookings refreshed',
        error: 'Failed to refresh bookings'
      }
    );
  }, [refetchBookings]);

  const handleExportCSV = () => {
    if (!rows.length) return;
    const headers = ["ID", "Customer", "Hall", "Date", "Amount", "Status"];
    const csvData = rows.map(r => [r.id, r.customer, r.hall, r.eventDate, r.amount.replace(/[^0-9.-]+/g, ""), r.status.label]);
    const blob = new Blob([[headers.join(","), ...csvData.map(e => e.join(","))].join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const saveEdit = async () => {
    setActionLoading(true);
    try {
      const { id, date, slot, guests, status, paymentStatus, originalStatus, originalPaymentStatus } = editModal;
      const promises = [bookingUpdateMutation.mutateAsync({ id, type: 'update', payload: { date, slot, guests: Number(guests) } })];
      if (status !== originalStatus) promises.push(bookingUpdateMutation.mutateAsync({ id, type: 'status', payload: { status } }));
      if (paymentStatus !== originalPaymentStatus) {
        const b = bookingsData?.items?.find(x => (x.id || x._id) === id);
        const gateway = b?.payment?.gateway || "CASH";
        promises.push(bookingUpdateMutation.mutateAsync({ id, type: 'payment', payload: { status: paymentStatus, gateway } }));
      }
      await Promise.all(promises);
      setEditModal({ open: false, id: null });
      setSuccessMsg("Booking updated.");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- Formatting ---
  const npr = useMemo(() => new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 0 }), []);

  const stats = useMemo(() => {
    const { totals = {}, statusCounts = {} } = overviewData || {};
    const occupied = (statusCounts.CONFIRMED || 0) + (statusCounts.COMPLETED || 0);
    const rate = totals.bookings ? Math.round((occupied / totals.bookings) * 100) : 0;
    return [
      { label: "Pending Requests", value: String(totals.pending || 0).padStart(2, "0"), icon: CalendarClock, tone: totals.pending ? "warning" : "neutral" },
      { label: "Upcoming (7 Days)", value: String(overviewData?.upcoming?.length || 0).padStart(2, "0"), icon: CalendarDays, tone: "neutral" },
      { label: "Occupancy Rate", value: `${rate}%`, icon: CalendarDays, tone: rate >= 80 ? "positive" : "neutral" },
    ];
  }, [overviewData]);

  const rows = useMemo(() => (bookingsData?.items || []).map((b) => ({
    id: b.id || b._id,
    customer: [b.user?.first_name || b.user?.firstName, b.user?.last_name || b.user?.lastName].filter(Boolean).join(" ") || b.user?.email || "Guest",
    avatar:b.user?.profilePicture || null,
    email: b.user?.email,
    hall: b.hall?.name || "Standard Hall",
    eventDate: b.date ? new Date(b.date).toLocaleDateString("en-NP", { month: "short", day: "numeric", year: "numeric" }) : "-",
    guests: b.guests || 0,
    amount: npr.format(b.amount || b.totalAmount || 0),
    payment: { label: b.payment?.status || b.payments?.[0]?.status || "INITIATED", tone: (b.payment?.status || b.payments?.[0]?.status)?.toUpperCase() === "COMPLETED" ? "positive" : "warning" },
    status: { label: b.status || "Pending", tone: ["CONFIRMED", "COMPLETED"].includes(b.status?.toUpperCase()) ? "positive" : "warning" },
  })), [bookingsData, npr]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--admin-bg)] text-white">
      <AdminTopbar heading="Booking Management" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
          
          {/* Notifications */}
          {errorMsg && <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-xl flex justify-between">
            <span>{errorMsg}</span> <button onClick={() => setErrorMsg(null)}>×</button>
          </div>}
          
          {successMsg && <div className="bg-emerald-900/30 border border-emerald-800 text-emerald-200 px-4 py-3 rounded-xl flex justify-between">
            <span>{successMsg}</span> <button onClick={() => setSuccessMsg(null)}>×</button>
          </div>}

          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Reservations</h1>
              <p className="text-[var(--admin-muted)] mt-2 font-medium">Coordinate events and hall availability.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleExportCSV} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-sm transition-all">
                <Download className="size-4" /> Export
              </button>
              <button 
                onClick={handleRefresh} 
                disabled={isFetching} 
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  isFetching 
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                } ${isFetching ? 'opacity-100' : ''}`}
                title={isFetching ? "Refreshing bookings..." : "Click to refresh bookings"}
              >
                <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} /> 
                {isFetching ? 'Refreshing...' : 'Refresh'}
              </button>
              <button onClick={() => setIsNewBookingOpen(true)} className="flex items-center gap-2 bg-[var(--admin-primary)] hover:brightness-110 px-6 py-3 rounded-xl font-bold transition-all shadow-lg">
                <Plus className="size-5" /> New Booking
              </button>
            </div>
          </header>

          <StatCards stats={stats} />

          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <FiltersBar 
                filters={filters} setFilters={setFilters} halls={halls} setPage={setPage}
                fromDateRef={fromDateRef} toDateRef={toDateRef} 
                searchInput={searchInput} setSearchInput={setSearchInput} onSearch={() => { setPage(1); setSearchTerm(searchInput.trim()); }} 
              />
              {(searchTerm || filters.status !== "ALL") && (
                <button onClick={handleClearFilters} className="flex items-center gap-1 text-xs text-[var(--admin-primary)] w-fit"><FilterX className="size-3"/> Reset</button>
              )}
            </div>
            
            <BookingTable 
              rows={rows} bookingsLoading={bookingsLoading} bookingsTotal={bookingsData?.total || 0}
              page={page} pageSize={10} bookingsPages={bookingsData?.pages || 1} setPage={setPage}
              openMenuId={openMenuId} setOpenMenuId={setOpenMenuId}
              onView={setSelectedBookingId} onEdit={(id) => {
                const b = bookingsData.items.find(x => (x.id || x._id) === id);
                if (!b) {
                  setErrorMsg("Booking not found. Please refresh and try again.");
                  return;
                }
                const paymentStatus = b.payment?.status || b.payments?.[0]?.status || "INITIATED";
                setEditModal({ open: true, id, date: (b.date ? b.date.slice(0,10) : ""), slot: b.slot || "morning", guests: b.guests || 0, status: b.status || "PENDING", paymentStatus, originalStatus: b.status || "PENDING", originalPaymentStatus: paymentStatus });
              }} 
              onDelete={(id) => confirm("Delete?") && deleteMutation.mutate(id)} 
            />
          </div>
        </div>
      </div>

      <NewBookingModal 
        isOpen={isNewBookingOpen} 
        onClose={() => setIsNewBookingOpen(false)} 
        onSave={(data) => createBookingMutation.mutate(data)}
        halls={halls}
        loading={createBookingMutation.isLoading}
      />

      {editModal.open && <EditBookingModal editModal={editModal} setEditModal={setEditModal} saveEdit={saveEdit} actionLoading={actionLoading} onClose={() => setEditModal({open: false})} />}
      {selectedBookingId && <ViewBookingModal bookingId={selectedBookingId} closeModal={() => setSelectedBookingId(null)} currencyFormatter={npr} />}
    </div>
  );
}