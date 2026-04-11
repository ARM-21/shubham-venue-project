import api from 'lib/api';
import ErrorHandler from 'utils/errorHandler';

export interface ScanQRRequest {
  qrCode: string;
  deviceId: string;
  eventId: string;
}

export interface ScanQRResponse {
  status: 'valid' | 'already_checked' | 'invalid';
  message: string;
  ticketId?: string;
  attendeeName?: string;
  ticketType?: string;
  checkinId?: string;
  timestamp?: string;
}

/**
 * Scan a QR code for ticket validation/check-in
 */
export async function scanQRMutator({
  qrCode,
  deviceId,
  eventId,
}: ScanQRRequest): Promise<ScanQRResponse> {
  try {
    const response = await ErrorHandler.retry(
      async () => {
        const result = await api.post(
          `/scanner/events/${eventId}/checkins/scan`,
          {
            qrCode: qrCode.trim(),
            deviceId,
          }
        );

        return result.data;
      },
      2,
      800
    );

    return response;
  } catch (error: any) {
    const apiError = ErrorHandler.parseError(error);
    ErrorHandler.logError('SCAN_QR_MUTATOR', apiError);
    
    // Throw error with user-friendly message
    const userMessage = ErrorHandler.getUserMessage(apiError);
    const err = new Error(userMessage);
    (err as any).code = apiError.code;
    (err as any).status = apiError.status;
    throw err;
  }
}
