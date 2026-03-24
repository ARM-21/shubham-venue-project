import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

// Get audit logs with filters and pagination
export const fetchAuditLogs = async (filters = {}) => {
  const {
    type,
    actor,
    resource,
    action,
    startDate,
    endDate,
    page = 1,
    limit = 20
  } = filters;
  
  const params = new URLSearchParams({
    page,
    limit,
  });
  if (type) params.append('type', type);
  if (actor) params.append('actor', actor);
  if (resource) params.append('resource', resource);
  if (action) params.append('action', action);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const res = await axiosInstance.get(
    `${ROUTES.API.ADMIN.GOVERNANCE.AUDIT_LOGS}?${params}`,
    { withCredentials: true }
  );
  return res.data;
};

// Export audit logs
export const exportAuditLogs = async (filters = {}) => {
  const res = await axiosInstance.get(
    `${ROUTES.API.ADMIN.GOVERNANCE.AUDIT_LOGS}/export`,
    {
      params: filters,
      withCredentials: true,
      responseType: 'blob',
    }
  );
  return res.data;
};
