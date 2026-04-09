import { useState } from 'react';
import axiosInstance from 'lib/axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ROUTES } from 'config/routes';
import { PrimaryButton, SecondaryButton, ActionButtonGroup } from './FormInputs';

export default function Step4Payment({ data, reservationId, onPrev }) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("ONLINE"); 
  const [gateway, setGateway] = useState("KHALTI");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectToEsewa = (paymentUrl, payload) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = paymentUrl;

    Object.entries(payload || {}).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let bookingId = null; // Declare here for access in catch block

    try {
      // 1. Create booking
      const bookingRes = await axiosInstance.post(ROUTES.API.BOOKINGS.ROOT, {
        ...data,
        reservationId,
        paymentMethod,
      });

      bookingId = bookingRes.data.booking._id;

      const fallbackRedirect = data?.hallSlug ? ROUTES.SITE.VENUES(data.hallSlug) : ROUTES.HOME;

      if (paymentMethod === "CASH") {
        // Cash: just confirm and redirect
        toast.success("Booking submitted! Awaiting admin approval.");
        router.push(fallbackRedirect);
        return;
      }

      // 2. Online payment: initiate
      const paymentRes = await axiosInstance.post(ROUTES.API.PAYMENTS.INITIATE, {
        bookingId,
        gateway,
      });

      // Redirect to Khalti/Esewa payment page
      if (gateway === "ESEWA") {
        redirectToEsewa(paymentRes.data.paymentUrl, paymentRes.data.payload);
        return;
      }

      window.location.href = paymentRes.data.paymentUrl;

    } catch (error) {
      // If booking was created but payment init failed, cancel the booking
      if (bookingId && error.response?.status !== 404) {
        try {
          await axiosInstance.put(ROUTES.API.BOOKINGS.ROOT, {
            id: bookingId,
            status: 'CANCELLED'
          });
        } catch (cancelErr) {
          console.error('Failed to cancel orphaned booking:', cancelErr);
        }
      }
      toast.error(error.response?.data?.message || "Booking failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Review */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Event Details */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Event Details</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Event Date</span>
              <span className="font-semibold text-slate-900">
                {data?.date ? (typeof data.date === 'string' && data.date.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(data.date + 'T00:00:00').toLocaleDateString() : data.date) : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Time Slot</span>
              <span className="font-semibold text-slate-900 capitalize">{data?.slot === 'wholeday' ? '24 hours' : data?.slot || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Number of Guests</span>
              <span className="font-semibold text-slate-900">{data?.guests || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Event Type</span>
              <span className="font-semibold text-slate-900">{data?.eventType || 'N/A'}</span>
            </div>
          </div>

          {/* Booking Total */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Cost Summary</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Hall Booking</span>
              <span className="font-semibold text-slate-900">NPR {(data?.hallPrice || 0).toLocaleString()}</span>
            </div>
            {data?.menuTotal > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Menu Total</span>
                <span className="font-semibold text-slate-900">NPR {(data?.menuTotal || 0).toLocaleString()}</span>
              </div>
            )}
            {data?.decorationTotal > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Decoration Total</span>
                <span className="font-semibold text-slate-900">NPR {(data?.decorationTotal || 0).toLocaleString()}</span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Total Amount</span>
              <span className="text-2xl font-bold text-[#C0A04C]">NPR {((data?.hallPrice || 0) + (data?.menuTotal || 0) + (data?.decorationTotal || 0)).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-900">Payment Method</label>
        <div className="space-y-2">
          <label className="flex items-center p-4 border rounded-lg cursor-pointer transition-all"
            style={{
              borderColor: paymentMethod === "ONLINE" ? '#C0A04C' : 'rgb(203, 213, 225)',
              backgroundColor: paymentMethod === "ONLINE" ? 'rgba(192, 160, 76, 0.05)' : 'white'
            }}>
            <input
              type="radio"
              value="ONLINE"
              checked={paymentMethod === "ONLINE"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 text-[#C0A04C] border-slate-300 rounded"
            />
            <div className="ml-3">
              <p className="font-semibold text-slate-900">Pay Online</p>
              <p className="text-sm text-slate-600">Instant confirmation via Khalti or eSewa</p>
            </div>
          </label>
          <label className="flex items-center p-4 border rounded-lg cursor-pointer transition-all"
            style={{
              borderColor: paymentMethod === "CASH" ? '#C0A04C' : 'rgb(203, 213, 225)',
              backgroundColor: paymentMethod === "CASH" ? 'rgba(192, 160, 76, 0.05)' : 'white'
            }}>
            <input
              type="radio"
              value="CASH"
              checked={paymentMethod === "CASH"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 text-[#C0A04C] border-slate-300 rounded"
            />
            <div className="ml-3">
              <p className="font-semibold text-slate-900">Cash on Arrival</p>
              <p className="text-sm text-slate-600">Requires admin approval</p>
            </div>
          </label>
        </div>
      </div>

      {/* Gateway selection (only if online) */}
      {paymentMethod === "ONLINE" && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-900">Select Payment Gateway</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setGateway("KHALTI")}
              className={`flex-1 h-11 px-6 rounded-lg font-semibold text-sm transition-all ${
                gateway === "KHALTI" ? "bg-[#C0A04C] text-white border border-[#C0A04C]" : "bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Khalti
            </button>
            <button
              type="button"
              onClick={() => setGateway("ESEWA")}
              className={`flex-1 h-11 px-6 rounded-lg font-semibold text-sm transition-all ${
                gateway === "ESEWA" ? "bg-[#C0A04C] text-white border border-[#C0A04C]" : "bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              eSewa
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <ActionButtonGroup>
        <SecondaryButton
          onClick={onPrev}
          disabled={isSubmitting}
        >
          ← Back
        </SecondaryButton>
        <PrimaryButton
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Processing..."
            : paymentMethod === "CASH"
            ? "Submit Booking"
            : "Proceed to Payment"}
        </PrimaryButton>
      </ActionButtonGroup>
    </div>
  );
}
