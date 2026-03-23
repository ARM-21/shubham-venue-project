import { Ticket, AlertCircle, Check } from "lucide-react";
import { useState } from "react";

export function TicketsSection({
  ticketTypes,
  onBuyTicket,
  eventEnded,
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Card */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-[#3a1224]/5 p-6 md:p-8 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <Ticket className="w-5 h-5 text-[#C0A04C]" />
            <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.3em]">Occupancy</span>
          </div>

          <h3 className="text-2xl font-display font-bold text-[#3a1224] mb-6 tracking-tight">
            Event Status
          </h3>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#3a1224]/70">Capacity Filled</span>
              <span className="text-lg font-display font-bold text-[#C0A04C]">{occupancyPercentage}%</span>
            </div>
            <div className="h-4 bg-[#3a1224]/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#C0A04C] via-[#B8922D] to-[#3a1224] rounded-full transition-all duration-700 shadow-lg shadow-[#C0A04C]/30"
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
            <p className="text-sm text-[#3a1224]/60 font-bold mt-3">
              {totalSold}/{eventCapacity} Registered
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-50/50 rounded-2xl border border-green-200/50 hover:shadow-lg transition-all duration-300">
              <p className="text-[8px] font-black text-green-600/70 uppercase tracking-[0.15em] mb-2">Tickets Sold</p>
              <p className="text-3xl font-display font-bold text-green-700">{totalSold}</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-50/50 rounded-2xl border border-amber-200/50 hover:shadow-lg transition-all duration-300">
              <p className="text-[8px] font-black text-amber-600/70 uppercase tracking-[0.15em] mb-2">Available</p>
              <p className="text-3xl font-display font-bold text-amber-700">{totalRemaining}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-8 p-4 bg-gradient-to-r from-[#C0A04C]/10 to-[#3a1224]/5 rounded-xl border border-[#C0A04C]/20">
            <p className="text-[10px] font-black text-[#3a1224]/50 uppercase tracking-[0.2em] mb-1">Overall Status</p>
            <p className="text-sm font-bold text-[#3a1224]">
              {occupancyPercentage < 30 ? '🟢 Plenty of Room' : occupancyPercentage < 70 ? '🟡 Moderate Interest' : '🔴 Filling Up Fast'}
            </p>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-[#3a1224]/5 p-6 md:p-8 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-[1px] bg-[#C0A04C]" />
            <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.3em]">Tickets</span>
          </div>

          <h3 className="text-2xl font-display font-bold text-[#3a1224] mb-2 tracking-tight">
            Get Your Ticket
          </h3>
          <p className="text-sm text-[#3a1224]/60 mb-6 font-medium">
            Secure your spot at this exclusive event
          </p>

          {eventEnded && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Event has ended
            </div>
          )}

          <div className="space-y-3">
            {remainingTypes.length ? (
              remainingTypes.map((type) => {
                const soldOut = type.remaining <= 0;
                const isPaid = Number(type.price || 0) > 0;
                const priceLabel = isPaid 
                  ? `NPR ${Number(type.price || 0).toLocaleString()}` 
                  : "Free";
                const occupancy = Math.round((type.quantitySold / type.quantityTotal) * 100);
                
                return (
                  <div key={type._id} className="space-y-2">
                    {selectedPaymentGateway !== type._id ? (
                      <div className="group p-4 border border-[#3a1224]/10 rounded-2xl hover:border-[#C0A04C] hover:bg-[#fdfaf6] transition-all duration-300 cursor-pointer">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-[#3a1224] tracking-tight capitalize">
                              {type.name}
                            </p>
                            <p className="text-xs text-[#C0A04C] font-bold mt-1">
                              {priceLabel}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-[#3a1224]/60 uppercase">
                              {type.remaining > 0 ? `${type.remaining} Left` : "Sold Out"}
                            </p>
                          </div>
                        </div>

                        {/* Mini progress bar */}
                        <div className="h-1.5 bg-[#3a1224]/5 rounded-full overflow-hidden mb-3">
                          <div 
                            className="h-full bg-gradient-to-r from-[#C0A04C] to-[#3a1224]"
                            style={{ width: `${occupancy}%` }}
                          />
                        </div>

                        <button
                          onClick={() => {
                            if (soldOut || eventEnded || submitting === type._id) return;
                            if (isPaid) {
                              onSelectPaymentGateway(type._id);
                              return;
                            }
                            onBuyTicket(type._id);
                          }}
                          disabled={soldOut || eventEnded || submitting === type._id}
                          className={`w-full py-2.5 px-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition duration-300 flex items-center justify-center gap-2 ${
                            soldOut || eventEnded
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-[#3a1224] text-white hover:bg-[#C0A04C] hover:text-[#3a1224] group-hover:shadow-lg group-hover:shadow-[#C0A04C]/20"
                          }`}
                        >
                          {eventEnded
                            ? "ENDED"
                            : soldOut
                            ? "SOLD OUT"
                            : submitting === type._id
                            ? "PROCESSING..."
                            : isPaid ? "BUY TICKET" : "GET TICKET"}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 p-4 border border-[#C0A04C] bg-[#C0A04C]/5 rounded-2xl">
                        <p className="text-xs font-black text-[#3a1224] uppercase tracking-widest">
                          Choose Payment Method
                        </p>
                        <button
                          onClick={() => onBuyTicket(type._id, "ESEWA")}
                          disabled={submitting === type._id}
                          className="w-full py-2.5 px-3 text-[10px] font-black text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 transition duration-300 uppercase tracking-wider rounded-xl flex items-center justify-center gap-2"
                        >
                          <span>eSewa</span>
                        </button>
                        <button
                          onClick={() => onBuyTicket(type._id, "KHALTI")}
                          disabled={submitting === type._id}
                          className="w-full py-2.5 px-3 text-[10px] font-black text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 transition duration-300 uppercase tracking-wider rounded-xl"
                        >
                          Khalti
                        </button>
                        <button
                          onClick={() => onSelectPaymentGateway(null)}
                          disabled={submitting === type._id}
                          className="w-full py-2.5 px-3 text-[10px] font-black text-[#3a1224] border border-[#3a1224]/20 hover:bg-[#3a1224]/5 transition duration-300 uppercase tracking-wider rounded-xl"
                        >
                          Back
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-center py-8 text-[#3a1224]/60 text-sm font-medium">
                No tickets available yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
