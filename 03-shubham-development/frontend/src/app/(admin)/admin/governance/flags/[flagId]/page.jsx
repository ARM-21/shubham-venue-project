'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { 
  AlertTriangle, Upload, Send, Check, X, AlertCircle, Clock, 
  Ban, Shield, Eye, Trash2, AlertOctagon 
} from 'lucide-react';
import { useQueryFlagDetail } from '@queries/admin/governance.queries';
import { resolveFlag, addFlagComment } from '@api/governance/flags-api';
import { FlagInvestigationTimeline, EventStatusBadge } from 'components/admin/governance/GovernanceComponents';
import AdminTopbar from 'components/admin/dashboard/AdminTopbar';
import { toast } from 'sonner';

const severityColors = {
  low: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800',
  medium: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950 border border-blue-200 dark:border-blue-800',
  high: 'text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-950 border border-orange-200 dark:border-orange-800',
  critical: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950 border border-red-200 dark:border-red-800',
};

const resolutionOptions = [
  { value: 'warning', label: 'Warning', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700', icon: AlertCircle },
  { value: 'suspended_7days', label: 'Suspend 7 Days', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border border-orange-300 dark:border-orange-700', icon: Clock },
  { value: 'suspended_30days', label: 'Suspend 30 Days', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300 dark:border-red-700', icon: Ban },
  { value: 'permanent_suspension', label: 'Permanent Ban', color: 'bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-100 border border-red-400 dark:border-red-800', icon: AlertOctagon },
  { value: 'dismissed', label: 'Dismiss Flag', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700', icon: Check },
];

export default function FlagDetailPage() {
  const params = useParams();
  const flagId = params.flagId;

  const { data, isLoading, refetch } = useQueryFlagDetail(flagId);
  const flag = data?.flag;
  const resolution = data?.resolution;

  const [comment, setComment] = useState('');
  const [selectedResolution, setSelectedResolution] = useState('');
  const [resolutionReason, setResolutionReason] = useState('');
  const [suspensionDays, setSuspensionDays] = useState(7);
  const [showResolutionModal, setShowResolutionModal] = useState(false);

  const resolveFlagMutation = useMutation({
    mutationFn: (data) => resolveFlag(flagId, data),
    onSuccess: () => {
      toast.success('Flag resolved successfully');
      setShowResolutionModal(false);
      setSelectedResolution('');
      setResolutionReason('');
      refetch();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to resolve flag');
    },
  });

  const commentMutation = useMutation({
    mutationFn: (commentData) => addFlagComment(flagId, commentData),
    onSuccess: () => {
      toast.success('Comment added successfully');
      setComment('');
      refetch();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to add comment');
    },
  });

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      commentMutation.mutate({ message: comment });
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleResolveFlag = async () => {
    if (!selectedResolution || !resolutionReason.trim()) {
      toast.error('Please select a resolution and provide a reason');
      return;
    }

    resolveFlagMutation.mutate({
      resolution: selectedResolution,
      reason: resolutionReason,
      suspensionDays: selectedResolution.includes('suspended') ? suspensionDays : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar heading="Loading..." />
        <div className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="animate-spin">Loading...</div>
        </div>
      </div>
    );
  }

  if (!flag) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar heading="Flag Not Found" />
        <div className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="text-gray-500">Flag not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="Flag Investigation" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  {flag.eventId?.name || 'Unknown Event'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Flagged by {flag.flaggedBy?.email} on {new Date(flag.flaggedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${severityColors[flag.severity]}`}>
                  <AlertTriangle className="w-4 h-4" />
                  {flag.severity.toUpperCase()}
                </span>
                <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {flag.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Flag Details */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Flag Details</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Reason</p>
                      <p className="text-gray-900 dark:text-gray-100 capitalize">{flag.reason.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Description</p>
                      <p className="text-gray-900 dark:text-gray-100">{flag.description}</p>
                    </div>
                    {flag.evidence && flag.evidence.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Evidence</p>
                        <div className="flex flex-wrap gap-2">
                          {flag.evidence.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900 transition border border-blue-300 dark:border-blue-700"
                            >
                              <Upload className="w-3 h-3" />
                              Evidence {i + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Details */}
                {flag.eventId && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Event Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Event Name</p>
                        <p className="text-gray-900 dark:text-gray-100">{flag.eventId.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                        <EventStatusBadge status={flag.eventId.status} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Organizer</p>
                        <p className="text-gray-900 dark:text-gray-100"> {flag.organizerId?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</p>
                        <p className="text-gray-900 dark:text-gray-100">{new Date(flag.eventId.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Investigation Timeline */}
                {resolution && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <FlagInvestigationTimeline timeline={resolution.timeline} />
                  </div>
                )}

                {/* Add Comment Section */}
                {flag.status !== 'resolved' && flag.status !== 'dismissed' && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Investigation Note</h2>
                    <div className="space-y-4">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add evidence or investigation notes..."
                        className="w-full h-24 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!comment.trim() || commentMutation.isPending}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg flex items-center gap-2 transition"
                      >
                        <Send className="w-4 h-4" />
                        {commentMutation.isPending ? 'Adding...' : 'Add Note'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Organizer Info */}
                {flag.organizerId && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Organizer</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">{flag.organizerId.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                          {flag.organizerId.firstName} {flag.organizerId.lastName}
                        </p>
                      </div>
                      {flag.organizerId.trustMetrics && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Trust Score</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                              {flag.organizerId.trustMetrics.trustScore}
                            </span>
                            <span className="text-2xl">⭐</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-auto">/5</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Resolution Actions */}
                {flag.status !== 'resolved' && flag.status !== 'dismissed' && (
                  <button
                    onClick={() => setShowResolutionModal(true)}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition shadow-md"
                  >
                    <Shield className="w-5 h-5" />
                    Resolve Flag
                  </button>
                )}

                {/* Resolution Status */}
                {flag.status === 'resolved' && (
                  <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg shadow p-6 border border-emerald-200 dark:border-emerald-800">
                    <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-4 flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      Flag Resolved
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-emerald-700 dark:text-emerald-400 font-medium">Decision</p>
                        <p className="text-emerald-900 dark:text-emerald-200 capitalize">{resolution?.decision?.replace(/_/g, ' ') || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-emerald-700 dark:text-emerald-400 font-medium">Reason</p>
                        <p className="text-emerald-900 dark:text-emerald-200">{resolution?.decisionReason || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resolution Modal */}
            {showResolutionModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-600" />
                      Resolve Flag
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {/* Resolution Options */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Choose Resolution</p>
                      <div className="grid grid-cols-2 gap-2">
                        {resolutionOptions.map((opt) => {
                          const IconComponent = opt.icon;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => setSelectedResolution(opt.value)}
                              className={`p-3 rounded-lg text-xs font-semibold text-center transition flex flex-col items-center gap-1 ${
                                selectedResolution === opt.value
                                  ? `${opt.color} ring-2 ring-offset-2 ring-blue-500`
                                  : opt.color
                              }`}
                            >
                              <IconComponent className="w-4 h-4" />
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Days for suspension */}
                    {selectedResolution?.includes('suspended') && selectedResolution !== 'permanent_suspension' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suspension Days</label>
                        <input
                          type="number"
                          value={suspensionDays}
                          onChange={(e) => setSuspensionDays(parseInt(e.target.value))}
                          min="1"
                          max="365"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason</label>
                      <textarea
                        value={resolutionReason}
                        onChange={(e) => setResolutionReason(e.target.value)}
                        placeholder="Explanation for this resolution..."
                        className="w-full h-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setShowResolutionModal(false)}
                        disabled={resolveFlagMutation.isPending}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleResolveFlag}
                        disabled={resolveFlagMutation.isPending || !selectedResolution}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        {resolveFlagMutation.isPending ? 'Resolving...' : 'Confirm'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
