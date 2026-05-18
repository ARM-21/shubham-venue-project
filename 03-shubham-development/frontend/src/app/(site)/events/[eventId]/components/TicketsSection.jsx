function getPriceLabel(price) {
  const value = Number(price || 0);
  return value > 0 ? `NPR ${value.toLocaleString()}` : "Free";
}

function getAvailabilityLabel(ticket, eventEnded, registrationNotStarted) {
  if (eventEnded) return "Ended";
  if (registrationNotStarted) return "Opens soon";
  if (ticket.remaining <= 0) return "Sold out";
  if (ticket.remaining <= 5) return "Limited";
  return "Available";
}

function statusClass(label) {
  if (label === "Available") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (label === "Limited") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-[#3a1224]/5 text-[#3a1224]/50 border-[#3a1224]/10";
}

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
  totalSold,
}) {
  const remainingTypes = (ticketTypes || []).map((type) => ({
    ...type,
    remaining: Math.max(0, Number(type.quantityTotal || 0) - Number(type.quantitySold || 0)),
  }));

  const totalRemaining = remainingTypes.reduce((sum, t) => sum + t.remaining, 0);
  const capacity = Number(eventCapacity || 0);
  const sold = Number(totalSold || 0);
  const occupancy = capacity ? Math.min(100, Math.round((sold / capacity) * 100)) : 0;

  return (
    <aside id="tickets" className="scroll-mt-28 rounded-2xl border border-[#e8dcc8] bg-white p-5 shadow-[0_16px_44px_-28px_rgba(58,18,36,0.35)] sm:p-6">
      <div className="mb-5">
        <p className="site-eyebrow mb-1.5">Tickets</p>
        <h2 className="text-xl font-black text-[#3a1224]">Book your ticket</h2>
        <p className="mt-1.5 text-sm text-[#3a1224]/55">
          Select a ticket type and proceed to payment.
        </p>
      </div>

      {/* Occupancy */}
      {capacity > 0 && (
        <div className="mb-5 rounded-xl border border-[#e8dcc8] bg-[#fbf8f2] p-4">
          <div className="mb-2 flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-[#3a1224]/60">Availability</span>
            <span className="text-sm font-black text-[#3a1224]">{totalRemaining} left</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#e8dcc8]">
            <div className="h-full rounded-full bg-[#C0A04C] transition-all" style={{ width: `${occupancy}%` }} />
          </div>
          <p className="mt-2 text-xs text-[#3a1224]/50">
            {sold} sold · {capacity} total capacity
          </p>
        </div>
      )}

      {/* Status notices */}
      {eventEnded && (
        <div className="mb-4 rounded-xl border border-[#3a1224]/10 bg-[#3a1224]/5 px-4 py-3 text-sm font-medium text-[#3a1224]/65">
          This event has ended.
        </div>
      )}
      {registrationNotStarted && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Registration opens{" "}
          {registrationStartDate
            ? new Date(registrationStartDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "soon"}
          .
        </div>
      )}

      {/* Ticket rows */}
      <div className="space-y-2.5">
        {remainingTypes.length ? (
          remainingTypes.map((type) => {
            const soldOut = type.remaining <= 0;
            const isPaid = Number(type.price || 0) > 0;
            const disabled = soldOut || eventEnded || registrationNotStarted || submitting === type._id;
            const status = getAvailabilityLabel(type, eventEnded, registrationNotStarted);

            if (selectedPaymentGateway === type._id) {
              return (
                <div key={type._id} className="rounded-xl border border-[#C0A04C] bg-[#C0A04C]/8 p-4">
                  <p className="text-sm font-black text-[#3a1224]">{type.name}</p>
                  <p className="mt-1 text-xs text-[#3a1224]/55">Select payment method</p>
                  <div className="mt-3 grid gap-2">
                    <button
                      onClick={() => onBuyTicket(type._id, "ESEWA")}
                      disabled={submitting === type._id}
                      className="cursor-pointer rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Pay with eSewa
                    </button>
                    <button
                      onClick={() => onBuyTicket(type._id, "KHALTI")}
                      disabled={submitting === type._id}
                      className="cursor-pointer rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Pay with Khalti
                    </button>
                    <button
                      onClick={() => onSelectPaymentGateway(null)}
                      disabled={submitting === type._id}
                      className="cursor-pointer rounded-xl border border-[#3a1224]/15 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-[#3a1224] transition hover:bg-[#3a1224]/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Back
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={type._id} className="rounded-xl border border-[#e8dcc8] bg-white p-4 transition hover:border-[#C0A04C]/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black capitalize text-[#3a1224]">{type.name}</h3>
                    <p className="mt-0.5 text-xl font-black text-[#C0A04C]">{getPriceLabel(type.price)}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${statusClass(status)}`}>
                    {status}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center gap-3 text-xs text-[#3a1224]/50">
                  <span>{type.quantitySold || 0} sold</span>
                  <span>·</span>
                  <span>{type.remaining} remaining</span>
                </div>
                <button
                  onClick={() => {
                    if (disabled) return;
                    if (isPaid) { onSelectPaymentGateway(type._id); return; }
                    onBuyTicket(type._id);
                  }}
                  disabled={disabled}
                  className={`mt-3 w-full rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] transition ${
                    disabled
                      ? "cursor-not-allowed bg-[#3a1224]/5 text-[#3a1224]/30"
                      : "cursor-pointer bg-[#3a1224] text-white hover:bg-[#C0A04C] hover:text-[#3a1224]"
                  }`}
                >
                  {submitting === type._id
                    ? "Processing..."
                    : soldOut
                    ? "Sold out"
                    : eventEnded
                    ? "Event ended"
                    : registrationNotStarted
                    ? "Coming soon"
                    : isPaid
                    ? "Book ticket"
                    : "Get free ticket"}
                </button>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-[#e8dcc8] bg-[#fbf8f2] p-6 text-center">
            <p className="font-black text-[#3a1224]">No tickets listed yet</p>
            <p className="mt-1.5 text-sm text-[#3a1224]/55">Check back closer to the event date.</p>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs leading-5 text-[#3a1224]/45">
        Login required before checkout. Payment is processed securely through your selected gateway.
      </p>
    </aside>
  );
}
