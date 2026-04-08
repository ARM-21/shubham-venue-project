import { QrCode } from "lucide-react";

export function EntryTerminal({ checkinCode, setCheckinCode, onCheckin, isLoading }) {
  return (
    <section className="bg-gradient-to-br from-[#3a1224] to-[#5a2844] rounded-2xl p-8 text-white shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <QrCode className="w-5 h-5 text-[#C0A04C]" />
        <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider">Entry Terminal</h3>
      </div>
      <p className="text-white/70 text-xs sm:text-sm mb-4 leading-relaxed">Scan QR codes for real-time visitor check-in</p>
      
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Scan QR code..."
          value={checkinCode}
          onChange={(e) => setCheckinCode(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm font-bold text-white placeholder-white/40 outline-none focus:ring-2 ring-[#C0A04C]/30"
        />
        <button
          onClick={onCheckin}
          disabled={isLoading}
          className="w-full py-3 bg-[#C0A04C] hover:bg-[#D4B557] text-[#3a1224] rounded-lg text-sm sm:text-base font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
        >
          {isLoading ? "Validating..." : "✓ Validate Entry"}
        </button>
      </div>
    </section>
  );
}
