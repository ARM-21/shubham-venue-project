'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  X,
  AlertCircle,
  TrendingUp,
  Trophy,
  Shield,
  Flag,
} from 'lucide-react';

export function TrustScoreBadge({ score }) {
  const getColor = (score) => {
    if (score >= 4) return { text: 'text-emerald-500', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' };
    if (score >= 3) return { text: 'text-amber-500', bg: 'bg-amber-500/20', border: 'border-amber-500/30' };
    return { text: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/30' };
  };

  const colors = getColor(score);
  const isAutoPublish = score >= 4;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`px-4 py-2 rounded-full text-sm font-bold ${colors.text} ${colors.bg} border ${colors.border}`}>
        {score.toFixed(1)} ⭐
      </div>
      {isAutoPublish && (
        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-500 text-xs font-semibold rounded-full border border-emerald-500/30">
          Auto-Publish
        </span>
      )}
      {!isAutoPublish && (
        <span className="px-2 py-1 bg-amber-500/20 text-amber-500 text-xs font-semibold rounded-full border border-amber-500/30">
          Requires Review
        </span>
      )}
    </div>
  );
}

export function OrganizerTrustScoreDashboard({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[#3a1224]/5 p-6 shadow-sm animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-[#3a1224]/5 p-6 shadow-sm text-center text-[#3a1224]/50">
        Unable to load reputation data
      </div>
    );
  }

  const { reputation, eventStats, flags, recommendations } = data;
  const trustScore = reputation.trustScore || 3;
  const isAutoPublish = trustScore >= 4;
  const isSuspended = reputation.suspensionStatus && reputation.suspensionStatus !== 'none';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main Trust Score Card */}
      <div className="bg-gradient-to-br from-white to-[#fdfaf6] rounded-2xl border border-[#3a1224]/5 p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Score Display */}
          <div className="flex items-center justify-center md:col-span-1">
            <TrustScoreBadge score={trustScore} />
          </div>

          {/* Stats Grid */}
          <div className="md:col-span-2 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-[9px] font-bold text-[#3a1224]/40 uppercase tracking-widest mb-1">
                Approval Rate
              </p>
              <p className="text-2xl font-bold text-[#3a1224]">
                {eventStats.approvalRate}%
              </p>
              <p className="text-[8px] text-[#3a1224]/40 mt-1">
                {reputation.trustMetrics.eventsApproved} / {reputation.trustMetrics.eventsCreated} approved
              </p>
            </div>

            <div className="text-center">
              <p className="text-[9px] font-bold text-[#3a1224]/40 uppercase tracking-widest mb-1">
                Total Events
              </p>
              <p className="text-2xl font-bold text-[#3a1224]">
                {eventStats.totalEvents}
              </p>
              <p className="text-[8px] text-[#3a1224]/40 mt-1">
                {eventStats.publishedEvents} published
              </p>
            </div>

            <div className="text-center">
              <p className="text-[9px] font-bold text-[#3a1224]/40 uppercase tracking-widest mb-1">
                Active Flags
              </p>
              <p className={`text-2xl font-bold ${flags.open > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {flags.open}
              </p>
              <p className="text-[8px] text-[#3a1224]/40 mt-1">
                Rating: {reputation.trustMetrics.averageRating ? `${reputation.trustMetrics.averageRating}/5` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        {isSuspended && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-600 font-bold text-sm">⚠️ Account Suspended</p>
            <p className="text-red-600/70 text-xs mt-1">
              Reason: {reputation.suspensionReason || 'Not specified'}
            </p>
            {reputation.suspensionEndDate && (
              <p className="text-red-600/70 text-xs mt-1">
                Until: {new Date(reputation.suspensionEndDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#3a1224] px-1">Recommendations</h3>
          {recommendations.map((rec, idx) => {
            const severityConfig = {
              critical: { icon: AlertTriangle, bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-600' },
              warning: { icon: AlertCircle, bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-600' },
              info: { icon: Shield, bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-600' },
              success: { icon: CheckCircle, bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-600' },
            };

            const config = severityConfig[rec.severity] || severityConfig.info;
            const Icon = config.icon;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-lg border ${config.bg} ${config.border} flex gap-3`}
              >
                <Icon className={`w-5 h-5 ${config.text} shrink-0 mt-0.5`} />
                <div>
                  <p className={`text-sm font-semibold ${config.text}`}>{rec.message}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Recent Flags */}
      {flags.recentFlags && flags.recentFlags.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#3a1224]/5 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Flag className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-bold text-[#3a1224]">Recent Flags</h3>
            <span className="ml-auto px-2 py-1 bg-red-500/20 text-red-600 text-xs font-bold rounded">
              {flags.total}
            </span>
          </div>

          <div className="space-y-2">
            {flags.recentFlags.slice(0, 3).map((flag, idx) => (
              <div key={idx} className="p-3 bg-[#fdfaf6] rounded-lg border border-[#3a1224]/5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#3a1224]/60 uppercase">
                      {flag.severity === 'critical' ? '🔴 Critical' : flag.severity === 'high' ? '🟠 High' : flag.severity === 'medium' ? '🟡 Medium' : '🔵 Low'}
                    </p>
                    <p className="text-sm text-[#3a1224] mt-1 break-words">{flag.reason}</p>
                    <p className="text-xs text-[#3a1224]/40 mt-2">
                      {new Date(flag.createdAt).toLocaleDateString()} • Status: {flag.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {flags.total > flags.recentFlags.length && (
            <p className="text-center text-xs text-[#3a1224]/40 mt-3">
              +{flags.total - flags.recentFlags.length} more flag(s)
            </p>
          )}
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gradient-to-r from-[#C0A04C]/5 to-[#C0A04C]/10 rounded-2xl border border-[#C0A04C]/20 p-6">
        <h3 className="text-sm font-bold text-[#3a1224] mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#C0A04C]" />
          How to Improve Your Trust Score
        </h3>
        <ul className="text-xs text-[#3a1224]/70 space-y-2">
          <li>✓ Create high-quality events with detailed information</li>
          <li>✓ Respond to event feedback and maintain good ratings</li>
          <li>✓ Resolve any flags or warnings promptly</li>
          <li>✓ Keep your organizer profile complete and up-to-date</li>
          <li>✓ Maintain consistent event compliance and quality standards</li>
        </ul>
      </div>
    </motion.div>
  );
}
