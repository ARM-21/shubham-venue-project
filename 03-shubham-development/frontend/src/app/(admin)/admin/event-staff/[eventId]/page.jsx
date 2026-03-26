"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminTopbar from "components/admin/dashboard/AdminTopbar";
import toast from "react-hot-toast";
import { ROUTES } from "config/routes";
import axiosInstance from "lib/axios";
import { X, Plus, Loader } from "lucide-react";
import {
  useEventScanners,
  useAssignScanner,
  useRemoveScanner,
} from "@queries/admin/scanner-assignments";

export default function EventStaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId;

  const [eventData, setEventData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignForm, setShowAssignForm] = useState(false);

  // Form state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedGate, setSelectedGate] = useState("Main Gate");

  // React Query hooks
  const {
    data: assignedStaff = [],
    isLoading: isLoadingStaff,
    isError: isErrorStaff,
  } = useEventScanners(eventId);
  const assignScanner = useAssignScanner();
  const removeScanner = useRemoveScanner();

  const gateOptions = [
    "Main Gate",
    "Side Gate",
    "VIP Entrance",
    "Service Entrance",
    "Gate 1",
    "Gate 2",
    "Gate 3",
    "Gate 4",
  ];

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch event details from admin governance endpoint (system-wide access)
      const eventRes = await axiosInstance.get(
        ROUTES.API.ADMIN.GOVERNANCE.ORGANIZER_EVENT(eventId)
      );

      // Map the response to expected structure
      const mappedEvent = {
        eventName: eventRes.data.name,
        eventType: eventRes.data.type,
        eventDate: eventRes.data.startDateTime,
        totalGuests: eventRes.data.expectedAttendees || 0,
        hallName: eventRes.data.hallId?.name || "N/A",
        description: eventRes.data.description,
      };

      setEventData(mappedEvent);

      // Fetch all users for assignment
      const usersRes = await axiosInstance.get(ROUTES.API.ADMIN.USERS);
      // Map users API response to expected structure (id -> _id for consistency)
      const mappedUsers = (usersRes.data.users || []).map((user) => ({
        _id: user.id,
        first_name: user.name?.split(" ")[0] || "",
        last_name: user.name?.split(" ").slice(1).join(" ") || "",
        email: user.email,
        username: user.username,
      }));
      setAllUsers(mappedUsers);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error(
        error.response?.data?.message || "Failed to load event details"
      );
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const handleAssignStaff = async (e) => {
    e.preventDefault();

    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    if (!selectedGate) {
      toast.error("Please select a gate");
      return;
    }

    try {
      await assignScanner.mutateAsync({
        eventId,
        userId: selectedUserId,
        gate: selectedGate,
      });

      toast.success("Staff member assigned successfully");
      setSelectedUserId("");
      setSelectedGate("Main Gate");
      setShowAssignForm(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to assign staff"
      );
    }
  };

  const handleRemoveStaff = async (assignmentId) => {
    if (!window.confirm("Remove this staff member from the event?")) {
      return;
    }

    try {
      await removeScanner.mutateAsync({ assignmentId, eventId });
      toast.success("Staff member removed");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to remove staff"
      );
    }
  };

  // Get unassigned users
  const assignedUserIds = assignedStaff.map(
    (s) => s.userId || s.userId?._id
  );
  const availableUsers = allUsers.filter(
    (u) => !assignedUserIds.includes(u._id)
  );

  // Get user details for assigned staff
  const getUsername = (userId) => {
    const user = allUsers.find((u) => u._id === userId);
    return user
      ? `${user.first_name || ""} ${user.last_name || ""} (${user.email})`
      : "Unknown User";
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="Manage Event Staff" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push(ROUTES.ADMIN.EVENT_STAFF)}
            className="flex items-center gap-2 text-[var(--admin-primary)] hover:underline mb-6 text-sm"
          >
            ← Back to Event Staff
          </button>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <div className="h-8 w-8 border-4 border-[var(--admin-primary)] border-t-transparent rounded-full"></div>
              </div>
              <p className="text-[var(--admin-muted)] mt-4">
                Loading event details...
              </p>
            </div>
          ) : !eventData ? (
            <div className="text-center py-12 bg-[var(--admin-surface)] rounded-lg">
              <p className="text-[var(--admin-muted)]">Event not found</p>
            </div>
          ) : (
            <>
              {/* Event Info */}
              <div className="bg-gradient-to-r from-[var(--admin-primary)]/10 to-transparent border border-[var(--admin-primary)]/30 rounded-lg p-6 mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {eventData.eventName}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-[var(--admin-muted)] text-xs uppercase">
                      Event Type
                    </p>
                    <p className="text-white font-medium">
                      {eventData.eventType}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--admin-muted)] text-xs uppercase">
                      Date & Time
                    </p>
                    <p className="text-white font-medium">
                      {eventData.eventDate ? new Date(eventData.eventDate).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--admin-muted)] text-xs uppercase">
                      Hall
                    </p>
                    <p className="text-white font-medium">
                      {eventData.hallName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--admin-muted)] text-xs uppercase">
                      Guests
                    </p>
                    <p className="text-white font-medium">
                      {eventData.totalGuests || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assigned Staff List */}
                <div className="lg:col-span-2">
                  <div className="bg-[var(--admin-surface)] border border-[#3a1a1a] rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-[#3a1a1a] flex justify-between items-center bg-[#1a0a0a]/50">
                      <h3 className="text-lg font-bold text-white">
                        Assigned Staff ({assignedStaff.length})
                      </h3>
                      <button
                        onClick={() => setShowAssignForm(!showAssignForm)}
                        className={`flex items-center gap-2 px-3 py-2 rounded transition-colors text-sm font-medium ${
                          showAssignForm
                            ? "bg-red-500/20 text-red-200"
                            : "bg-[var(--admin-primary)] hover:bg-[var(--admin-primary)]/90 text-white"
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                        {showAssignForm ? "Cancel" : "Add Staff"}
                      </button>
                    </div>

                    {/* Assignment Form */}
                    {showAssignForm && (
                      <form
                        onSubmit={handleAssignStaff}
                        className="border-b border-[#3a1a1a] p-6 bg-[#1a0a0a]/50"
                      >
                        <div className="space-y-4">
                          {/* User Selection */}
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">
                              Select User
                            </label>
                            <select
                              value={selectedUserId}
                              onChange={(e) =>
                                setSelectedUserId(e.target.value)
                              }
                              className="w-full px-3 py-2 bg-[#2a1a1a] border border-[#4a3a3a] rounded text-white text-sm focus:outline-none focus:border-[var(--admin-primary)]"
                            >
                              <option value="">
                                {availableUsers.length === 0
                                  ? "No available users"
                                  : "Choose a user..."}
                              </option>
                              {availableUsers.map((user) => (
                                <option key={user._id} value={user._id}>
                                  {user.first_name} {user.last_name} (
                                  {user.email})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Gate Selection */}
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">
                              Gate Assignment
                            </label>
                            <select
                              value={selectedGate}
                              onChange={(e) =>
                                setSelectedGate(e.target.value)
                              }
                              className="w-full px-3 py-2 bg-[#2a1a1a] border border-[#4a3a3a] rounded text-white text-sm focus:outline-none focus:border-[var(--admin-primary)]"
                            >
                              {gateOptions.map((gate) => (
                                <option key={gate} value={gate}>
                                  {gate}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={assignScanner.isPending}
                            className="w-full px-4 py-2 bg-[var(--admin-primary)] hover:bg-[var(--admin-primary)]/90 disabled:opacity-50 text-white rounded font-medium transition-colors text-sm flex items-center justify-center gap-2"
                          >
                            {assignScanner.isPending && (
                              <Loader className="h-4 w-4 animate-spin" />
                            )}
                            {assignScanner.isPending
                              ? "Assigning..."
                              : "Assign Staff"}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Staff List */}
                    {isLoadingStaff ? (
                      <div className="p-6 text-center">
                        <div className="inline-block animate-spin">
                          <div className="h-6 w-6 border-3 border-[var(--admin-primary)] border-t-transparent rounded-full"></div>
                        </div>
                        <p className="text-[var(--admin-muted)] mt-2">
                          Loading staff...
                        </p>
                      </div>
                    ) : assignedStaff.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-[var(--admin-muted)]">
                          No staff assigned yet
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#3a1a1a]">
                        {assignedStaff.map((staff) => (
                          <StaffRow
                            key={staff.id}
                            staff={staff}
                            userName={getUsername(
                              staff.userId?._id || staff.userId
                            )}
                            onRemove={() =>
                              handleRemoveStaff(staff.id)
                            }
                            isRemoving={removeScanner.isPending}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="bg-[var(--admin-surface)] border border-[#3a1a1a] rounded-lg p-6">
                    <p className="text-[var(--admin-muted)] text-xs uppercase mb-2">
                      Total Staff
                    </p>
                    <p className="text-3xl font-bold text-[var(--admin-primary)]">
                      {assignedStaff.length}
                    </p>
                  </div>

                  <div className="bg-[var(--admin-surface)] border border-[#3a1a1a] rounded-lg p-6">
                    <p className="text-[var(--admin-muted)] text-xs uppercase mb-2">
                      Available Users
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {availableUsers.length}
                    </p>
                  </div>

                  <div className="bg-[var(--admin-surface)] border border-[#3a1a1a] rounded-lg p-6">
                    <p className="text-[var(--admin-muted)] text-xs uppercase mb-3">
                      Gates Managed
                    </p>
                    <div className="space-y-2">
                      {[
                        ...new Set(
                          assignedStaff.map((s) => s.gate)
                        ),
                      ]
                        .sort()
                        .map((gate) => (
                          <div
                            key={gate}
                            className="flex items-center justify-between"
                          >
                            <span className="text-white text-sm">{gate}</span>
                            <span className="px-2 py-1 bg-[var(--admin-primary)]/20 text-[var(--admin-primary)] rounded text-xs font-medium">
                              {
                                assignedStaff.filter(
                                  (s) => s.gate === gate
                                ).length
                              }
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StaffRow({ staff, userName, onRemove, isRemoving }) {
  return (
    <div className="px-6 py-4 flex items-center justify-between hover:bg-[#1a0a0a]/30 transition-colors">
      <div className="flex-1">
        <p className="font-medium text-white">{userName}</p>
        <p className="text-[var(--admin-muted)] text-sm">
          Gate: {staff.gate}
        </p>
        <p className="text-[var(--admin-muted)] text-xs mt-1">
          Assigned: {new Date(staff.assignedAt).toLocaleDateString()}
        </p>
      </div>
      <button
        onClick={onRemove}
        disabled={isRemoving}
        className="p-2 hover:bg-red-500/20 text-red-400 rounded transition-colors disabled:opacity-50"
        title="Remove staff"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
