import { Activity, RefreshCcw, Ticket } from "lucide-react";

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
    <section className="border border-[#e8dcc8] bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-[#e8dcc8] px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-[#3a1224]/45" />
            <h2 className="text-base font-black text-[#3a1224]">Ticket inventory</h2>
          </div>
          <p className="mt-1 text-xs leading-5 text-[#3a1224]/45">Create tiers and track sold capacity.</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          title="Refresh tickets"
          className="flex h-9 w-9 items-center justify-center border border-[#e8dcc8] text-[#3a1224]/55 hover:bg-[#fbf8f2]"
        >
          <RefreshCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5">
        {ticketTypes.length > 0 ? (
          <div className="divide-y divide-[#e8dcc8] border border-[#e8dcc8]">
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
        ) : (
          <div className="border border-dashed border-[#e8dcc8] bg-[#fbf8f2] px-4 py-6 text-center">
            <p className="text-sm font-bold text-[#3a1224]">No ticket types yet</p>
            <p className="mt-1 text-xs text-[#3a1224]/45">Add at least one tier before publishing paid tickets.</p>
          </div>
        )}

        <div className="mt-5 border-t border-[#e8dcc8] pt-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">Add ticket type</p>
          <div className="mt-3 space-y-2">
            <input
              value={newType.name}
              onChange={(event) => setNewType({ ...newType, name: event.target.value })}
              placeholder="Tier name"
              className="h-10 w-full border border-[#e8dcc8] bg-white px-3 text-sm font-bold text-[#3a1224] outline-none transition focus:border-[#C0A04C]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={newType.price}
                onChange={(event) => setNewType({ ...newType, price: event.target.value })}
                placeholder="Price"
                className="h-10 w-full border border-[#e8dcc8] bg-white px-3 text-sm font-bold text-[#3a1224] outline-none transition focus:border-[#C0A04C]"
              />
              <input
                type="number"
                value={newType.quantityTotal}
                onChange={(event) => setNewType({ ...newType, quantityTotal: event.target.value })}
                placeholder="Quantity"
                className="h-10 w-full border border-[#e8dcc8] bg-white px-3 text-sm font-bold text-[#3a1224] outline-none transition focus:border-[#C0A04C]"
              />
            </div>
            <button
              type="button"
              onClick={onAddTicket}
              disabled={isSaving}
              className="h-10 w-full bg-[#3a1224] text-sm font-bold text-white hover:bg-[#4b1830] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Adding..." : "Add ticket"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TicketTypeRow({ type, isEditing, editType, setEditType, onEdit, onSave, onCancel }) {
  if (isEditing) {
    return (
      <div className="space-y-2 bg-[#fbf8f2] p-4">
        <input
          value={editType.name}
          onChange={(event) => setEditType({ ...editType, name: event.target.value })}
          placeholder="Name"
          className="h-10 w-full border border-[#e8dcc8] bg-white px-3 text-sm font-bold text-[#3a1224] outline-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={editType.price}
            onChange={(event) => setEditType({ ...editType, price: event.target.value })}
            placeholder="Price"
            className="h-10 w-full border border-[#e8dcc8] bg-white px-3 text-sm font-bold text-[#3a1224] outline-none"
          />
          <input
            type="number"
            value={editType.quantityTotal}
            onChange={(event) => setEditType({ ...editType, quantityTotal: event.target.value })}
            placeholder="Quantity"
            className="h-10 w-full border border-[#e8dcc8] bg-white px-3 text-sm font-bold text-[#3a1224] outline-none"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onSave} className="h-9 flex-1 bg-[#3a1224] text-xs font-bold text-white">Save</button>
          <button type="button" onClick={onCancel} className="h-9 flex-1 border border-[#e8dcc8] bg-white text-xs font-bold text-[#3a1224]/65">Cancel</button>
        </div>
      </div>
    );
  }

  const sold = type.quantitySold || 0;
  const total = type.quantityTotal || 0;

  return (
    <div className="flex items-center justify-between gap-4 bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-[#3a1224]">{type.name}</p>
        <p className="mt-1 text-xs text-[#3a1224]/50">Rs {type.price} / {sold} of {total} sold</p>
      </div>
      <button type="button" onClick={onEdit} className="flex h-8 w-8 items-center justify-center border border-[#e8dcc8] text-[#3a1224]/45 hover:bg-[#fbf8f2]" title="Edit ticket">
        <Activity className="h-4 w-4" />
      </button>
    </div>
  );
}
