'use client';

import { AlertCircle, Calendar, Check, CheckCircle2, Copy, Eye, EyeOff, Mail, Phone, RefreshCw, Ticket, X, XCircle } from 'lucide-react';
import { useState } from 'react';

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

const EMPTY = "-";

export function GuestDetailModal({ guest, isOpen, onClose }) {
  const [copied, setCopied] = useState(null);
  const [revealPhone, setRevealPhone] = useState(false);

  if (!isOpen || !guest) return null;

  const attendee = guest.attendee || {};
  const ticketType = guest.ticketType || {};
  const firstName = attendee.first_name || EMPTY;
  const lastName = attendee.last_name || EMPTY;
  const email = attendee.email || EMPTY;
  const phone = attendee.phone || EMPTY;
  const qrCode = guest.qrCodeValue || EMPTY;
  const status = guest.status || "UNKNOWN";
  const checkedInAt = guest.checkedInAt;
  const createdAt = guest.createdAt;
  const ticketName = ticketType.name || EMPTY;
  const ticketPrice = ticketType.price || EMPTY;

  const handleCopy = (text, type) => {
    if (text === EMPTY) return;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1800);
  };

  const statusInfo = {
    ACTIVE: { color: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: CheckCircle2, label: 'Active' },
    USED: { color: 'border-blue-200 bg-blue-50 text-blue-700', icon: CheckCircle2, label: 'Used' },
    CANCELLED: { color: 'border-red-200 bg-red-50 text-red-700', icon: XCircle, label: 'Cancelled' },
    REFUNDED: { color: 'border-orange-200 bg-orange-50 text-orange-700', icon: RefreshCw, label: 'Refunded' },
  };

  const currentStatus = statusInfo[status] || {
    color: 'border-[#e8dcc8] bg-[#fbf8f2] text-[#3a1224]/60',
    icon: AlertCircle,
    label: 'Unknown',
  };
  const StatusIcon = currentStatus.icon;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/35" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
        <div className="w-full max-w-2xl border border-[#e8dcc8] bg-white" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-start justify-between gap-4 border-b border-[#e8dcc8] px-5 py-4">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-black text-[#3a1224]">{firstName} {lastName}</h2>
              <p className="mt-1 truncate text-sm text-[#3a1224]/50">{email}</p>
            </div>
            <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#e8dcc8] text-[#3a1224]/55 hover:bg-[#fbf8f2]">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[72vh] overflow-y-auto p-5">
            <section>
              <SectionTitle>Contact</SectionTitle>
              <div className="grid gap-3 md:grid-cols-2">
                <InfoTile icon={Mail} label="Email">
                  <CopyValue value={email} copied={copied === 'email'} onCopy={() => handleCopy(email, 'email')} />
                </InfoTile>
                <InfoTile icon={Phone} label="Phone">
                  <div className="flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate font-mono text-sm font-bold text-[#3a1224]">
                      {phone === EMPTY ? phone : copied === 'phone' ? 'Copied' : revealPhone ? phone : phone.slice(0, -4) + '****'}
                    </p>
                    {phone !== EMPTY && (
                      <>
                        <button type="button" onClick={() => setRevealPhone(!revealPhone)} className="text-[#3a1224]/45 hover:text-[#3a1224]" title={revealPhone ? "Hide phone" : "Show phone"}>
                          {revealPhone ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button type="button" onClick={() => handleCopy(phone, 'phone')} className="text-[#3a1224]/45 hover:text-[#3a1224]" title="Copy phone">
                          {copied === 'phone' ? <Check className="h-4 w-4 text-emerald-700" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </>
                    )}
                  </div>
                </InfoTile>
              </div>
            </section>

            <section className="mt-6">
              <SectionTitle>Ticket</SectionTitle>
              <div className="grid gap-3 md:grid-cols-2">
                <InfoTile icon={Ticket} label="Ticket type">
                  <p className="text-sm font-black text-[#3a1224]">{ticketName}</p>
                  {ticketPrice !== EMPTY && <p className="mt-1 text-xs text-[#3a1224]/50">NPR {ticketPrice}</p>}
                </InfoTile>
                <div className={`border p-4 ${currentStatus.color}`}>
                  <div className="flex items-start gap-3">
                    <StatusIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em]">Status</p>
                      <p className="mt-1 text-sm font-black">{currentStatus.label}</p>
                    </div>
                  </div>
                </div>
                <InfoTile icon={Ticket} label="QR code" className="md:col-span-2">
                  <CopyValue value={qrCode} copied={copied === 'qr'} onCopy={() => handleCopy(qrCode, 'qr')} />
                </InfoTile>
              </div>
            </section>

            <section className="mt-6">
              <SectionTitle>Timeline</SectionTitle>
              <div className="grid gap-3 md:grid-cols-2">
                <InfoTile icon={Calendar} label="Registered">
                  <p className="text-sm font-bold text-[#3a1224]">{formatDate(createdAt)}</p>
                </InfoTile>
                <InfoTile icon={CheckCircle2} label="Checked in">
                  <p className="text-sm font-bold text-[#3a1224]">{checkedInAt ? formatDate(checkedInAt) : "Not checked in"}</p>
                </InfoTile>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

function SectionTitle({ children }) {
  return <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">{children}</h3>;
}

function InfoTile({ icon: Icon, label, children, className = "" }) {
  return (
    <div className={`border border-[#e8dcc8] bg-[#fbf8f2] p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#3a1224]/45" />
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">{label}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function CopyValue({ value, copied, onCopy }) {
  return (
    <div className="flex items-center gap-2">
      <p className="min-w-0 flex-1 break-all font-mono text-sm font-bold text-[#3a1224]">{copied ? "Copied" : value}</p>
      {value !== EMPTY && (
        <button type="button" onClick={onCopy} className="shrink-0 text-[#3a1224]/45 hover:text-[#3a1224]" title="Copy">
          {copied ? <Check className="h-4 w-4 text-emerald-700" /> : <Copy className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
