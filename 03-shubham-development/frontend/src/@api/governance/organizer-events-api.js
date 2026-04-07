import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

// Get all organizer events for review
export const fetchOrganizerEvents = async (filters = {}) => {
  const { status, page = 1, limit = 20 } = filters;
  
  const params = new URLSearchParams({
    page,
    limit,
  });

  // Only add status if provided (for 'all' filter, status is undefined)
  if (status) {
    params.append('status', status);
  }
  
  const res = await axiosInstance.get(
    `${ROUTES.API.ADMIN.GOVERNANCE.ORGANIZER_EVENTS}?${params}`,
    { withCredentials: true }
  );
  return res.data;
};

// Get organizer event details
export const fetchOrganizerEventDetail = async (eventId) => {
  if (!eventId) throw new Error("Event ID required");
  const res = await axiosInstance.get(
    ROUTES.API.ADMIN.GOVERNANCE.ORGANIZER_EVENT(eventId),
    { withCredentials: true }
  );
  return res.data;
};

// Approve an organizer event
export const approveOrganizerEvent = async (eventId, approvalData = {}) => {
  if (!eventId) throw new Error("Event ID required");
  const res = await axiosInstance.post(
    ROUTES.API.ADMIN.GOVERNANCE.ORGANIZER_EVENT_APPROVE(eventId),
    approvalData,
    { withCredentials: true }
  );
  return res.data;
};

// Reject an organizer event
export const rejectOrganizerEvent = async (eventId, rejectionData = {}) => {
  if (!eventId) throw new Error("Event ID required");
  const res = await axiosInstance.post(
    ROUTES.API.ADMIN.GOVERNANCE.ORGANIZER_EVENT_REJECT(eventId),
    rejectionData,
    { withCredentials: true }
  );
  return res.data;
};

// Suspend an organizer event
export const suspendOrganizerEvent = async (eventId, suspensionData = {}) => {
  if (!eventId) throw new Error("Event ID required");
  const res = await axiosInstance.post(
    ROUTES.API.ADMIN.GOVERNANCE.ORGANIZER_EVENT_SUSPEND(eventId),
    suspensionData,
    { withCredentials: true }
  );
  return res.data;
};
