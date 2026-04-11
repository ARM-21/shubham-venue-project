import api from '@/lib/api';
import ErrorHandler from '@/utils/errorHandler';

export interface StaffCheckin {
  _id: string;
  ticketId: string;
  attendeeName: string;
  attendeeEmail: string;
  eventName: string;
  checkedInAt: string;
  status: 'SUCCESS' | 'REJECTED' | 'ALREADY_CHECKED_IN';
  note?: string;
  gate: string;
}

export interface EventStats {
  eventId: string;
  eventName: string;
  eventDate: string;
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  alreadyChecked: number;
}

export interface StaffAnalyticsResponse {
  staff: {
    id: string;
    name: string;
  };
  summary: {
    totalScans: number;
    successfulScans: number;
    failedScans: number;
    alreadyChecked: number;
    successRate: string | number;
  };
  byEvent: EventStats[];
  recentScans: StaffCheckin[];
}

/**
 * Fetch staff member's scan analytics
 * Returns overall statistics, per-event breakdown, and recent scans
 */
export async function fetchStaffAnalytics(): Promise<StaffAnalyticsResponse> {
  try {
    const response = await ErrorHandler.retry(
      async () => {
        const result = await api.get('/scanner/analytics');
        return result.data;
      },
      2,
      800
    );

    return response;
  } catch (error: any) {
    const apiError = ErrorHandler.parseError(error);
    ErrorHandler.logError('FETCH_STAFF_ANALYTICS', apiError);
    throw apiError;
  }
}

/**
 * Fetch detailed check-ins for a specific event
 */
export async function fetchEventCheckins(
  eventId: string
): Promise<StaffAnalyticsResponse['recentScans']> {
  try {
    const response = await ErrorHandler.retry(
      async () => {
        const result = await api.get(`/scanner/events/${eventId}/checkins`);
        return result.data;
      },
      2,
      800
    );

    return response.checkins || [];
  } catch (error: any) {
    const apiError = ErrorHandler.parseError(error);
    ErrorHandler.logError('FETCH_EVENT_CHECKINS', apiError);
    throw apiError;
  }
}
