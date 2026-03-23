import React from 'react'
import { MapPin, Calendar, Clock, Users, DollarSign } from 'lucide-react'

export default function BookingSummary({hall, bookingData, calculateTotal}) {
  const total = calculateTotal()
  const pricePerHour = Number(hall?.pricePerHour) || 0
  const multiplier = (bookingData?.slot === 'wholeday') ? 15 : 5
  const hallPrice = pricePerHour * multiplier

  return (
    <div className="mb-8 bg-white/95 rounded-3xl shadow-lg border border-[#3a1224]/5 p-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C0A04C]/[0.04] rounded-bl-3xl pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="w-4 h-4 text-[#C0A04C]" />
        <span className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Booking Summary</span>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div>
          <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2">Hall</p>
          <p className="text-sm font-bold text-[#3a1224]">{hall.name}</p>
        </div>
        <div>
          <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2">Date</p>
          <p className="text-sm font-bold text-[#3a1224]">{bookingData.date}</p>
        </div>
        <div>
          <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2">Slot</p>
          <p className="text-sm font-bold text-[#3a1224] capitalize">{bookingData.slot}</p>
        </div>
        <div>
          <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2">Guests</p>
          <p className="text-sm font-bold text-[#3a1224]">{bookingData.guests}</p>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-[#3a1224]/5">
        <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-4">Cost Breakdown</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#3a1224]/70">Hall ({multiplier}h)</span>
            <span className="font-bold text-[#3a1224]">NPR {hallPrice.toLocaleString()}</span>
          </div>
          {bookingData.menuTotal > 0 && (
            <div className="flex items-center justify-between py-3 border-t border-[#3a1224]/5">
              <span className="text-sm text-[#3a1224]/70">Menu</span>
              <span className="font-bold text-[#3a1224]">NPR {bookingData.menuTotal.toLocaleString()}</span>
            </div>
          )}
          {bookingData.decorationTotal > 0 && (
            <div className="flex items-center justify-between py-3 border-t border-[#3a1224]/5">
              <span className="text-sm text-[#3a1224]/70">Decorations</span>
              <span className="font-bold text-[#3a1224]">NPR {bookingData.decorationTotal.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#3a1224] to-[#4a172d] rounded-2xl">
        <span className="text-white font-black text-sm uppercase tracking-widest">Total Amount</span>
        <span className="text-2xl font-display font-bold text-[#C0A04C]">NPR {total.toLocaleString()}</span>
      </div>
    </div>
  )
}
