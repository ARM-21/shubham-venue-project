import axiosInstance from 'lib/axios';

/**
 * Submit an event report (user/organizer initiated)
 */
export const submitEventReport = async (eventId, reason, description, evidence = [], priority = 'medium') => {
  try {
    const response = await axiosInstance.post('/api/v1/event-reports/submit', {
      eventId,
      reason,
      description,
      evidence,
      priority,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all event reports (admin only)
 */
export const fetchEventReports = async (filters = {}) => {
  try {
    const { status = 'pending', priority, page = 1, limit = 20, search } = filters;
    
    const params = new URLSearchParams({
      status,
      page,
      limit,
      ...(priority && { priority }),
      ...(search && { search }),
    });

    const response = await axiosInstance.get(`/api/v1/event-reports/admin?${params}`);
    
    // Map API response to component-expected format
    const reports = (response.data.data || []).map((report) => ({
      ...report,
      eventName: report.eventId?.name || 'Unknown Event',
      reporterEmail: report.reportedBy?.email || 'Unknown',
      reporterName: `${report.reportedBy?.firstName || ''} ${report.reportedBy?.lastName || ''}`.trim() || 'Unknown',
    }));
    
    return reports;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get single report detail (admin only)
 */
export const fetchReportDetail = async (reportId) => {
  try {
    const response = await axiosInstance.get(`/api/v1/event-reports/admin/${reportId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Resolve report with action (admin only)
 */
export const resolveEventReport = async (reportId, resolution, adminNotes, flagSeverity = 'high') => {
  try {
    const response = await axiosInstance.patch(`/api/v1/event-reports/admin/${reportId}/resolve`, {
      resolution, // 'created_flag', 'auto_suspended', 'dismissed_invalid', 'sent_warning'
      adminNotes,
      flagSeverity,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Dismiss report as invalid (admin only)
 */
export const dismissEventReport = async (reportId, adminNotes) => {
  try {
    const response = await axiosInstance.post(`/api/v1/event-reports/admin/${reportId}/dismiss`, {
      adminNotes,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get report stats dashboard (admin only)
 */
export const fetchReportStats = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/event-reports/admin/stats');
    return response.data.data.stats || {};
  } catch (error) {
    throw error.response?.data || error;
  }
};
