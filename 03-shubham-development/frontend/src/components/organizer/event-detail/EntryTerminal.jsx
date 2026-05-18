import { QrCode } from "lucide-react";

export function EntryTerminal({ checkinCode, setCheckinCode, onCheckin, isLoading }) {
  return (
    <section className="border border-[#e8dcc8] bg-white">
      <div className="border-b border-[#e8dcc8] px-5 py-4">
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-[#3a1224]/45" />
          <h2 className="text-base font-black text-[#3a1224]">Entry check-in</h2>
        </div>
        <p className="mt-1 text-xs leading-5 text-[#3a1224]/45">Paste or scan the ticket QR value at the door.</p>
      </div>

      <div className="space-y-3 p-5">
        <input
          type="text"
          placeholder="QR code value"
          value={checkinCode}
          onChange={(event) => setCheckinCode(event.target.value)}
          className="h-11 w-full border border-[#e8dcc8] bg-white px-3 text-sm font-bold text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15"
        />
        <button
          type="button"
          onClick={onCheckin}
          disabled={isLoading}
          className="h-11 w-full bg-[#3a1224] text-sm font-bold text-white transition hover:bg-[#4b1830] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Validating..." : "Validate entry"}
        </button>
      </div>
    </section>
  );
}
