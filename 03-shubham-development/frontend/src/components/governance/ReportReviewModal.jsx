'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  resolveEventReport,
  dismissEventReport,
} from '@api/governance/event-reports-api';
import { toast } from 'sonner';
import { X, AlertCircle, CheckCircle, Trash2, ExternalLink } from 'lucide-react';

const RESOLUTION_ACTIONS = [
  {
    value: 'created_flag',
    label: 'Create Flag',
    description: 'Create an official flag. Optionally suspend event.',
    icon: '🚩',
  },
  {
    value: 'auto_suspended',
    label: 'Auto-Suspend',
    description: 'Immediately suspend the event',
    icon: '⛔',
  },
  {
    value: 'dismissed_invalid',
    label: 'Dismiss as Invalid',
    description: 'False report, no action needed',
    icon: '✓',
  },
  {
    value: 'sent_warning',
    label: 'Send Warning',
    description: 'Send warning to organizer',
    icon: '⚠️',
  },
];

const FLAG_SEVERITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const REASON_LABELS = {
  suspicious_activity: 'Suspicious Activity',
  false_content: 'False or Misleading Content',
  policy_violation: 'Policy Violation',
  spam: 'Spam',
  fraud: 'Fraud or Scam',
  inappropriate_content: 'Inappropriate Content',
  discrimination: 'Discrimination or Harassment',
  other: 'Other',
};

