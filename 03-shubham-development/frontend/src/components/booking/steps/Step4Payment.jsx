import { useState } from 'react';
import axiosInstance from 'lib/axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ROUTES } from 'config/routes';

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

    try {
      // 1. Create booking
      const bookingRes = await axiosInstance.post(ROUTES.API.BOOKINGS.ROOT, {
        ...data,
        reservationId,
        paymentMethod,
      });

      const bookingId = bookingRes.data.booking._id;

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
      toast.error(error.response?.data?.message || "Booking failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-6 bg-[#C0A04C]"></div>
        <div>
          <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Step 4</p>
          <h2 className="text-2xl font-display font-black text-[#3a1224]">Complete Your Payment</h2>
          <p className="text-sm text-[#3a1224]/60 mt-1">Review your booking and choose a payment method</p>
        </div>
      </div>

      {/* Order Review */}
      <div className="bg-white/95 border border-[#3a1224]/5 rounded-3xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Event Details */}
          <div className="space-y-3">
            <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-4">Event Details</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#3a1224]/60">Event Date</span>
              <span className="font-black text-[#3a1224]">{data?.eventDate || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#3a1224]/60">Number of Guests</span>
              <span className="font-black text-[#3a1224]">{data?.guests || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#3a1224]/60">Event Type</span>
              <span className="font-black text-[#3a1224]">{data?.eventType || 'N/A'}</span>
            </div>
          </div>

          {/* Booking Total */}
          <div className="space-y-3">
            <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-4">Cost Summary</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#3a1224]/60">Hall Booking</span>
              <span className="font-black text-[#3a1224]">NPR {data?.hallPrice?.toLocaleString() || 0}</span>
            </div>
            {data?.menuTotal > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#3a1224]/60">Menu Total</span>
                <span className="font-black text-[#3a1224]">NPR {data?.menuTotal?.toLocaleString() || 0}</span>
              </div>
            )}
            {data?.decorationTotal > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#3a1224]/60">Decoration Total</span>
                <span className="font-black text-[#3a1224]">NPR {data?.decorationTotal?.toLocaleString() || 0}</span>
              </div>
            )}
            <div className="pt-3 border-t border-[#3a1224]/10 flex items-center justify-between">
              <span className="font-black text-[#3a1224]">Total Amount</span>
              <span className="text-2xl font-black text-[#C0A04C]">NPR {((data?.hallPrice || 0) + (data?.menuTotal || 0) + (data?.decorationTotal || 0)).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Payment Method</label>
        <div className="space-y-3">
          <label className="flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 bg-white/95 border-[#3a1224]/5"
            style={{
              borderColor: paymentMethod === "ONLINE" ? '#C0A04C' : 'var(--default)',
              backgroundColor: paymentMethod === "ONLINE" ? '#C0A04C' : '#ffffff'
            }}>
            <input
              type="radio"
              value="ONLINE"
              checked={paymentMethod === "ONLINE"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-5 h-5 text-[#C0A04C] border-[#3a1224]/10 rounded"
            />
            <div className="ml-4">
              <p className={`font-black ${paymentMethod === "ONLINE" ? 'text-[#3a1224]' : 'text-[#3a1224]'}`}>Pay Online</p>
              <p className={`text-sm ${paymentMethod === "ONLINE" ? 'text-[#3a1224]/70' : 'text-[#3a1224]/60'}`}>Instant confirmation via Khalti or eSewa</p>
            </div>
          </label>
          <label className="flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 bg-white/95 border-[#3a1224]/5"
            style={{
              borderColor: paymentMethod === "CASH" ? '#C0A04C' : 'var(--default)',
              backgroundColor: paymentMethod === "CASH" ? '#C0A04C' : '#ffffff'
            }}>
            <input
              type="radio"
              value="CASH"
              checked={paymentMethod === "CASH"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-5 h-5 text-[#C0A04C] border-[#3a1224]/10 rounded"
            />
            <div className="ml-4">
              <p className={`font-black ${paymentMethod === "CASH" ? 'text-[#3a1224]' : 'text-[#3a1224]'}`}>Cash on Arrival</p>
              <p className={`text-sm ${paymentMethod === "CASH" ? 'text-[#3a1224]/70' : 'text-[#3a1224]/60'}`}>Requires admin approval</p>
            </div>
          </label>
        </div>
      </div>

      {/* Gateway selection (only if online) */}
      {paymentMethod === "ONLINE" && (
        <div className="space-y-4">
          <label className="block text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Select Payment Gateway</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setGateway("KHALTI")}
              className={`flex-1 h-12 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all duration-300 cursor-pointer border ${
                gateway === "KHALTI" ? "bg-[#3a1224] text-[#C0A04C] border-[#3a1224]" : "bg-white/95 text-[#3a1224] border-[#3a1224]/10 hover:border-[#3a1224]/20"
              }`}
            >
              Khalti
            </button>
            <button
              type="button"
              onClick={() => setGateway("ESEWA")}
              className={`flex-1 h-12 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all duration-300 cursor-pointer border ${
                gateway === "ESEWA" ? "bg-[#3a1224] text-[#C0A04C] border-[#3a1224]" : "bg-white/95 text-[#3a1224] border-[#3a1224]/10 hover:border-[#3a1224]/20"
              }`}
            >
              eSewa
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-4 pt-6">
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className="flex-1 h-12 px-6 border border-[#3a1224]/10 text-[#3a1224] font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-60"
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 h-12 px-6 bg-[#3a1224] text-[#C0A04C] font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-[#4a172d] transition-colors shadow-lg cursor-pointer disabled:opacity-60"
        >
          {isSubmitting
            ? "Processing..."
            : paymentMethod === "CASH"
            ? "Submit Booking"
            : "Proceed to Payment"}
        </button>
      </div>
    </div>
  );
}
