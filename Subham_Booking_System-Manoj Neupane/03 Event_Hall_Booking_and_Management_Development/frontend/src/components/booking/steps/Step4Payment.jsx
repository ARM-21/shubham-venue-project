import { useState } from 'react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/routes';

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
    <div>
      <h2 className="text-2xl font-bold mb-6">Payment</h2>

      {/* Payment method choice */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Payment Method</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="ONLINE"
              checked={paymentMethod === "ONLINE"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-2"
            />
            Pay Online (Instant Confirmation)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="CASH"
              checked={paymentMethod === "CASH"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-2"
            />
            Cash on Arrival (Admin Approval Required)
          </label>
        </div>
      </div>

      {/* Gateway selection (only if online) */}
      {paymentMethod === "ONLINE" && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Gateway</label>
          <div className="flex gap-4">
            <button
              onClick={() => setGateway("KHALTI")}
              className={`px-4 py-2 border rounded transition-colors ${
                gateway === "KHALTI" ? "bg-[#66213f] text-white border-[#66213f]" : "bg-white hover:border-[#66213f]"
              }`}
            >
              Khalti
            </button>
            <button
              onClick={() => setGateway("ESEWA")}
              className={`px-4 py-2 border rounded transition-colors ${
                gateway === "ESEWA" ? "bg-[#66213f] text-white border-[#66213f]" : "bg-white hover:border-[#66213f]"
              }`}
            >
              eSewa
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-60"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-[#66213f] text-white rounded hover:bg-[#4f1831] disabled:opacity-60"
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
