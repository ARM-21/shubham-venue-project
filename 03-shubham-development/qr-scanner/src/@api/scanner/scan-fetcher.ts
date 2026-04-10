import api from '@/lib/api';
import ErrorHandler from '@/utils/errorHandler';

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
    console.debug('MUTATOR: POST /scanner/events/:eventId/checkins/scan');
    console.debug('Event ID:', eventId);
    console.debug('QR Code length:', qrCode.length);

    const response = await ErrorHandler.retry(
      async () => {
        const result = await api.post(
          `/scanner/events/${eventId}/checkins/scan`,
          {
            qrCode: qrCode.trim(),
            deviceId,
          }
        );

        console.debug('QR Scan result:', result.data?.status);
        return result.data;
      },
      2,
      800,
      (attempt) => console.log(`Scanning QR code (attempt ${attempt}/2)...`)
    );

    return response;
  } catch (error: any) {
    const apiError = ErrorHandler.parseError(error);
    ErrorHandler.logError('SCAN_QR_MUTATOR', apiError);
    throw apiError;
  }
}
