'use client';

import { X, Mail, Phone, Calendar, Ticket, Clock, Eye, EyeOff, Copy, Check, AlertCircle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
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

export function GuestDetailModal({ guest, isOpen, onClose }) {
  const [copied, setCopied] = useState(null);
  const [revealPhone, setRevealPhone] = useState(false);

  if (!isOpen || !guest) return null;

  const attendee = guest.attendee || {};
  const ticketType = guest.ticketType || {};
  const firstName = attendee.first_name || "—";
  const lastName = attendee.last_name || "—";
  const email = attendee.email || "—";
  const phone = attendee.phone || "—";
  const qrCode = guest.qrCodeValue || "—";
  const status = guest.status || "UNKNOWN";
  const checkedInAt = guest.checkedInAt;
  const createdAt = guest.createdAt;
  const ticketName = ticketType.name || "—";
  const ticketPrice = ticketType.price || "—";

  const handleCopy = (text, type) => {
    if (text === "—") return;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // Professional status mapping with icons
  const statusInfo = {
    ACTIVE: { 
      color: 'bg-emerald-500/10 border-emerald-500/20', 
      textColor: 'text-emerald-600', 
      icon: CheckCircle2,
      label: 'Active' 
    },
    USED: { 
      color: 'bg-blue-500/10 border-blue-500/20', 
      textColor: 'text-blue-600', 
      icon: CheckCircle2,
      label: 'Used' 
    },
    CANCELLED: { 
      color: 'bg-red-500/10 border-red-500/20', 
      textColor: 'text-red-600', 
      icon: XCircle,
      label: 'Cancelled' 
    },
    REFUNDED: { 
      color: 'bg-orange-500/10 border-orange-500/20', 
      textColor: 'text-orange-600', 
      icon: RefreshCw,
      label: 'Refunded' 
    },
  };

  const currentStatus = statusInfo[status] || { 
    color: 'bg-gray-500/10 border-gray-500/20', 
    textColor: 'text-gray-600', 
    icon: AlertCircle,
    label: 'Unknown' 
  };
  
  const StatusIcon = currentStatus.icon;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <div
          className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#3a1224]/5">
            <div>
              <h2 className="text-2xl font-black text-[#3a1224] uppercase tracking-wider">
                {firstName} {lastName}
              </h2>
              <p className="text-sm text-[#3a1224]/50 mt-1">{email}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#3a1224]/5 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-[#3a1224]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 max-h-[70vh] overflow-y-auto">
            {/* Contact Information */}
            <section className="mb-8">
              <h3 className="text-xs font-black text-[#3a1224]/40 uppercase tracking-[0.2em] mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="p-4 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl hover:border-[#C0A04C]/20 transition-colors group">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#C0A04C] flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#3a1224]/60 mb-1">Email</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono text-[#3a1224] break-all min-w-0">
                          {email === "—" ? email : (copied === 'email' ? '✓' : email)}
                        </p>
                        {email !== "—" && (
                          <button
                            onClick={() => handleCopy(email, 'email')}
                            className="p-1 hover:bg-[#C0A04C]/10 rounded transition-colors flex-shrink-0"
                            title="Copy email"
                          >
                            {copied === 'email' ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-[#3a1224]/40" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="p-4 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl hover:border-[#C0A04C]/20 transition-colors group">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#C0A04C] flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#3a1224]/60 mb-1">Phone Number</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono text-[#3a1224] font-bold">
                          {phone === "—" ? phone : (copied === 'phone' ? '✓ Copied!' : (revealPhone ? phone : phone.slice(0, -4) + '****'))}
                        </p>
                        {phone !== "—" && (
                          <>
                            <button
                              onClick={() => setRevealPhone(!revealPhone)}
                              className="p-1 hover:bg-[#C0A04C]/10 rounded transition-colors"
                              title={revealPhone ? "Hide phone" : "Show phone"}
                            >
                              {revealPhone ? (
                                <EyeOff className="w-4 h-4 text-[#3a1224]/60" />
                              ) : (
                                <Eye className="w-4 h-4 text-[#3a1224]/40" />
                              )}
                            </button>
                            <button
                              onClick={() => handleCopy(phone, 'phone')}
                              className="p-1 hover:bg-[#C0A04C]/10 rounded transition-colors"
                              title="Copy phone"
                            >
                              {copied === 'phone' ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-[#3a1224]/40" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                      {phone !== "—" && (
                        <p className="text-xs text-[#3a1224]/40 mt-1">Click eye to reveal or copy icon to copy</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Ticket Information */}
            <section className="mb-8">
              <h3 className="text-xs font-black text-[#3a1224]/40 uppercase tracking-[0.2em] mb-4">
                Ticket Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ticket Type */}
                <div className="p-4 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Ticket className="w-5 h-5 text-[#C0A04C] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#3a1224]/60 mb-1">Ticket Type</p>
                      <p className="text-sm font-bold text-[#3a1224]">{ticketName}</p>
                      {ticketPrice !== "—" && (
                        <p className="text-xs text-[#3a1224]/60 mt-1">₹ {ticketPrice}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className={`p-4 border rounded-xl ${currentStatus.color}`}>
                  <div className="flex items-start gap-3">
                    <StatusIcon className={`w-5 h-5 ${currentStatus.textColor} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#3a1224]/60 mb-1">Status</p>
                      <p className={`text-sm font-black ${currentStatus.textColor}`}>
                        {currentStatus.label}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="p-4 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl hover:border-[#C0A04C]/20 transition-colors group md:col-span-2">
                  <div className="flex items-start gap-3">
                    <Ticket className="w-5 h-5 text-[#C0A04C] flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#3a1224]/60 mb-1">QR Code Value</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono text-[#3a1224] break-all min-w-0">
                          {qrCode === "—" ? qrCode : (copied === 'qr' ? '✓' : qrCode)}
                        </p>
                        {qrCode !== "—" && (
                          <button
                            onClick={() => handleCopy(qrCode, 'qr')}
                            className="p-1 hover:bg-[#C0A04C]/10 rounded transition-colors flex-shrink-0"
                            title="Copy QR code"
                          >
                            {copied === 'qr' ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-[#3a1224]/40" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Timeline */}
            <section>
              <h3 className="text-xs font-black text-[#3a1224]/40 uppercase tracking-[0.2em] mb-4">
                Activity Timeline
              </h3>
              <div className="space-y-3">
                {/* Registration Date */}
                <div className="p-4 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#C0A04C] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#3a1224]/60 mb-1">Registered</p>
                      <p className="text-sm font-bold text-[#3a1224]">
                        {formatDate(createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Check-in Status */}
                {checkedInAt ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-emerald-700 mb-1">Checked In</p>
                        <p className="text-sm font-bold text-emerald-900">
                          {formatDate(checkedInAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-amber-700 mb-1">Check-in Status</p>
                        <p className="text-sm font-bold text-amber-900">
                          Pending Entry
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="border-t border-[#3a1224]/5 p-6 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-[#3a1224] text-white font-bold text-sm uppercase hover:bg-[#3a1224]/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
