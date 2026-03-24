import { AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';

const severityConfig = {
  critical: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5', icon: '🚨' },
  high: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d', icon: '⚠️' },
  medium: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', icon: 'ℹ️' },
  low: { bg: '#dcfce7', text: '#166534', border: '#86efac', icon: '💡' },
};

const statusConfig = {
  open: { label: 'Open', color: '#ef4444', bg: '#fee2e2' },
  investigating: { label: 'Investigating', color: '#f59e0b', bg: '#fef3c7' },
  resolved: { label: 'Resolved', color: '#10b981', bg: '#dcfce7' },
  dismissed: { label: 'Dismissed', color: '#8b5cf6', bg: '#ede9fe' },
};

export function FlagCard({ flag, onClick, isSelected }) {
  const severity = severityConfig[flag.severity] || severityConfig.medium;
  const status = statusConfig[flag.status];

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${
        isSelected
          ? 'bg-blue-50 border-blue-500 shadow-md'
          : 'bg-white border-gray-200 hover:bg-gray-50 border-l-4'
      }`}
      style={{ borderLeftColor: severity.border }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{severity.icon}</span>
          <div>
            <h4 className="font-semibold text-gray-900">{flag.eventId?.name || 'Unknown Event'}</h4>
            <p className="text-sm text-gray-600 capitalize">{flag.reason.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span
            className="px-2 py-1 text-xs font-semibold rounded"
            style={{ backgroundColor: severity.bg, color: severity.text }}
          >
            {flag.severity.toUpperCase()}
          </span>
          <span
            className="px-2 py-1 text-xs font-semibold rounded"
            style={{ backgroundColor: status.bg, color: status.color }}
          >
            {status.label}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>By: {flag.flaggedBy?.email || 'Admin'}</span>
        <span>{new Date(flag.flaggedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

export function FlagInvestigationTimeline({ timeline = [] }) {
  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold text-gray-900">Investigation Timeline</h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        <div className="space-y-6 pl-16">
          {timeline.map((entry, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-11 top-0 w-8 h-8 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 capitalize">{entry.action}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                {entry.message && (
                  <p className="text-gray-700 mb-2">{entry.message}</p>
                )}
                {entry.evidence && entry.evidence.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {entry.evidence.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        Evidence {i + 1}
                      </a>
                    ))}
                  </div>
                )}
                {entry.performedBy && (
                  <p className="text-xs text-gray-500 mt-2">
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
    red: 'from-red-500 to-red-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    blue: 'from-blue-500 to-blue-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} rounded-lg p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-2">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-200' : 'text-red-200'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        <Icon className="w-12 h-12 opacity-20" />
      </div>
    </div>
  );
}

export function TrustScoreBadge({ score, requiresApproval }) {
  const getColor = (score) => {
    if (score >= 4) return 'text-green-600 bg-green-50';
    if (score >= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`px-2 py-1 rounded-full text-sm font-semibold ${getColor(score)}`}>
        {score.toFixed(1)} ⭐
      </div>
      {requiresApproval && (
        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
          Requires Approval
        </span>
      )}
    </div>
  );
}

export function EventStatusBadge({ status }) {
  const statusMap = {
    DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
    PENDING_REVIEW: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pending Review' },
    PUBLISHED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Published' },
    SUSPENDED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Suspended' },
    CANCELLED: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Cancelled' },
  };

  const config = statusMap[status] || statusMap.DRAFT;

  return (
    <span className={`${config.bg} ${config.text} px-2 py-1 rounded text-xs font-semibold`}>
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
