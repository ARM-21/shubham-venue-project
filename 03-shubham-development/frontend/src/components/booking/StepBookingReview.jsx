'use client';

import { useState } from 'react';
import { CheckCircle, Edit2, AlertCircle } from 'lucide-react';

export default function StepBookingReview({ 
  hall, 
  bookingData, 
  calculateTotal, 
  onPrev, 
  onNext,
  onEditStep 
}) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const pricePerHour = Number(hall?.pricePerHour) || 0;
  const multiplier = (bookingData?.slot === 'wholeday') ? 15 : 5;
  const hallPrice = pricePerHour * multiplier;
  const total = calculateTotal();

  const handleSubmit = () => {
    if (!termsAccepted) {
      alert('Please accept terms and conditions');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-6 bg-[#C0A04C]"></div>
        <div>
          <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Step 4</p>
          <h2 className="text-2xl font-display font-black text-[#3a1224]">Review Your Booking</h2>
          <p className="text-sm text-[#3a1224]/60 mt-1">Everything looks good? Let's confirm</p>
        </div>
      </div>

      {/* Venue Details Section */}
      <div className="bg-white/95 border border-[#3a1224]/5 rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Venue & Date</p>
          <button
            onClick={() => onEditStep('details')}
            className="flex items-center gap-2 text-[#C0A04C] hover:text-[#3a1224] transition-colors font-black text-[9px] uppercase tracking-widest"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#3a1224]/60">Hall</span>
              <span className="font-black text-[#3a1224]">{hall.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#3a1224]/60">Date</span>
              <span className="font-black text-[#3a1224]">{bookingData.date}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#3a1224]/60">Time Slot</span>
              <span className="font-black text-[#3a1224] capitalize">{bookingData.slot}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#3a1224]/60">Guests</span>
              <span className="font-black text-[#3a1224]">{bookingData.guests}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Details Section */}
      <div className="bg-white/95 border border-[#3a1224]/5 rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Contact Information</p>
          <button
            onClick={() => onEditStep('contact')}
            className="flex items-center gap-2 text-[#C0A04C] hover:text-[#3a1224] transition-colors font-black text-[9px] uppercase tracking-widest"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#3a1224]/60">Name</span>
            <span className="font-black text-[#3a1224]">{bookingData.fullName || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#3a1224]/60">Phone</span>
            <span className="font-black text-[#3a1224]">{bookingData.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#3a1224]/60">Email</span>
            <span className="font-black text-[#3a1224] truncate">{bookingData.email || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#3a1224]/60">Delivery Address</span>
            <span className="font-black text-[#3a1224] text-right max-w-xs">{bookingData.address || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Menu Section (if not organizer) */}
      {bookingData.menuTotal > 0 && (
        <div className="bg-white/95 border border-[#3a1224]/5 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Menu Selection</p>
            <button
              onClick={() => onEditStep('menu')}
              className="flex items-center gap-2 text-[#C0A04C] hover:text-[#3a1224] transition-colors font-black text-[9px] uppercase tracking-widest"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          </div>

          <div className="space-y-2">
            {bookingData.selectedPackage ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#3a1224]/60">{bookingData.selectedPackage.name}</span>
                <span className="font-black text-[#3a1224]">NPR {bookingData.menuTotal.toLocaleString()}</span>
              </div>
            ) : (
              <div>
                <p className="text-sm font-black text-[#3a1224] mb-2">Custom Items ({bookingData.selectedMenu?.length || 0})</p>
                {bookingData.selectedMenu?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-[#3a1224]/60">{item.name} x{item.quantity}</span>
                    <span className="text-[#3a1224]">NPR {item.total?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decorations Section (if not organizer) */}
      {bookingData.decorationTotal > 0 && (
        <div className="bg-white/95 border border-[#3a1224]/5 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Decorations</p>
            <button
              onClick={() => onEditStep('decor')}
              className="flex items-center gap-2 text-[#C0A04C] hover:text-[#3a1224] transition-colors font-black text-[9px] uppercase tracking-widest"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          </div>

          <div className="space-y-2">
            {bookingData.decorationScheme && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#3a1224]/60">{bookingData.decorationScheme.name}</span>
                <span className="font-black text-[#3a1224]">NPR {bookingData.decorationScheme.price?.toLocaleString()}</span>
              </div>
            )}
            {bookingData.addons?.map((addon, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-[#3a1224]/60">{addon.name}</span>
                <span className="font-black text-[#3a1224]">NPR {addon.price?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost Summary */}
      <div className="bg-gradient-to-br from-[#3a1224] to-[#4a172d] rounded-3xl p-8 shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-[#C0A04C] uppercase tracking-widest">Hall ({multiplier}h)</span>
            <span className="font-black text-[#C0A04C]">NPR {hallPrice.toLocaleString()}</span>
          </div>
          {bookingData.menuTotal > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-[#C0A04C] uppercase tracking-widest">Menu</span>
              <span className="font-black text-[#C0A04C]">NPR {bookingData.menuTotal?.toLocaleString()}</span>
            </div>
          )}
          {bookingData.decorationTotal > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-[#C0A04C] uppercase tracking-widest">Decorations</span>
              <span className="font-black text-[#C0A04C]">NPR {bookingData.decorationTotal?.toLocaleString()}</span>
            </div>
          )}
          <div className="pt-4 border-t border-[#C0A04C]/20 flex items-center justify-between">
            <span className="text-[9px] font-black text-[#C0A04C] uppercase tracking-widest">Total Amount</span>
            <span className="text-3xl font-display font-black text-[#C0A04C]">NPR {total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-black text-blue-900 mb-2">Please Review Before Confirming</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ All information is accurate and complete</li>
              <li>✓ Delivery address is correct</li>
              <li>✓ Contact number is verified</li>
              <li>✓ Event date and time are as intended</li>
            </ul>
          </div>
        </div>

        <label className="flex items-start gap-3 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="w-5 h-5 text-[#C0A04C] border-blue-300 rounded mt-0.5 cursor-pointer"
          />
          <span className="text-sm font-black text-blue-900">
            I confirm that all information is correct and agree to the <span className="text-blue-600 underline cursor-pointer">terms and conditions</span>
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          onClick={onPrev}
          className="flex-1 h-12 px-6 border border-[#3a1224]/10 text-[#3a1224] font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!termsAccepted}
          className="flex-1 h-12 px-6 bg-[#3a1224] text-[#C0A04C] font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-[#4a172d] transition-colors shadow-lg cursor-pointer disabled:opacity-60"
        >
          Proceed to Payment →
        </button>
      </div>
    </div>
  );
}