export default function ReportReviewModal({
  report,
  isOpen,
  onClose,
  onReportUpdated,
}) {
  const queryClient = useQueryClient();
  const [resolution, setResolution] = useState('');
  const [flagSeverity, setFlagSeverity] = useState('high');
  const [adminNotes, setAdminNotes] = useState('');
  const [step, setStep] = useState('action'); // 'action' or 'confirm'

  const resolveMutation = useMutation({
    mutationFn: () =>
      resolveEventReport(report._id, resolution, adminNotes, flagSeverity),
    onSuccess: async () => {
      const actionMessages = {
        created_flag: `Flag created with severity: ${flagSeverity.toUpperCase()}${
          flagSeverity === 'critical' || flagSeverity === 'high'
            ? ' - Event auto-suspended'
            : ''
        }`,
        auto_suspended: 'Event has been auto-suspended',
        sent_warning: 'Warning sent to organizer',
        dismissed_invalid: 'Report dismissed as invalid',
      };
      toast.success(actionMessages[resolution] || 'Report resolved successfully');
      
      // Wait for queries to refetch before closing modal
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['eventReports'] }),
        queryClient.invalidateQueries({ queryKey: ['reportStats'] }),
      ]);
      
      // Small delay to ensure UI updates
      setTimeout(() => onReportUpdated(), 100);
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to resolve report');
    },
  });

  const dismissMutation = useMutation({
    mutationFn: () => dismissEventReport(report._id, adminNotes),
    onSuccess: async () => {
      toast.success('Report dismissed');
      
      // Wait for queries to refetch before closing modal
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['eventReports'] }),
        queryClient.invalidateQueries({ queryKey: ['reportStats'] }),
      ]);
      
      // Small delay to ensure UI updates
      setTimeout(() => onReportUpdated(), 100);
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to dismiss report');
    },
  });

  const handleResolve = () => {
    if (!resolution) {
      toast.error('Please select an action');
      return;
    }

    // Handle 'dismissed_invalid' as a special case using dismissMutation
    if (resolution === 'dismissed_invalid') {
      dismissMutation.mutate();
    } else {
      // All other resolutions use resolveMutation
      resolveMutation.mutate();
    }
  };

  const handleDismiss = () => {
    dismissMutation.mutate();
  };

  const handleCloseModal = () => {
    // Reset state when closing
    setResolution('');
    setFlagSeverity('high');
    setAdminNotes('');
    setStep('action');
    onClose();
  };

  if (!isOpen) return null;

  const selectedAction = RESOLUTION_ACTIONS.find((a) => a.value === resolution);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--admin-surface)] rounded-xl border border-[#3a1a1a] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#0f0606] border-b border-[#3a1a1a] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Review Report</h2>
            <p className="text-xs text-[#9ca3af] mt-1">Event: {report.eventId?.name || report.eventName || 'Unknown'} | Reported by: {report.reportedBy?.email || report.reporterEmail || 'Unknown'}</p>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 hover:bg-[#1a0808] rounded-lg transition text-[#9ca3af] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Report Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                label: 'Status',
                value: report.status.charAt(0).toUpperCase() + report.status.slice(1),
                color: 'text-blue-400',
              },
              {
                label: 'Priority',
                value: report.priority.charAt(0).toUpperCase() + report.priority.slice(1),
                color: 'text-orange-400',
              },
              {
                label: 'Reason',
                value: REASON_LABELS[report.reason] || report.reason,
                color: 'text-red-400',
              },
              {
                label: 'Reported By',
                value: report.reportedBy?.email || report.reporterEmail || 'Unknown',
                color: 'text-[#9ca3af]',
              },
              {
                label: 'Reported Date',
                value: new Date(report.createdAt).toLocaleDateString(),
                color: 'text-[#9ca3af]',
              },
              {
                label: 'Event',
                value: report.eventId?.name || report.eventName || 'Unknown',
                color: 'text-[#9ca3af]',
              },
            ].map((item, idx) => (
              <div key={idx}>
                <p className="text-xs text-[#6b7280] mb-1 uppercase font-semibold">
                  {item.label}
                </p>
                <p className={`font-medium ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Report Content */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Report Description</h3>
              <p className="text-[#d1d5db] text-sm bg-[#1a0808] border border-[#3a1a1a] rounded-lg p-4">
                {report.description}
              </p>
            </div>

            {/* Evidence */}
            {report.evidence?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">
                  Evidence ({report.evidence.length})
                </h3>
                <div className="space-y-2">
                  {report.evidence.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#1a0808] border border-[#3a1a1a] rounded-lg text-blue-400 hover:border-blue-500/50 transition text-sm group"
                    >
                      <ExternalLink size={16} className="flex-shrink-0" />
                      <span className="truncate flex-1">{url}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {report.adminNotes && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Admin Notes</h3>
                <p className="text-[#d1d5db] text-sm bg-[#1a0808] border border-[#3a1a1a] rounded-lg p-4">
                  {report.adminNotes}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-[#3a1a1a]" />

          {/* Resolution Step */}
          {step === 'action' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Take Action</h3>

              <div className="space-y-2">
                {RESOLUTION_ACTIONS.map((action) => (
                  <button
                    key={action.value}
                    onClick={() => {
                      setResolution(action.value);
                      setStep('confirm');
                    }}
                    disabled={resolveMutation.isPending}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                      resolution === action.value
                        ? 'bg-[var(--admin-primary)]/20 border-[var(--admin-primary)] text-white'
                        : 'bg-[#1a0808] border-[#3a1a1a] text-[#9ca3af] hover:border-[var(--admin-primary)]/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{action.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold">{action.label}</p>
                        <p className="text-xs mt-1">{action.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => setStep('dismiss')}
                disabled={dismissMutation.isPending}
                className="w-full px-4 py-3 rounded-lg border border-[#3a1a1a] text-[#9ca3af] hover:border-red-500/50 hover:text-red-400 transition flex items-center gap-2 justify-center"
              >
                <Trash2 size={16} />
                Other Action
              </button>
            </div>
          ) : step === 'confirm' && resolution ? (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[#d1d5db]">
                  <p>
                    <strong className="text-blue-400">
                      {selectedAction?.label}:
                    </strong>{' '}
                    {selectedAction?.description}
                  </p>
                  {resolution === 'created_flag' && (
                    <p className="mt-2 text-xs">
                      • Creates an official flag against the event
                      <br />
                      • Severity: <strong>{flagSeverity.toUpperCase()}</strong>
                      {(flagSeverity === 'critical' || flagSeverity === 'high') && (
                        <>
                          <br />• Event will be <strong>AUTO-SUSPENDED</strong> immediately
                        </>
                      )}
                    </p>
                  )}
                  {resolution === 'auto_suspended' && (
                    <p className="mt-2 text-xs">
                      • Event will be immediately suspended
                      <br />• Organizer will be notified of the suspension
                    </p>
                  )}
                  {resolution === 'sent_warning' && (
                    <p className="mt-2 text-xs">
                      • A warning notification will be sent to event organizer
                      <br />• Event will remain active
                    </p>
                  )}
                </div>
              </div>

              {/* Flag Severity Selection */}
              {resolution === 'created_flag' && (
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Flag Severity
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {FLAG_SEVERITIES.map((sev) => (
                      <button
                        key={sev.value}
                        onClick={() => setFlagSeverity(sev.value)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                          flagSeverity === sev.value
                            ? 'bg-[var(--admin-primary)] border-[var(--admin-primary)] text-white'
                            : 'bg-[#1a0808] border-[#3a1a1a] text-[#9ca3af] hover:border-[var(--admin-primary)]/50'
                        }`}
                      >
                        {sev.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[#6b7280] mt-2">
                    {flagSeverity === 'critical' || flagSeverity === 'high'
                      ? '⚠️ Event will be auto-suspended'
                      : flagSeverity === 'medium'
                        ? 'Event will remain active pending review'
                        : 'Event will remain active'}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this action for the record..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#1a0808] border border-[#3a1a1a] rounded-lg text-white placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] transition resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep('action')}
                  disabled={resolveMutation.isPending || dismissMutation.isPending}
                  className="flex-1 px-4 py-2.5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 rounded-lg text-[#9ca3af] hover:text-white font-medium disabled:opacity-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleResolve}
                  disabled={resolveMutation.isPending || dismissMutation.isPending}
                  className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium disabled:opacity-50 transition flex items-center justify-center gap-2 ${
                    resolution === 'dismissed_invalid'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <CheckCircle size={18} />
                  {resolveMutation.isPending || dismissMutation.isPending
                    ? 'Processing...'
                    : `Confirm ${selectedAction?.label}`}
                </button>
              </div>
            </div>
          ) : step === 'dismiss' ? (
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#d1d5db]">
                  <strong className="text-red-400">Dismiss Report:</strong> Mark this report
                  as invalid. This cannot be undone.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Reason for Dismissal
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Explain why this report is being dismissed..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#1a0808] border border-[#3a1a1a] rounded-lg text-white placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] transition resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep('action')}
                  disabled={dismissMutation.isPending}
                  className="flex-1 px-4 py-2.5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 rounded-lg text-[#9ca3af] hover:text-white font-medium disabled:opacity-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDismiss}
                  disabled={dismissMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  {dismissMutation.isPending ? 'Processing...' : 'Dismiss Report'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
