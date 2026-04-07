'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { submitEventReport } from '@api/governance/event-reports-api';
import { toast } from 'sonner';
import { AlertCircle, X } from 'lucide-react';

const REPORT_REASONS = [
  { value: 'suspicious_activity', label: 'Suspicious Activity' },
  { value: 'false_content', label: 'False or Misleading Content' },
  { value: 'policy_violation', label: 'Policy Violation' },
  { value: 'spam', label: 'Spam' },
  { value: 'fraud', label: 'Fraud or Scam' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'discrimination', label: 'Discrimination or Harassment' },
  { value: 'other', label: 'Other' },
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical Issue' },
];

export default function ReportEventModal({ eventId, eventName, isOpen, onClose, onReportSuccess }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [evidence, setEvidence] = useState('');

  const reportMutation = useMutation({
    mutationFn: () =>
      submitEventReport(
        eventId,
        reason,
        description,
        evidence
          .split('\n')
          .map(e => e.trim())
          .filter(e => e),
        priority
      ),
    onSuccess: () => {
      toast.success('Event reported successfully. Our team will review it shortly.');
      handleClose();
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
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    if (!description || description.length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    reportMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2.5rem] border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3a1224] to-[#5a2a3c] border-b border-[#C0A04C]/20 p-6 flex items-center justify-between rounded-t-[2.5rem] flex-shrink-0">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-[#C0A04C]" />
            <h2 className="text-2xl font-bold text-white">Report Event</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition text-white/70 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
          {/* Event Info */}
          <div className="bg-[#fdfaf6] rounded-xl p-4 border border-[#C0A04C]/20">
            <p className="text-xs text-[#3a1224]/60 mb-1 font-semibold uppercase tracking-wider">Reporting Event:</p>
            <p className="text-[#3a1224] font-bold text-lg">{eventName}</p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-[#3a1224] mb-3">
              Reason for Report <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-[#C0A04C]/30 rounded-lg text-[#3a1224] placeholder-[#3a1224]/40 focus:outline-none focus:ring-2 focus:ring-[#C0A04C] focus:border-[#C0A04C] transition font-medium"
            >
              <option value="">Select a reason...</option>
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#3a1224] mb-3">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about why you're reporting this event (minimum 10 characters)..."
              rows={5}
              className="w-full px-4 py-3 bg-white border-2 border-[#C0A04C]/30 rounded-lg text-[#3a1224] placeholder-[#3a1224]/40 focus:outline-none focus:ring-2 focus:ring-[#C0A04C] focus:border-[#C0A04C] transition resize-none font-medium"
            />
            <p className="text-xs text-[#3a1224]/50 mt-2">
              {description.length}/1000 characters
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-[#3a1224] mb-3">Priority Level</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PRIORITY_LEVELS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`px-4 py-2.5 rounded-lg border-2 transition text-sm font-semibold ${
                    priority === p.value
                      ? 'bg-[#C0A04C] border-[#C0A04C] text-[#3a1224]'
                      : 'bg-white border-[#C0A04C]/30 text-[#3a1224] hover:border-[#C0A04C]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Evidence URLs */}
          <div>
            <label className="block text-sm font-semibold text-[#3a1224] mb-3">
              Evidence Links (Optional)
            </label>
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Add links to screenshots, videos, or other evidence (one per line)..."
              rows={3}
              className="w-full px-4 py-3 bg-white border-2 border-[#C0A04C]/30 rounded-lg text-[#3a1224] placeholder-[#3a1224]/40 focus:outline-none focus:ring-2 focus:ring-[#C0A04C] focus:border-[#C0A04C] transition resize-none font-medium"
            />
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-[#3a1224]">
              <strong className="text-[#C0A04C]">⚠️ Note:</strong> False reports may result in
              penalties to your account. Please only report genuine policy violations.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={reportMutation.isPending}
              className="flex-1 px-4 py-3 border-2 border-[#3a1224]/20 hover:border-[#3a1224]/50 hover:bg-[#fdfaf6] rounded-lg text-[#3a1224] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reportMutation.isPending}
              className="flex-1 px-4 py-3 bg-[#C0A04C] hover:bg-[#b8942d] text-[#3a1224] rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
