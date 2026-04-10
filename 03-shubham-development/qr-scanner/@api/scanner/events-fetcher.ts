import api from 'lib/api';
import ErrorHandler from 'utils/errorHandler';

export interface Event {
  _id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  hall: {
    hallName: string;
  };
  gate: string;
  status: string;
  assignedAt: string;
}

export interface EventsResponse {
  events: Event[];
}

/**
 * Fetch assigned events for the current scanner user
 */
export async function eventsFetcher(): Promise<EventsResponse> {
  try {
    console.debug('FETCHER: GET /scanner/my-events');

    const response = await ErrorHandler.retry(
      async () => {
        const result = await api.get('/scanner/my-events');
        console.debug('Events fetched:', result.data?.events?.length || 0);
        return result.data;
      },
      3,
      1500,
      (attempt) => console.log(`Loading events (attempt ${attempt}/3)...`)
    );

    return response;
  } catch (error: any) {
    const apiError = ErrorHandler.parseError(error);
    ErrorHandler.logError('EVENTS_FETCHER', apiError);
    throw apiError;
  }
}
