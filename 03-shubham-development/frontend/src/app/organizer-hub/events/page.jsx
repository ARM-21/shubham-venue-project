"use client";

import { 
  CalendarCheck, 
  PlusCircle, 
  Search, 
  Filter, 
  ChevronRight, 
  MoreVertical,
  Calendar,
  Users,
  Ticket,
  Zap,
  Fingerprint,
  Plus,
  Copy,
  Download,
  Trash2,
  CheckSquare,
  Square
} from "lucide-react";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "lib/axios";
import EventSearchFilter from "components/organizer/EventSearchFilter";
import BulkActionsToolbar from "components/organizer/BulkActionsToolbar";
import EmptyState from "components/organizer/EmptyState";
import { HelpToast } from "components/organizer/Tooltip";
import { exportEvents } from "lib/organizerUtils";
import { eventDuplicateMutator } from "@api/organizer/event-duplicate-mutator";
import { eventDeleteMutator } from "@api/organizer/event-delete-mutator";
import { useQueryOrganizerStatus } from "@queries/organizer/status";
import { useQueryOrganizerEvents } from "@queries/organizer/events";

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

function statusTone(status) {
  switch (status?.toUpperCase()) {
    case "PUBLISHED":
      return "text-emerald-600 bg-emerald-50 border-emerald-100";
    case "DRAFT":
      return "text-amber-600 bg-amber-50 border-amber-100";
    case "CANCELLED":
      return "text-rose-600 bg-rose-50 border-rose-100";
    default:
      return "text-gray-600 bg-gray-50 border-gray-100";
  }
}

