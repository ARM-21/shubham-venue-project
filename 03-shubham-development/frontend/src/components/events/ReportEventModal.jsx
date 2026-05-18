'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { submitEventReport } from '@api/governance/event-reports-api';
import { toast } from 'sonner';
import { X } from 'lucide-react';

const REPORT_REASONS = [
  { value: 'suspicious_activity', label: 'Suspicious activity' },
  { value: 'false_content', label: 'False or misleading content' },
  { value: 'policy_violation', label: 'Policy violation' },
  { value: 'spam', label: 'Spam' },
  { value: 'fraud', label: 'Fraud or scam' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'discrimination', label: 'Discrimination or harassment' },
  { value: 'other', label: 'Other' },
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default function ReportEventModal({ eventId, eventName, isOpen, onClose, onReportSuccess }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [evidence, setEvidence] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reportMutation = useMutation({
    mutationFn: () =>
      submitEventReport(
        eventId,
        reason,
        description,
        evidence.split('\n').map((e) => e.trim()).filter(Boolean),
        priority
      ),
    onSuccess: () => {
      toast.success('Report submitted. Our team will review it shortly.');
      setSubmitted(true);
      onReportSuccess?.();
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to submit report');
    },
  });

  const handleClose = () => {
    setReason('');
    setDescription('');
    setPriority('medium');
    setEvidence('');
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) { toast.error('Please select a reason'); return; }
    if (!description || description.length < 10) { toast.error('Description must be at least 10 characters'); return; }
    reportMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="flex w-full max-w-lg flex-col rounded-2xl border border-[#e8dcc8] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.18)]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8dcc8] px-6 py-4">
          <div>
            <h2 className="text-base font-black text-[#3a1224]">Report event</h2>
            {eventName && (
              <p className="mt-0.5 text-xs text-[#3a1224]/50 line-clamp-1">{eventName}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#3a1224]/40 transition hover:bg-[#f4eadb] hover:text-[#3a1224]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          /* Confirmation */
          <div className="px-6 py-8 text-center">
            <p className="text-sm font-black text-[#3a1224]">Report received</p>
            <p className="mt-2 text-sm text-[#3a1224]/55">
              Our team will review your report. The event remains visible while under investigation.
            </p>
            {reportMutation.data?.reportId && (
              <p className="mt-3 text-xs text-[#3a1224]/35">
                Reference: {reportMutation.data.reportId}
              </p>
            )}
            <button
              onClick={handleClose}
              className="mt-6 inline-flex h-10 items-center rounded-2xl bg-[#3a1224] px-6 text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#4b1830]"
            >
              Close
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
            <div className="space-y-4 overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(90vh - 130px)' }}>

              {/* Reason */}
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-[#3a1224]/50">
                  Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-[#e8dcc8] bg-white px-3.5 py-2.5 text-sm font-medium text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15"
                >
                  <option value="">Select a reason</option>
                  {REPORT_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-[#3a1224]/50">
                  Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what's wrong with this event (minimum 10 characters)"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[#e8dcc8] bg-white px-3.5 py-2.5 text-sm text-[#3a1224] placeholder-[#3a1224]/30 outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15"
                />
                <p className="mt-1 text-right text-xs text-[#3a1224]/35">{description.length} / 1000</p>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#3a1224]/50">
                  Severity
                </label>
                <div className="flex gap-2">
                  {PRIORITY_LEVELS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`flex-1 rounded-xl border py-2 text-xs font-black transition ${
                        priority === p.value
                          ? 'border-[#3a1224] bg-[#3a1224] text-white'
                          : 'border-[#e8dcc8] bg-white text-[#3a1224]/60 hover:border-[#3a1224]/30'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Evidence */}
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-[#3a1224]/50">
                  Evidence links <span className="text-[#3a1224]/30">(optional)</span>
                </label>
                <textarea
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="One URL per line"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-[#e8dcc8] bg-white px-3.5 py-2.5 text-sm text-[#3a1224] placeholder-[#3a1224]/30 outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15"
                />
              </div>

              <p className="text-xs text-[#3a1224]/40">
                False reports may result in restrictions on your account.
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-[#e8dcc8] px-6 py-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={reportMutation.isPending}
                className="h-10 flex-1 rounded-xl border border-[#e8dcc8] text-sm font-bold text-[#3a1224] transition hover:bg-[#fbf8f2] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reportMutation.isPending}
                className="h-10 flex-1 rounded-xl bg-[#3a1224] text-sm font-black text-white transition hover:bg-[#4b1830] disabled:opacity-50"
              >
                {reportMutation.isPending ? 'Submitting…' : 'Submit report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
