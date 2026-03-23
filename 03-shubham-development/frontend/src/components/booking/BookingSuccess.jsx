'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, Download, Share2, Calendar, MapPin, DollarSign, Phone, Mail } from 'lucide-react';
import { ROUTES } from 'config/routes';

export default function BookingSuccess({ booking, hallDetails }) {
  const router = useRouter();

  const handleDownloadReceipt = () => {
    // Generate PDF receipt
    const content = `
    BOOKING CONFIRMATION
    Booking ID: ${booking._id}
    Date: ${new Date().toLocaleDateString()}
    
    Event Details:
    Date: ${booking.eventDate}
    Time: ${booking.slot}
    Guests: ${booking.guests}
    
    Contact:
    Name: ${booking.fullName}
    Phone: ${booking.phone}
    Email: ${booking.email}
    
    Cost Summary:
    Hall: NPR ${booking.hallPrice}
    Menu: NPR ${booking.menuTotal || 0}
    Decorations: NPR ${booking.decorationTotal || 0}
    Total: NPR ${booking.totalAmount}
    
    Status: ${booking.status}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `booking-${booking._id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = () => {
    const text = `I just booked ${hallDetails?.name}! Event on ${booking.eventDate} with ${booking.guests} guests. Total: NPR ${booking.totalAmount}. Check it out at our venue!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Booking Confirmation',
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Booking details copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3a1224]/5 to-[#C0A04C]/5 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#C0A04C] rounded-full blur-xl opacity-30 animate-pulse"></div>
              <CheckCircle className="w-20 h-20 text-[#C0A04C] relative" strokeWidth={1.5} />
            </div>
          </div>
          
          <h1 className="text-4xl font-display font-black text-[#3a1224] mb-3">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-lg text-[#3a1224]/60">
            Your event is confirmed and locked in
          </p>
        </div>

        {/* Booking Reference Card */}
        <div className="bg-white/95 border border-[#3a1224]/5 rounded-3xl p-8 shadow-lg mb-6">
          <div className="text-center mb-8 pb-8 border-b border-[#3a1224]/10">
            <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2">Booking Reference</p>
            <p className="text-3xl font-display font-black text-[#3a1224] font-mono tracking-wider">
              {booking._id?.substring(0, 8).toUpperCase()}
            </p>
            <p className="text-sm text-[#3a1224]/60 mt-2">
              Save this code for your records
            </p>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#C0A04C] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Event Date</p>
                <p className="font-black text-[#3a1224] text-lg">{booking.eventDate}</p>
                <p className="text-sm text-[#3a1224]/60">{booking.slot}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#C0A04C] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Venue</p>
                <p className="font-black text-[#3a1224] text-lg">{hallDetails?.name}</p>
                <p className="text-sm text-[#3a1224]/60">{booking.guests} guests</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#C0A04C] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Contact</p>
                <p className="font-black text-[#3a1224] text-lg">{booking.fullName}</p>
                <p className="text-sm text-[#3a1224]/60">{booking.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#C0A04C] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Email</p>
                <p className="font-black text-[#3a1224] text-lg break-all">{booking.email}</p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-4">Cost Summary</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#3a1224]">Hall Booking</span>
                <span className="font-black text-[#3a1224]">NPR {booking.hallPrice?.toLocaleString()}</span>
              </div>
              {booking.menuTotal > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[#3a1224]">Menu</span>
                  <span className="font-black text-[#3a1224]">NPR {booking.menuTotal?.toLocaleString()}</span>
                </div>
              )}
              {booking.decorationTotal > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[#3a1224]">Decorations</span>
                  <span className="font-black text-[#3a1224]">NPR {booking.decorationTotal?.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-3 border-t border-[#3a1224]/10 flex items-center justify-between">
                <span className="font-black text-[#3a1224]">Total Amount</span>
                <span className="text-2xl font-black text-[#C0A04C]">NPR {booking.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className={`p-4 rounded-2xl border-2 ${
            booking.paymentStatus === 'paid'
              ? 'bg-green-50 border-green-200'
              : booking.paymentStatus === 'pending'
              ? 'bg-amber-50 border-amber-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-2">
              {booking.paymentStatus === 'paid' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-black text-green-900">Payment Completed</span>
                </>
              ) : (
                <>
                  <span className="w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center text-white text-xs">!</span>
                  <span className="font-black text-amber-900">Payment Pending</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 mb-6">
          <h3 className="font-black text-blue-900 mb-4">What's Next?</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex gap-3">
              <span className="font-black text-blue-600 min-w-fit">1.</span>
              <span>Check your email for confirmation and booking details</span>
            </div>
            <div className="flex gap-3">
              <span className="font-black text-blue-600 min-w-fit">2.</span>
              <span>Our team will contact you 7 days before the event</span>
            </div>
            <div className="flex gap-3">
              <span className="font-black text-blue-600 min-w-fit">3.</span>
              <span>Final confirmation and any last-minute adjustments</span>
            </div>
            <div className="flex gap-3">
              <span className="font-black text-blue-600 min-w-fit">4.</span>
              <span>Event day setup and execution</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDownloadReceipt}
            className="flex-1 flex items-center justify-center gap-2 h-12 px-6 border border-[#3a1224]/10 text-[#3a1224] font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
          
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 h-12 px-6 border border-[#3a1224]/10 text-[#3a1224] font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            Share Booking
          </button>

          <button
            onClick={() => router.push(ROUTES.SITE.BOOKINGS)}
            className="flex-1 h-12 px-6 bg-[#3a1224] text-[#C0A04C] font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-[#4a172d] transition-colors shadow-lg cursor-pointer"
          >
            View My Bookings
          </button>
        </div>

        {/* Home Button */}
        <button
          onClick={() => router.push(ROUTES.HOME)}
          className="w-full mt-4 h-12 px-6 text-[#3a1224] font-black text-[9px] uppercase tracking-widest rounded-xl hover:underline transition-colors cursor-pointer"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
