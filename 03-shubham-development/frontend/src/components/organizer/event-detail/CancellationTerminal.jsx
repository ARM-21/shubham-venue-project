import { CheckCircle2, Users, AlertCircle, Timestamp } from 'lucide-react';

export function CancellationTerminal({ cancellationData }) {
  if (!cancellationData) return null;

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-600/30 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b border-emerald-600/20">
        <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center">
          <CheckCircle2 className="text-emerald-400" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-white">Event Cancellation Processed</h3>
          <p className="text-sm text-emerald-200">{formatTime(cancellationData.timestamp)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Attendees Notified */}
        <div className="bg-emerald-600/10 border border-emerald-600/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-emerald-400" />
            <span className="text-sm font-medium text-emerald-200">Attendees Notified</span>
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            {cancellationData.attendeesNotified}
          </div>
          <p className="text-xs text-emerald-200/70 mt-1">
            {cancellationData.attendeesNotified === 1 ? 'person' : 'people'} received cancellation email
          </p>
        </div>

        {/* Tickets Cancelled */}
        <div className="bg-emerald-600/10 border border-emerald-600/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-emerald-400" />
            <span className="text-sm font-medium text-emerald-200">Tickets Cancelled</span>
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            {cancellationData.ticketsCancelled}
          </div>
          <p className="text-xs text-emerald-200/70 mt-1">
            marked for refund processing
          </p>
        </div>

        {/* Admin Notification */}
        <div className="bg-emerald-600/10 border border-emerald-600/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span className="text-sm font-medium text-emerald-200">Admin Notified</span>
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            ✓
          </div>
          <p className="text-xs text-emerald-200/70 mt-1">
            all admins alerted
          </p>
        </div>
      </div>

      {/* Cancellation Reason */}
      {cancellationData.cancellationReason && (
        <div className="bg-emerald-600/10 border border-emerald-600/20 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-emerald-200">Cancellation Reason</p>
          <p className="text-sm text-emerald-100 leading-relaxed">
            {cancellationData.cancellationReason}
          </p>
        </div>
      )}

      {/* Status Message */}
      <div className="bg-emerald-900/20 border border-emerald-600/20 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-emerald-200">Status</p>
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
          <div className="space-y-1 text-sm text-emerald-100">
            <p>• Attendees have been notified via email about the cancellation</p>
            <p>• Ticket refunds are pending (check administration dashboard)</p>
            <p>• Admin team has been alerted and notified in-app</p>
            <p>• Cancellation logged in audit trail</p>
          </div>
        </div>
      </div>
    </div>
  );
}
