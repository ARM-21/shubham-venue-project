import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

// Get suspension statistics
export const fetchSuspensionStats = async (filters = {}) => {
  const { startDate, endDate, reason } = filters;
  
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (reason) params.append('reason', reason);
  
  const queryString = params.toString();
  const url = queryString 
    ? `${ROUTES.API.ADMIN.GOVERNANCE.SUSPENSION_STATS}?${queryString}`
    : ROUTES.API.ADMIN.GOVERNANCE.SUSPENSION_STATS;
  
  const res = await axiosInstance.get(
    url,
    { withCredentials: true }
  );
  return res.data;
};
