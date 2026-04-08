import { Ticket, RefreshCcw, Activity } from "lucide-react";

export function TicketInventory({
  ticketTypes,
  newType,
  setNewType,
  editingTypeId,
  setEditingTypeId,
  editType,
  setEditType,
  onAddTicket,
  onSaveEdit,
  onStartEdit,
  onRefresh,
  isSaving,
}) {
  return (
    <section className="bg-white rounded-2xl border border-[#3a1224]/5 p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Ticket className="w-5 h-5 text-[#C0A04C]" />
          <h3 className="text-lg sm:text-xl font-black text-[#3a1224] uppercase tracking-wider">Tickets</h3>
        </div>
        <button 
          onClick={onRefresh}
          title="Refresh"
          className="w-9 h-9 rounded-lg bg-[#3a1224]/5 hover:bg-[#C0A04C]/10 text-[#C0A04C] flex items-center justify-center"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {ticketTypes.length > 0 && (
          <div className="space-y-2">
            {ticketTypes.map((type) => (
              <TicketTypeRow
                key={type._id}
                type={type}
                isEditing={editingTypeId === type._id}
                editType={editType}
                setEditType={setEditType}
                onEdit={() => onStartEdit(type)}
                onSave={() => onSaveEdit(type._id)}
                onCancel={() => setEditingTypeId(null)}
              />
            ))}
          </div>
        )}

        {ticketTypes.length > 0 && <div className="h-px bg-[#3a1224]/5" />}

        {/* Add New Ticket */}
        <div className="pt-1">
          <p className="text-xs sm:text-sm font-bold text-[#3a1224]/40 uppercase mb-2">Add New Ticket Type</p>
          <div className="space-y-1.5">
            <input
              value={newType.name}
              onChange={(e) => setNewType({ ...newType, name: e.target.value })}
              placeholder="Tier name"
              className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded px-3 py-2 text-xs sm:text-sm font-bold outline-none focus:ring-1 ring-[#C0A04C]/20"
            />
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="number"
                value={newType.price}
                onChange={(e) => setNewType({ ...newType, price: e.target.value })}
                placeholder="Price"
                className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded px-3 py-2 text-xs sm:text-sm font-bold outline-none focus:ring-1 ring-[#C0A04C]/20"
              />
              <input
                type="number"
                value={newType.quantityTotal}
                onChange={(e) => setNewType({ ...newType, quantityTotal: e.target.value })}
                placeholder="Qty"
                className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded px-3 py-2 text-xs sm:text-sm font-bold outline-none focus:ring-1 ring-[#C0A04C]/20"
              />
            </div>
            <button
              onClick={onAddTicket}
              disabled={isSaving}
              className="w-full py-2 bg-[#3a1224] text-white rounded text-xs sm:text-sm font-black uppercase hover:bg-[#3a1224]/90 disabled:opacity-50"
            >
              {isSaving ? "Adding..." : "+ Add Ticket"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TicketTypeRow({
  type,
  isEditing,
  editType,
  setEditType,
  onEdit,
  onSave,
  onCancel,
}) {
  return (
    <div className="bg-[#fdfaf6] rounded-lg border border-[#3a1224]/5 p-4 group hover:border-[#C0A04C]/30 transition-all">
      {isEditing ? (
        <div className="space-y-2">
          <input
            value={editType.name}
            onChange={(e) => setEditType({ ...editType, name: e.target.value })}
            placeholder="Name"
            className="w-full bg-white border border-[#3a1224]/10 rounded px-3 py-2 text-xs font-bold focus:ring-1 ring-[#C0A04C]/20 outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={editType.price}
              onChange={(e) => setEditType({ ...editType, price: e.target.value })}
              placeholder="Price"
              className="w-full bg-white border border-[#3a1224]/10 rounded px-3 py-2 text-xs font-bold focus:ring-1 ring-[#C0A04C]/20 outline-none"
            />
            <input
              type="number"
              value={editType.quantityTotal}
              onChange={(e) => setEditType({ ...editType, quantityTotal: e.target.value })}
              placeholder="Qty"
              className="w-full bg-white border border-[#3a1224]/10 rounded px-3 py-2 text-xs font-bold focus:ring-1 ring-[#C0A04C]/20 outline-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={onSave} className="flex-1 py-2 bg-[#3a1224] text-white rounded text-xs sm:text-sm font-black uppercase">Save</button>
            <button onClick={onCancel} className="flex-1 py-2 bg-white border border-[#3a1224]/5 rounded text-xs sm:text-sm font-black uppercase text-[#3a1224]/40">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base sm:text-lg font-black text-[#3a1224] mb-1">{type.name}</p>
            <p className="text-xs sm:text-sm text-[#3a1224]/60">₨ {type.price} • {type.quantitySold}/{type.quantityTotal}</p>
          </div>
          <button onClick={onEdit} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#3a1224]/20 hover:text-[#3a1224]">
            <Activity className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
