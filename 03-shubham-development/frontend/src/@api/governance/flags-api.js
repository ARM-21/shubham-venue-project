import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

// Get all flags with filters and pagination
export const fetchFlags = async (filters = {}) => {
  const { status, severity, eventId, organizerId, page = 1, limit = 20 } = filters;
  
  const params = new URLSearchParams({
    page,
    limit,
  });
  
  // Only add status if explicitly provided
  if (status !== undefined) params.append('status', status);
  if (severity) params.append('severity', severity);
  if (eventId) params.append('eventId', eventId);
  if (organizerId) params.append('organizerId', organizerId);
  
  const res = await axiosInstance.get(
    `${ROUTES.API.ADMIN.GOVERNANCE.FLAGS}?${params}`,
    { withCredentials: true }
  );
  return res.data;
};

// Get flag dashboard data
export const fetchFlagDashboard = async () => {
  const res = await axiosInstance.get(
    ROUTES.API.ADMIN.GOVERNANCE.FLAGS_DASHBOARD,
    { withCredentials: true }
  );
  return res.data;
};

// Get single flag details
export const fetchFlagDetail = async (flagId) => {
  if (!flagId) throw new Error("Flag ID required");
  const res = await axiosInstance.get(
    ROUTES.API.ADMIN.GOVERNANCE.FLAG(flagId),
    { withCredentials: true }
  );
  return res.data;
};

// Create a new flag/report
export const createFlag = async (flagData) => {
  const res = await axiosInstance.post(
    ROUTES.API.ADMIN.GOVERNANCE.FLAGS,
    flagData,
    { withCredentials: true }
  );
  return res.data;
};

// Resolve a flag
export const resolveFlag = async (flagId, resolution) => {
  if (!flagId) throw new Error("Flag ID required");
  const res = await axiosInstance.patch(
    ROUTES.API.ADMIN.GOVERNANCE.FLAG_RESOLVE(flagId),
    resolution,
    { withCredentials: true }
  );
  return res.data;
};

// Add comment to flag investigation
export const addFlagComment = async (flagId, commentData) => {
  if (!flagId) throw new Error("Flag ID required");
  const res = await axiosInstance.post(
    `${ROUTES.API.ADMIN.GOVERNANCE.FLAGS}/${flagId}/comments`,
    commentData,
    { withCredentials: true }
  );
  return res.data;
};
