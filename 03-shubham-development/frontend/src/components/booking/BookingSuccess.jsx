'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from 'lib/axios';
import { ROUTES } from 'config/routes';
import { CheckCircle, Calendar, MapPin, Users, DollarSign, Loader2 } from 'lucide-react';
import { SLOT_LABELS } from 'constants/slots';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function BookingSuccess({ bookingReference }) {
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingReference) { setLoading(false); return; }
    axiosInstance
      .get(`${ROUTES.API.BOOKINGS.ROOT}/${bookingReference}`)
      .then((res) => setBooking(res.data.booking || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingReference]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#C0A04C]" />
      </div>
    );
  }

  const isCash = !booking?.paymentId;
  const ref = booking?._id?.toString().slice(-8).toUpperCase() ?? '—';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3a1224]/5 to-[#C0A04C]/5 py-12 px-6">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-[#C0A04C] opacity-30 blur-xl" />
              <CheckCircle className="relative h-20 w-20 text-[#C0A04C]" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-black text-[#3a1224]">
            {isCash ? 'Booking Submitted' : 'Booking Confirmed'}
          </h1>
          <p className="text-[#3a1224]/60">
            {isCash
              ? 'Your request is under review — an admin will confirm it shortly.'
              : 'Your slot is locked in. Check your email for confirmation.'}
          </p>
        </div>

        {/* Card */}
        <div className="mb-6 rounded-3xl border border-[#3a1224]/5 bg-white/95 p-8 shadow-lg">

          {/* Reference */}
          <div className="mb-8 border-b border-[#3a1224]/10 pb-8 text-center">
            <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-[#3a1224]/40">
              Booking Reference
            </p>
            <p className="font-mono text-3xl font-black tracking-wider text-[#3a1224]">{ref}</p>
            <p className="mt-2 text-sm text-[#3a1224]/60">Save this for your records</p>
          </div>

          {/* Details grid */}
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Detail icon={Calendar} label="Date & Slot">
              <p className="font-black text-[#3a1224]">{formatDate(booking?.date)}</p>
              <p className="text-sm text-[#3a1224]/60">{SLOT_LABELS?.[booking?.slot] ?? booking?.slot}</p>
            </Detail>

            <Detail icon={MapPin} label="Venue">
              <p className="font-black text-[#3a1224]">{booking?.hallId?.name ?? '—'}</p>
              <p className="text-sm text-[#3a1224]/60">{booking?.guests} guests</p>
            </Detail>

            <Detail icon={Users} label="Event">
              <p className="font-black text-[#3a1224]">{booking?.eventName || '—'}</p>
              <p className="text-sm text-[#3a1224]/60">{booking?.eventType || ''}</p>
            </Detail>

            <Detail icon={DollarSign} label="Total">
              <p className="font-black text-[#3a1224]">
                NPR {Number(booking?.totalAmount ?? 0).toLocaleString()}
              </p>
              <p className="text-sm text-[#3a1224]/60">
                {isCash ? 'Cash on arrival' : 'Paid online'}
              </p>
            </Detail>
          </div>

          {/* Status badge */}
          <div className={`rounded-2xl border-2 p-4 ${
            booking?.status === 'CONFIRMED'
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-amber-200 bg-amber-50'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-5 w-5 ${
                booking?.status === 'CONFIRMED' ? 'text-emerald-600' : 'text-amber-600'
              }`} />
              <span className={`font-black ${
                booking?.status === 'CONFIRMED' ? 'text-emerald-900' : 'text-amber-900'
              }`}>
                {booking?.status === 'CONFIRMED' ? 'Confirmed' : 'Awaiting Admin Approval'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => router.push(ROUTES.SITE.BOOKINGS)}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#3a1224] px-6 text-[9px] font-black uppercase tracking-widest text-[#C0A04C] shadow-lg transition hover:bg-[#4a172d]"
          >
            View My Bookings
          </button>
          <button
            onClick={() => router.push(ROUTES.HOME)}
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-[#3a1224]/10 px-6 text-[9px] font-black uppercase tracking-widest text-[#3a1224] transition hover:bg-gray-50"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#C0A04C]" />
      <div>
        <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-[#3a1224]/40">{label}</p>
        {children}
      </div>
    </div>
  );
}
