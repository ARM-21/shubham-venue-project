import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

// Get all organizers with filters and pagination
export const fetchOrganizers = async (filters = {}) => {
  const { suspended, page = 1, limit = 20, search } = filters;
  
  const params = new URLSearchParams({
    page,
    limit,
  });
  
  // Convert suspended boolean to status parameter
  if (suspended === true) {
    params.append('suspended', 'true');
  } else if (suspended === false) {
    params.append('suspended', 'false');
  }
  
  if (search) params.append('search', search);
  
  const res = await axiosInstance.get(
    `${ROUTES.API.ADMIN.GOVERNANCE.ORGANIZERS}?${params}`,
    { withCredentials: true }
  );
  return res.data;
};

// Get organizer details
export const fetchOrganizerDetail = async (organizerId) => {
  if (!organizerId) throw new Error("Organizer ID required");
  const res = await axiosInstance.get(
    ROUTES.API.ADMIN.GOVERNANCE.ORGANIZER(organizerId),
    { withCredentials: true }
  );
  return res.data;
};

// Get organizer reputation/metrics
export const fetchOrganizerReputation = async (organizerId) => {
  if (!organizerId) throw new Error("Organizer ID required");
  const res = await axiosInstance.get(
    ROUTES.API.ADMIN.GOVERNANCE.ORGANIZER_REPUTATION(organizerId),
    { withCredentials: true }
  );
  return res.data;
};

// Get organizer audit trail
export const fetchOrganizerAuditTrail = async (organizerId) => {
  if (!organizerId) throw new Error("Organizer ID required");
  const res = await axiosInstance.get(
    ROUTES.API.ADMIN.GOVERNANCE.ORGANIZER_AUDIT_TRAIL(organizerId),
    { withCredentials: true }
  );
  return res.data;
};

// Suspend organizer
export const suspendOrganizer = async (organizerId, data = {}) => {
  if (!organizerId) throw new Error("Organizer ID required");
  const res = await axiosInstance.post(
    `${ROUTES.API.ADMIN.GOVERNANCE.ORGANIZERS}/${organizerId}/suspend`,
    data,
    { withCredentials: true }
  );
  return res.data;
};

// Unsuspend organizer
export const unsuspendOrganizer = async (organizerId) => {
  if (!organizerId) throw new Error("Organizer ID required");
  const res = await axiosInstance.post(
    `${ROUTES.API.ADMIN.GOVERNANCE.ORGANIZERS}/${organizerId}/unsuspend`,
    {},
    { withCredentials: true }
  );
  return res.data;
};

// Recalculate metrics for organizer(s)
export const recalculateMetrics = async (organizerId = null) => {
  const data = organizerId ? { organizerId } : {};
  const res = await axiosInstance.post(
    `${ROUTES.API.ADMIN.GOVERNANCE.ORGANIZERS}/../stats/recalculate`,
    data,
    { withCredentials: true }
  );
  return res.data;
};
