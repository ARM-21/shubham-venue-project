'use client';

import { useState } from 'react';
import axiosInstance from 'lib/axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ROUTES } from 'config/routes';
import { Check, Loader2, Lock } from 'lucide-react';
import { cn } from 'components/site/SitePrimitives';

export default function Step4Payment({ data, reservationId, onUpdate, onPrev, onNext }) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [gateway, setGateway] = useState('KHALTI');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total =
    Number(data?.total) ||
    Number(data?.hallPrice || 0) + Number(data?.menuTotal || 0) + Number(data?.decorationTotal || 0);

  const redirectToEsewa = (paymentUrl, payload) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentUrl;
    Object.entries(payload || {}).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let bookingId = null;
    try {
      const bookingRes = await axiosInstance.post(ROUTES.API.BOOKINGS.ROOT, {
        ...data,
        reservationId,
        paymentMethod,
      });
      bookingId = bookingRes.data.booking._id;
      const fallbackRedirect = data?.hallSlug ? ROUTES.SITE.VENUES(data.hallSlug) : ROUTES.HOME;
      if (paymentMethod === 'CASH') {
        toast.success('Booking submitted. Awaiting admin approval.');
        router.push(fallbackRedirect);
        return;
      }
      const paymentRes = await axiosInstance.post(ROUTES.API.PAYMENTS.INITIATE, {
        bookingId,
        gateway,
      });
      if (gateway === 'ESEWA') {
        redirectToEsewa(paymentRes.data.paymentUrl, paymentRes.data.payload);
        return;
      }
      window.location.href = paymentRes.data.paymentUrl;
    } catch (error) {
      if (bookingId) {
        try {
          await axiosInstance.put(ROUTES.API.BOOKINGS.ROOT, { id: bookingId, status: 'CANCELLED' });
        } catch {}
      }
      toast.error(error.response?.data?.message || 'Booking failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Amount due */}
      <div className="flex items-center justify-between rounded-2xl border border-[#e8dcc8] bg-[#fbf8f2] px-5 py-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">Amount due</p>
          <p className="mt-0.5 text-xs text-[#3a1224]/50">
            Reservation held — complete payment to confirm your slot
          </p>
        </div>
        <p className="text-2xl font-black text-[#3a1224]">NPR {total.toLocaleString()}</p>
      </div>

      {/* Payment method */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#3a1224]/45">
          Payment method
        </p>
        {[
          {
            value: 'ONLINE',
            label: 'Pay online',
            desc: 'Instant confirmation — Khalti or eSewa',
          },
          {
            value: 'CASH',
            label: 'Cash on arrival',
            desc: 'Submit a request — requires admin approval before confirmation',
          },
        ].map((method) => {
          const isSelected = paymentMethod === method.value;
          return (
            <button
              key={method.value}
              type="button"
              onClick={() => setPaymentMethod(method.value)}
              className={cn(
                'flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition',
                isSelected
                  ? 'border-[#C0A04C] bg-[#C0A04C]/8 shadow-[0_0_0_1px_#C0A04C]'
                  : 'border-[#e8dcc8] bg-white hover:border-[#C0A04C]/50'
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition',
                  isSelected ? 'border-[#C0A04C] bg-[#C0A04C]' : 'border-[#d4c4a8] bg-white'
                )}
              >
                {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
              <span>
                <span className="block text-sm font-black text-[#3a1224]">{method.label}</span>
                <span className="mt-0.5 block text-xs text-[#3a1224]/55">{method.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Gateway selector — online only */}
      {paymentMethod === 'ONLINE' && (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#3a1224]/45">
            Payment gateway
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'KHALTI', label: 'Khalti', desc: "Nepal's most trusted digital wallet" },
              { value: 'ESEWA', label: 'eSewa', desc: 'Widely accepted across Nepal' },
            ].map((gw) => {
              const isSelected = gateway === gw.value;
              return (
                <button
                  key={gw.value}
                  type="button"
                  onClick={() => setGateway(gw.value)}
                  className={cn(
                    'flex flex-col rounded-2xl border px-4 py-3 text-left transition',
                    isSelected
                      ? 'border-[#C0A04C] bg-[#C0A04C]/8 shadow-[0_0_0_1px_#C0A04C]'
                      : 'border-[#e8dcc8] bg-white hover:border-[#C0A04C]/50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-[#3a1224]">{gw.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#C0A04C]" />}
                  </div>
                  <span className="mt-0.5 text-xs text-[#3a1224]/50">{gw.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cash approval notice */}
      {paymentMethod === 'CASH' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-800">
          Your booking will be submitted as a pending request. An admin will review and confirm it.
          You will receive a notification once approved.
        </div>
      )}

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs text-[#3a1224]/40">
        <Lock className="h-3.5 w-3.5 shrink-0" />
        <span>256-bit SSL — your payment details are never stored on our servers</span>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={isSubmitting}
          className="flex h-11 flex-1 items-center justify-center rounded-2xl border border-[#e8dcc8] bg-white text-[11px] font-black uppercase tracking-[0.18em] text-[#3a1224] transition hover:bg-[#f8f4ed] disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#3a1224] text-[11px] font-black uppercase tracking-[0.18em] text-[#C0A04C] transition hover:bg-[#4a172d] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Processing…
            </>
          ) : paymentMethod === 'CASH' ? (
            'Submit booking'
          ) : (
            'Pay now'
          )}
        </button>
      </div>
    </div>
  );
}