export default function OrganizerEventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [showFirstTimeHelpToast, setShowFirstTimeHelpToast] = useState(false);

  // React Query Hooks
  const { data: statusData, isLoading: statusLoading } = useQueryOrganizerStatus({
    enabled: !!user,
  });

  const { data: eventsData, isLoading: eventsLoading, refetch: refetchEvents } = useQueryOrganizerEvents({
    params: statusFilter !== "all" ? { status: statusFilter } : undefined,
    enabled: !!statusData?.isOrganizerEligible,
  });

  // Mutations - Written directly in page
  const duplicateEventMutation = useMutation({
    mutationFn: eventDuplicateMutator,
    onSuccess: () => {
      toast.success("Event duplicated successfully!");
      clearSelection();
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
      refetchEvents();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to duplicate event");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error("Event IDs array required");
      }
      return Promise.all(ids.map(id => eventDeleteMutator(id)));
    },
    onSuccess: () => {
      toast.success("Event(s) deleted successfully!");
      clearSelection();
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
      refetchEvents();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete event(s)");
    },
  });

  // Extract data from query results
  const events = eventsData?.events || [];
  const status = statusData;
  const loading = statusLoading || eventsLoading;

  // Filter and search logic using useMemo (not useEffect to prevent infinite loops)
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(e => e.status?.toUpperCase() === statusFilter.toUpperCase());
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(e => 
        e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [events, statusFilter, searchQuery]);

  const statusValue = String(status?.organizerStatus || (user?.isOrganizerEligible ? "approved" : user?.organizerStatus || "none")).toLowerCase();
  const isApproved = status?.isOrganizerEligible || statusValue === "approved" || user?.isOrganizerEligible;

  // Bulk action handlers
  const toggleSelect = (eventId) => {
    const newSelected = new Set(selected);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelected(newSelected);
  };

  const selectAll = () => {
    setSelected(new Set(filteredEvents.map(e => e._id)));
  };

  const clearSelection = () => {
    setSelected(new Set());
  };

  const handleDuplicate = async () => {
    const selectedArray = Array.from(selected);
    if (selectedArray.length !== 1) {
      toast.error("Select exactly one event to duplicate");
      return;
    }

    const eventToDuplicate = events.find(e => e._id === selectedArray[0]);
    if (!eventToDuplicate) {
      toast.error("Event not found");
      return;
    }

    duplicateEventMutation.mutate(selectedArray[0]);
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) {
      toast.error("Select at least one event");
      return;
    }

    if (!confirm(`Delete ${selected.size} event(s)? This cannot be undone.`)) {
      return;
    }

    bulkDeleteMutation.mutate(Array.from(selected));
  };

  const handleExport = () => {
    const selectedArray = Array.from(selected);
    const eventsToExport = selectedArray.length > 0 
      ? events.filter(e => selected.has(e._id))
      : filteredEvents;

    if (eventsToExport.length === 0) {
      toast.error("No events to export");
      return;
    }

    exportEvents(eventsToExport);
    toast.success(`Exported ${eventsToExport.length} event(s)`);
  };

  // Show first-time help toast
  useEffect(() => {
    if (!eventsLoading && events.length === 0) {
      const hasSeenHelp = localStorage.getItem('organizer-events-help-shown');
      if (!hasSeenHelp) {
        setShowFirstTimeHelpToast(true);
        localStorage.setItem('organizer-events-help-shown', 'true');
      }
    }
  }, [events.length, eventsLoading]);

  if (!isApproved) {
    return (
      <div className="max-w-2xl mx-auto py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-[#3a1224]/5 p-12 text-center shadow-sm"
        >
          <div className="w-20 h-20 bg-[#3a1224]/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <Fingerprint className="w-10 h-10 text-[#3a1224]" />
          </div>
          <h2 className="text-3xl font-black text-[#3a1224] mb-4">Verification Required</h2>
          <p className="text-[#3a1224]/60 mb-10 leading-relaxed font-medium">
            You need to be a verified producer to manage event listings. 
            Please check your application status on the dashboard.
          </p>
          <button
            onClick={() => router.push(ROUTES.SITE.ORGANIZER)}
            className="px-10 py-5 bg-[#3a1224] text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 py-6 sm:py-8">
      {/* Help Toast for First-Time Users */}
      {showFirstTimeHelpToast && events.length === 0 && (
        <HelpToast
          title="Welcome to Your Event Dashboard!"
          message="Start by creating your first event. Use search & filters to manage your portfolio, and export events."
          onDismiss={() => setShowFirstTimeHelpToast(false)}
          autoClose={8000}
        />
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-6">
            <div className="w-8 sm:w-12 h-[1px] bg-[#C0A04C]/40" />
            <span className="text-[8px] sm:text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Portfolio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-[#3a1224] mb-2 sm:mb-3">
            My <span className="text-[#C0A04C] italic font-serif">Events</span>
          </h1>
          <p className="text-[#3a1224]/60 text-[13px] sm:text-base font-light max-w-lg">
            Manage, duplicate, and export your event listings with advanced tools.
          </p>
        </div>
        
        <button
          onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_NEW)}
          className="group flex items-center justify-center sm:justify-start gap-2 sm:gap-4 px-4 sm:px-8 py-3 sm:py-5 bg-[#3a1224] text-white rounded-lg sm:rounded-2xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest hover:shadow-lg transition-all w-full sm:w-auto"
        >
          <Plus className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#C0A04C]" />
          Create Event
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg sm:rounded-2xl border border-[#3a1224]/5 p-4 sm:p-6 shadow-sm">
        <EventSearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onClear={() => {
            setSearchQuery("");
            setStatusFilter("all");
          }}
          hasActiveFilters={searchQuery !== "" || statusFilter !== "all"}
        />
      </div>

      {/* Results Count & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <p className="text-[8px] sm:text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">
          {filteredEvents.length} Event{filteredEvents.length !== 1 ? 's' : ''} Found
        </p>
        <button
          onClick={handleExport}
          disabled={filteredEvents.length === 0}
          className="h-8 sm:h-9 px-3 sm:px-4 bg-[#C0A04C]/10 hover:bg-[#C0A04C]/20 text-[#C0A04C] rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center sm:justify-start gap-1 sm:gap-2"
        >
          <Download size={12} className="sm:w-3.5" /> <span className="hidden sm:inline">Export All</span><span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 border border-[#3a1224]/5 animate-pulse">
               <div className="w-12 h-12 bg-[#3a1224]/5 rounded-xl mb-6" />
               <div className="h-4 w-3/4 bg-[#3a1224]/5 rounded-full mb-4" />
               <div className="h-4 w-1/2 bg-[#3a1224]/5 rounded-full" />
            </div>
          ))
        ) : filteredEvents.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState
              type={searchQuery !== "" || statusFilter !== "all" ? "NO_RESULTS" : "NO_EVENTS"}
              onCtaClick={() => {
                if (searchQuery !== "" || statusFilter !== "all") {
                  setSearchQuery("");
                  setStatusFilter("all");
                } else {
                  router.push(ROUTES.SITE.ORGANIZER_EVENT_NEW);
                }
              }}
              ctaText={searchQuery !== "" || statusFilter !== "all" ? "Clear Filters" : "Create Your First Event"}
            />
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isSelected = selected.has(event._id);
            return (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group bg-white rounded-lg sm:rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col h-full ${
                isSelected 
                  ? 'border-[#C0A04C] shadow-lg shadow-[#C0A04C]/20 bg-[#C0A04C]/5' 
                  : 'border-[#3a1224]/5 hover:shadow-lg hover:border-[#C0A04C]/20 hover:bg-white/90'
              }`}
            >
               {/* Checkbox & Quick Actions */}
               <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(event._id);
                    }}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white border border-[#3a1224]/10 flex items-center justify-center hover:bg-[#C0A04C]/10 transition-all"
                  >
                    {isSelected ? (
                      <CheckSquare size={16} className="sm:w-4.5 text-[#C0A04C]" />
                    ) : (
                      <Square size={16} className="sm:w-4.5 text-[#3a1224]/20" />
                    )}
                  </button>

                  {/* Quick Actions Menu */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(new Set([event._id]));
                        handleDuplicate();
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 flex items-center justify-center transition-all"
                      title="Duplicate event"
                    >
                      <Copy size={13} className="sm:w-3.5" />
                    </button>
                  </div>
               </div>

               {/* Content */}
               <div className="p-5 sm:p-8 pt-12 sm:pt-14 flex-1">
                  <div className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border text-[7px] sm:text-[8px] font-black uppercase tracking-widest w-fit mb-3 sm:mb-4 ${statusTone(event.status)}`}>
                     {event.status}
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-black text-[#3a1224] mb-1 sm:mb-2 leading-tight group-hover:text-[#C0A04C] transition-colors line-clamp-2">
                    {event.name}
                  </h3>
                  <p className="text-[#3a1224]/40 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest mb-4 sm:mb-6">
                    {event.type || "Special Event"}
                  </p>

                  <div className="space-y-2 sm:space-y-3">
                     <div className="flex items-center gap-2 sm:gap-3">
                        <Calendar size={12} className="sm:w-3.5 text-[#C0A04C]/40" />
                        <span className="text-[10px] sm:text-[11px] font-medium text-[#3a1224]/60">{formatDate(event.bookingId?.date)}</span>
                     </div>
                     <div className="flex items-center gap-2 sm:gap-3">
                        <Users size={12} className="sm:w-3.5 text-[#C0A04C]/40" />
                        <span className="text-[10px] sm:text-[11px] font-medium text-[#3a1224]/60">{event.expectedAttendees || 0} Guests</span>
                     </div>
                  </div>
               </div>

               {/* Footer - Click to open */}
               <div 
                 onClick={() => {
                   if (!event?._id) {
                     toast.error("Event data incomplete. Please refresh.");
                     return;
                   }
                   router.push(ROUTES.SITE.ORGANIZER_EVENT_DETAIL(event._id));
                 }}
                 className={`bg-[#3a1224] p-4 sm:p-6 flex items-center justify-between ${event?._id ? 'cursor-pointer hover:bg-[#4a172d]' : 'cursor-not-allowed opacity-50'} transition-colors`}
               >
                  <div className="flex items-center gap-2 text-white">
                     <Ticket size={13} className="sm:w-3.5 text-[#C0A04C]" />
                     <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">{event.isPublic ? "Public" : "Private"}</span>
                  </div>
                  <ChevronRight size={14} className="sm:w-4 text-[#C0A04C] group-hover:translate-x-1 transition-transform" />
               </div>
            </motion.div>
            );
          })
        )}
      </div>

      {/* Bulk Actions Toolbar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <BulkActionsToolbar
            selectedCount={selected.size}
            totalCount={filteredEvents.length}
            onSelectAll={selectAll}
            onClear={clearSelection}
            onExport={handleExport}
            onDuplicate={handleDuplicate}
            onDelete={handleBulkDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
     