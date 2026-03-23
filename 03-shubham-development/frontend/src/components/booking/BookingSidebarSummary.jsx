import React from 'react';
import { Calendar, Clock, Users, Check, Edit2 } from 'lucide-react';

export default function BookingSidebarSummary({ 
  hall, 
  bookingData, 
  calculateTotal,
  onEditStep,
  isCompactView = false
}) {
  const total = calculateTotal();
  const pricePerHour = Number(hall?.pricePerHour) || 0;
  const multiplier = (bookingData?.slot === 'wholeday') ? 15 : 5;
  const hallPrice = pricePerHour * multiplier;

  if (isCompactView) {
    // Compact view for non-interactive steps
    return (
      <div className="sticky top-24 bg-white rounded-3xl p-6 border-2 border-[#3a1224]/10 shadow-lg space-y-4">
        {/* Venue Image */}
        <div className="rounded-2xl overflow-hidden h-32 bg-gradient-to-br from-[#C0A04C]/20 to-[#3a1224]/20">
          <img
            src={hall.images?.[0] || '/assets/business-images/placeholder.jpg'}
            alt={hall.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Venue Name */}
        <div>
          <h3 className="font-display font-bold text-[#3a1224] text-base leading-tight">
            {hall.name}
          </h3>
          <p className="text-xs text-[#3a1224]/50 mt-1">Venue Details</p>
        </div>

        {/* Key Details */}
        <div className="space-y-2 bg-[#fdfaf6] rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-[#3a1224]/70">
            <Calendar className="w-4 h-4 text-[#C0A04C] flex-shrink-0" />
            <span>{new Date(bookingData.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#3a1224]/70">
            <Clock className="w-4 h-4 text-[#C0A04C] flex-shrink-0" />
            <span>{bookingData.slot === 'wholeday' ? '24 hours' : bookingData.slot}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#3a1224]/70">
            <Users className="w-4 h-4 text-[#C0A04C] flex-shrink-0" />
            <span>{bookingData.guests} Guest{bookingData.guests !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Price Breakdown (Compact) */}
        <div className="border-t border-[#3a1224]/10 pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-[#3a1224]/70">
            <span>Hall ({multiplier}h)</span>
            <span className="font-semibold text-[#3a1224]">₹{hallPrice.toLocaleString()}</span>
          </div>
          {bookingData.menuTotal > 0 && (
            <div className="flex justify-between text-[#3a1224]/70">
              <span>Menu</span>
              <span className="font-semibold text-[#3a1224]">₹{bookingData.menuTotal.toLocaleString()}</span>
            </div>
          )}
          {bookingData.decorationTotal > 0 && (
            <div className="flex justify-between text-[#3a1224]/70">
              <span>Decorations</span>
              <span className="font-semibold text-[#3a1224]">₹{bookingData.decorationTotal.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-[#C0A04C]/10 to-[#D4B557]/10 rounded-xl p-3 border border-[#C0A04C]/20">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-xs uppercase text-[#3a1224]/60 tracking-widest">Total</span>
            <span className="text-2xl font-display font-bold text-[#C0A04C]">
              ₹{total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2 text-xs text-[#3a1224]/50 pt-2">
          <div className="w-3 h-3 rounded-full bg-green-500/30 flex items-center justify-center">
            <Check className="w-2 h-2 text-green-600" />
          </div>
          <span>Secure Payment • SSL Encrypted</span>
        </div>
      </div>
    );
  }

  // Full view for interactive steps
  return (
    <div className="sticky top-24 bg-white rounded-3xl p-8 border-2 border-[#3a1224]/10 shadow-lg space-y-6">
      {/* Venue Image */}
      <div className="rounded-2xl overflow-hidden h-40 bg-gradient-to-br from-[#C0A04C]/20 to-[#3a1224]/20 group relative overflow-hidden">
        <img
          src={hall.images?.[0] || '/assets/business-images/placeholder.jpg'}
          alt={hall.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Venue Info */}
      <div>
        <h3 className="font-display font-bold text-[#3a1224] text-lg">{hall.name}</h3>
        <p className="text-xs text-[#3a1224]/50 mt-1 uppercase tracking-widest">Booking Summary</p>
      </div>

      {/* Booking Details */}
      <div className="space-y-3 bg-[#fdfaf6] rounded-2xl p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#C0A04C]/20 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#C0A04C]" />
            </div>
            <div>
              <p className="text-xs font-black text-[#3a1224]/50 uppercase">Date</p>
              <p className="text-sm font-semibold text-[#3a1224]">
                {new Date(bookingData.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#C0A04C]/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#C0A04C]" />
            </div>
            <div>
              <p className="text-xs font-black text-[#3a1224]/50 uppercase">Slot</p>
              <p className="text-sm font-semibold text-[#3a1224]">
                {bookingData.slot === 'wholeday' ? '24h' : bookingData.slot}
              </p>
            </div>
          </div>
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#C0A04C]/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-[#C0A04C]" />
              </div>
              <div>
                <p className="text-xs font-black text-[#3a1224]/50 uppercase">Guests</p>
                <p className="text-sm font-semibold text-[#3a1224]">{bookingData.guests} Person{bookingData.guests !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 border-t border-[#3a1224]/10 pt-4">
        <p className="text-xs font-black text-[#3a1224]/50 uppercase tracking-widest">Pricing</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-[#3a1224]/70">
            <span>Hall Rental ({multiplier}h)</span>
            <span className="font-semibold text-[#3a1224]">₹{hallPrice.toLocaleString()}</span>
          </div>
          {bookingData.menuTotal > 0 && (
            <div className="flex justify-between text-[#3a1224]/70 bg-amber-50/40 rounded px-2 py-1">
              <span>Menu & Dining</span>
              <span className="font-semibold text-[#3a1224]">₹{bookingData.menuTotal.toLocaleString()}</span>
            </div>
          )}
          {bookingData.decorationTotal > 0 && (
            <div className="flex justify-between text-[#3a1224]/70 bg-pink-50/40 rounded px-2 py-1">
              <span>Decorations</span>
              <span className="font-semibold text-[#3a1224]">₹{bookingData.decorationTotal.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-[#C0A04C]/15 via-[#D4B557]/15 to-[#C0A04C]/15 rounded-2xl p-4 border border-[#C0A04C]/20">
        <div className="flex justify-between items-center">
          <span className="font-black text-xs uppercase text-[#3a1224]/60 tracking-widest">Total Amount</span>
          <span className="text-3xl font-display font-bold text-[#C0A04C]">
            ₹{total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-[#3a1224]/50 p-3 bg-green-50/40 rounded-lg border border-green-200/20">
        <Check className="w-4 h-4 text-green-600" />
        <span>Secure Payment • SSL Encrypted • PCI Compliant</span>
      </div>
    </div>
  );
}
