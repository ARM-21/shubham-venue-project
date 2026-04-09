import { Ticket, AlertCircle, Check } from "lucide-react";
import { useState } from "react";

export function TicketsSection({
  ticketTypes,
  onBuyTicket,
  eventEnded,
  registrationNotStarted,
  registrationStartDate,
  submitting,
  onSelectPaymentGateway,
  selectedPaymentGateway,
  eventCapacity,
  totalSold
}) {
  const remainingTypes = (ticketTypes || []).map((type) => ({
    ...type,
    remaining: Math.max(0, Number(type.quantityTotal || 0) - Number(type.quantitySold || 0)),
  }));

  const totalRemaining = remainingTypes.reduce((sum, t) => sum + t.remaining, 0);
  const occupancyPercentage = eventCapacity ? Math.round((totalSold / eventCapacity) * 100) : 0;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Occupancy Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-white/50 p-8 h-full backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-gradient-to-br from-[#C0A04C]/20 to-[#C0A04C]/5 rounded-lg">
                <Ticket className="w-5 h-5 text-[#C0A04C]" />
              </div>
              <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.3em]">Occupancy</span>
            </div>

            <h3 className="text-2xl font-black text-[#3a1224] mb-8 tracking-tight">
              Event Capacity
            </h3>

            {/* Progress Bar */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#3a1224]/70 uppercase">Capacity Filled</span>
                <span className="text-2xl font-black text-[#C0A04C]">{occupancyPercentage}%</span>
              </div>
              <div className="h-4 bg-[#3a1224]/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#C0A04C] via-[#B8922D] to-[#3a1224] rounded-full transition-all duration-700 shadow-lg shadow-[#C0A04C]/30"
                  style={{ width: `${occupancyPercentage}%` }}
                />
              </div>
              <p className="text-sm text-[#3a1224]/60 font-bold mt-4">
                <span className="text-[#3a1224]">{totalSold}</span> of <span className="text-[#3a1224]">{eventCapacity}</span> Tickets Sold
              </p>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-50/50 rounded-2xl border border-emerald-200/50 hover:shadow-lg transition-all duration-300">
                <p className="text-[8px] font-black text-emerald-600/70 uppercase tracking-[0.15em] mb-2">Sold</p>
                <p className="text-3xl font-black text-emerald-700">{totalSold}</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-50/50 rounded-2xl border border-amber-200/50 hover:shadow-lg transition-all duration-300">
                <p className="text-[8px] font-black text-amber-600/70 uppercase tracking-[0.15em] mb-2">Available</p>
                <p className="text-3xl font-black text-amber-700">{totalRemaining}</p>
              </div>
            </div>

            {/* Status */}
            <div className="mt-8 p-5 bg-gradient-to-r from-[#C0A04C]/10 to-[#3a1224]/5 rounded-2xl border border-[#C0A04C]/20">
              <p className="text-[10px] font-black text-[#3a1224]/50 uppercase tracking-[0.2em] mb-2">Status</p>
              <p className="text-sm font-black text-[#3a1224]">
                {occupancyPercentage < 25 ? 'Plenty Available' : occupancyPercentage < 60 ? 'Limited Spots' : occupancyPercentage < 95 ? 'Almost Full' : 'Sold Out'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Tickets List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-white/50 p-8 lg:p-10 xl:p-12 backdrop-blur-sm">
            <div className="mb-10">
              <div className="h-1 w-24 bg-gradient-to-r from-[#C0A04C] to-transparent mb-6" />
              <h3 className="text-2xl lg:text-3xl font-black text-[#3a1224] mb-2 tracking-tight">
                Choose Your Ticket
              </h3>
              <p className="text-base text-[#3a1224]/60 font-medium">
                Select a ticket type and secure your spot at this exclusive event
              </p>
            </div>

            {/* Status Messages */}
            {eventEnded && (
              <div className="mb-8 p-5 bg-gray-50 border border-gray-300 text-gray-700 rounded-2xl text-sm font-bold uppercase tracking-wider flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>This event has ended. Tickets are no longer available.</span>
              </div>
            )}
            
            {registrationNotStarted && (
              <div className="mb-8 p-5 bg-blue-50 border-2 border-blue-300 text-blue-800 rounded-2xl text-sm font-bold uppercase tracking-wider">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>Registration Opens</p>
                    <p className="text-lg font-black text-blue-900 mt-1">
                      {registrationStartDate ? new Date(registrationStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Soon'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tickets Grid */}
            <div className="space-y-4">
              {remainingTypes.length ? (
                remainingTypes.map((type) => {
                  const soldOut = type.remaining <= 0;
                  const isPaid = Number(type.price || 0) > 0;
                  const priceLabel = isPaid 
                    ? `NPR ${Number(type.price || 0).toLocaleString()}` 
                    : "Free";
                  const occupancy = type.quantityTotal ? Math.round((type.quantitySold / type.quantityTotal) * 100) : 0;
                  
                  return (
                    <div key={type._id} className="space-y-3">
                      {selectedPaymentGateway !== type._id ? (
                        <div className="group p-6 border-2 border-[#3a1224]/10 rounded-2xl hover:border-[#C0A04C] hover:bg-gradient-to-r hover:from-[#fdfaf6] hover:to-white transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <p className="font-black text-lg text-[#3a1224] tracking-tight capitalize mb-2">
                                {type.name}
                              </p>
                              <p className="text-sm text-[#C0A04C] font-black">
                                {priceLabel}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={`text-xs font-black uppercase tracking-widest ${
                                soldOut ? 'text-red-600' : 'text-emerald-600'
                              }`}>
                                {type.remaining > 0 ? `${type.remaining} LEFT` : "SOLD OUT"}
                              </p>
                            </div>
                          </div>

                          {/* Occupancy bar */}
                          <div className="h-2 bg-[#3a1224]/5 rounded-full overflow-hidden mb-4">
                            <div 
                              className="h-full bg-gradient-to-r from-[#C0A04C] to-[#3a1224] transition-all duration-500"
                              style={{ width: `${occupancy}%` }}
                            />
                          </div>

                          <button
                            onClick={() => {
                              if (soldOut || eventEnded || submitting === type._id || registrationNotStarted) return;
                              if (isPaid) {
                                onSelectPaymentGateway(type._id);
                                return;
                              }
                              onBuyTicket(type._id);
                            }}
                            disabled={soldOut || eventEnded || submitting === type._id || registrationNotStarted}
                            className={`w-full py-3 px-4 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                              soldOut || eventEnded || registrationNotStarted
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-[#3a1224] text-white hover:bg-[#C0A04C] hover:text-[#3a1224] hover:shadow-lg hover:shadow-[#C0A04C]/20 group-hover:shadow-[#C0A04C]/20"
                            }`}
                          >
                          
                            {registrationNotStarted
                              ? "COMING SOON"
                              : eventEnded
                              ? "ENDED"
                              : soldOut
                              ? "SOLD OUT"
                              : submitting === type._id
                              ? "PROCESSING..."
                              : isPaid ? "BUY TICKET" : "GET TICKET"}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 p-6 border-2 border-[#C0A04C] bg-gradient-to-r from-[#C0A04C]/5 to-[#C0A04C]/3 rounded-2xl shadow-lg shadow-[#C0A04C]/10">
                          <p className="text-xs font-black text-[#3a1224] uppercase tracking-widest">
                            Select Payment Method
                          </p>
                          <button
                            onClick={() => onBuyTicket(type._id, "ESEWA")}
                            disabled={submitting === type._id}
                            className="w-full py-3 px-4 text-[10px] font-black text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 transition-all duration-300 uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-xl"
                          >
                            <span>eSewa</span>
                          </button>
                          <button
                            onClick={() => onBuyTicket(type._id, "KHALTI")}
                            disabled={submitting === type._id}
                            className="w-full py-3 px-4 text-[10px] font-black text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 uppercase tracking-wider rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl"
                          >
                            Khalti
                          </button>
                          <button
                            onClick={() => onSelectPaymentGateway(null)}
                            disabled={submitting === type._id}
                            className="w-full py-3 px-4 text-[10px] font-black text-[#3a1224] border-2 border-[#3a1224]/20 hover:bg-[#3a1224]/5 hover:border-[#3a1224]/40 transition-all duration-300 uppercase tracking-wider rounded-xl"
                          >
                            ← Back
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 p-8 bg-gradient-to-br from-[#FDFCFB] to-[#fdfaf6] rounded-2xl border border-[#3a1224]/5">
                  <p className="text-[#3a1224]/60 text-base font-semibold">No tickets available yet</p>
                  <p className="text-[#3a1224]/40 text-sm mt-2">Check back soon for ticket availability</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
