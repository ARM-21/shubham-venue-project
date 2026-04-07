import { AlertTriangle, CheckCircle, XCircle, Clock, Zap, AlertCircle, Info, Lightbulb } from 'lucide-react';

const severityConfig = {
  critical: { bg: '#7f1d1d', text: '#fca5a5', border: '#f87171', icon: AlertCircle },
  high: { bg: '#78350f', text: '#fcd34d', border: '#f59e0b', icon: AlertTriangle },
  medium: { bg: '#1e3a8a', text: '#93c5fd', border: '#60a5fa', icon: Info },
  low: { bg: '#064e3b', text: '#86efac', border: '#4ade80', icon: Lightbulb },
};

const statusConfig = {
  open: { label: 'Open', color: '#f87171', bg: '#7f1d1d' },
  investigating: { label: 'Investigating', color: '#f59e0b', bg: '#78350f' },
  resolved: { label: 'Resolved', color: '#4ade80', bg: '#064e3b' },
  dismissed: { label: 'Dismissed', color: '#a78bfa', bg: '#5b21b6' },
};

export function FlagCard({ flag, onClick, isSelected }) {
  const severity = severityConfig[flag.severity] || severityConfig.medium;
  const status = statusConfig[flag.status];

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl border-l-4 cursor-pointer transition-all ${
        isSelected
          ? 'bg-[#1a0808] border-[var(--admin-primary)] shadow-md'
          : 'bg-[var(--admin-surface)] border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 border-l-4'
      }`}
      style={{ borderLeftColor: severity.border }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3">
          {severity.icon && <severity.icon className="w-6 h-6 mt-0.5 flex-shrink-0" style={{ color: severity.text }} />}
          <div>
            <h4 className="font-semibold text-white">{flag.eventId?.name || 'Unknown Event'}</h4>
            <p className="text-sm text-[#9ca3af] capitalize">{flag.reason.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span
            className="px-3 py-1.5 text-xs font-semibold rounded border"
            style={{ backgroundColor: severity.bg, color: severity.text, borderColor: severity.border }}
          >
            {flag.severity.toUpperCase()}
          </span>
          <span
            className="px-3 py-1.5 text-xs font-semibold rounded border"
            style={{ backgroundColor: status.bg, color: status.color, borderColor: status.color + '50' }}
          >
            {status.label}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[#9ca3af]">
        <span>By: {flag.flaggedBy?.email || 'Admin'}</span>
        <span>{new Date(flag.flaggedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

export function FlagInvestigationTimeline({ timeline = [] }) {
  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold text-white">Investigation Timeline</h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#3a1a1a]"></div>
        <div className="space-y-6 pl-16">
          {timeline.map((entry, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-11 top-0 w-8 h-8 bg-[var(--admin-surface)] border-4 border-[var(--gold-accent)] rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-[var(--gold-accent)]" />
              </div>
              <div className="bg-[var(--admin-surface)] p-4 rounded-lg border border-[#3a1a1a]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white capitalize">{entry.action}</span>
                  <span className="text-sm text-[#9ca3af]">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                {entry.message && (
                  <p className="text-[#d1d5db] mb-2">{entry.message}</p>
                )}
                {entry.evidence && entry.evidence.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {entry.evidence.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-[var(--admin-surface-strong)] text-[var(--gold-accent)] px-2 py-1 rounded hover:bg-[#2a1010] border border-[#3a1a1a] transition"
                      >
                        Evidence {i + 1}
                      </a>
                    ))}
                  </div>
                )}
                {entry.performedBy && (
                  <p className="text-xs text-[#9ca3af] mt-2">
                    By: {entry.performedBy?.email || 'System'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GovStatCard({ icon: Icon, label, value, trend, color = 'blue' }) {
  const colorMap = {
    red: 'from-red-600 to-red-700 border-red-500/30 hover:border-red-400/60',
    green: 'from-emerald-600 to-emerald-700 border-emerald-500/30 hover:border-emerald-400/60',
    yellow: 'from-yellow-600 to-yellow-700 border-yellow-500/30 hover:border-yellow-400/60',
    blue: 'from-blue-600 to-blue-700 border-blue-500/30 hover:border-blue-400/60',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} rounded-xl p-6 text-white border transition-all group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-2 group-hover:text-white/90 transition">{label}</p>
          <p className="text-4xl font-bold">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-200' : 'text-red-200'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        <Icon className="w-12 h-12 opacity-20 group-hover:opacity-30 transition" />
      </div>
    </div>
  );
}

export function TrustScoreBadge({ score, requiresApproval }) {
  const getColor = (score) => {
    if (score >= 4) return 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/30';
    if (score >= 3) return 'text-yellow-400 bg-yellow-500/20 border border-yellow-500/30';
    return 'text-red-400 bg-red-500/20 border border-red-500/30';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getColor(score)}`}>
        {score.toFixed(1)} ⭐
      </div>
      {requiresApproval && (
        <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
          Requires Approval
        </span>
      )}
    </div>
  );
}

export function EventStatusBadge({ status }) {
  const statusMap = {
    DRAFT: { bg: 'bg-gray-500/20', text: 'text-gray-300', label: 'Draft', border: 'border-gray-500/30' },
    PENDING_REVIEW: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Pending Review', border: 'border-blue-500/30' },
    PUBLISHED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Published', border: 'border-emerald-500/30' },
    SUSPENDED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Suspended', border: 'border-red-500/30' },
    CANCELLED: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Cancelled', border: 'border-orange-500/30' },
  };

  const config = statusMap[status] || statusMap.DRAFT;

  return (
    <span className={`${config.bg} ${config.text} px-3 py-1.5 rounded-lg text-xs font-semibold border ${config.border}`}>
      {config.label}
    </span>
  );
}

export function SuspensionStatusBadge({ suspensionStatus, suspensionEndDate }) {
  if (suspensionStatus === 'none') {
    return <span className="text-xs font-semibold text-green-600">Not Suspended</span>;
  }

  const daysLeft = Math.ceil(
    (new Date(suspensionEndDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-xs font-semibold px-2 py-1 rounded ${
          suspensionStatus === 'temporary' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {suspensionStatus === 'temporary' ? 'Temporary' : 'Permanent'} Suspension
      </span>
      {suspensionStatus === 'temporary' && daysLeft > 0 && (
        <span className="text-xs text-gray-600">({daysLeft} days left)</span>
      )}
    </div>
  );
}

export function ActionBadge({ action }) {
  const actionConfig = {
    approve: {
      icon: CheckCircle,
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      borderText: 'border-emerald-300',
      label: 'Approve Event',
    },
    reject: {
      icon: XCircle,
      bg: 'bg-red-50',
      text: 'text-red-700',
      borderText: 'border-red-300',
      label: 'Reject Event',
    },
    suspend: {
      icon: AlertTriangle,
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      borderText: 'border-orange-300',
      label: 'Suspend Event',
    },
  };

  const config = actionConfig[action] || actionConfig.approve;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 ${config.bg} px-3 py-2 rounded-lg border ${config.borderText}`}>
      <Icon size={20} className={config.text} />
      <span className={`font-semibold ${config.text}`}>{config.label}?</span>
    </div>
  );
}
