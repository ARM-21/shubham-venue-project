import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function reserveBookingMutator(payload) {
  const res = await axiosInstance.post(ROUTES.API.BOOKINGS.RESERVE, payload);
  return res.data;
}

export async function cancelBookingMutator(bookingId) {
  const res = await axiosInstance.put(ROUTES.API.BOOKINGS.ROOT, { 
    id: bookingId, 
    status: 'CANCELLED' 
  });
  return res.data;
}

export async function getBookingInvoiceMutator(bookingId) {
  const res = await axiosInstance.get(ROUTES.API.BOOKINGS.INVOICE(bookingId));
  return res.data;
}
