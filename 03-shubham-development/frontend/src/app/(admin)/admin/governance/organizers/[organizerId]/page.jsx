'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import {
  useQueryOrganizerReputation,
  useQueryOrganizerAuditTrail,
} from '@queries/admin/governance.queries';
import { suspendOrganizerEvent } from '@api/governance/organizer-events-api';
import { TrustScoreBadge } from 'components/admin/governance/GovernanceComponents';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import AdminTopbar from 'components/admin/dashboard/AdminTopbar';

export default function OrganizerReputationPage({ params }) {
  const router = useRouter();
  const [suspensionDays, setSuspensionDays] = useState(30);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const {
    data: reputationData,
    isLoading: isReputationLoading,
    error: reputationError,
  } = useQueryOrganizerReputation(params.organizerId);

  const {
    data: auditData,
    isLoading: isAuditLoading,
  } = useQueryOrganizerAuditTrail(params.organizerId);

  const suspendMutation = useMutation({
    mutationFn: (organizerId) => suspendOrganizerEvent(organizerId),
    onSuccess: () => {
      toast.success(`Organizer suspended for ${suspensionDays} days`);
      setShowSuspendModal(false);
      window.location.reload();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Failed to suspend organizer'
      );
    },
  });

  const handleSuspend = () => {
    suspendMutation.mutate(params.organizerId);
  };

  if (reputationError)
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
        <p className="text-red-800 dark:text-red-200">
          Failed to load organizer reputation. Try again.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Go Back
        </button>
      </div>
    );

  const organizer = reputationData?.organizer;
  const trustMetrics = organizer?.trustMetrics || {};
  const isSuspended =
    organizer?.suspendedUntil &&
    new Date(organizer.suspendedUntil) > new Date();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="Organizer Profile" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
          {/* Header with Back */}
          <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <ArrowLeft className="text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {organizer?.fullName || 'Unknown Organizer'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Reputation Profile & Activity
          </p>
        </div>
      </div>

      {/* Organizer Info Card */}
      {isReputationLoading ? (
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Basic Info */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="text-gray-400" size={18} />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Email
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {organizer?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="text-gray-400" size={18} />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Phone
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {organizer?.phoneNumber || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="text-gray-400" size={18} />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Member Since
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {organizer?.createdAt
                          ? new Date(organizer.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suspension Status */}
              {isSuspended && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200 font-medium">
                    ⚠️ Currently Suspended
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Until: {new Date(organizer.suspendedUntil).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Trust Score & Metrics */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Trust Score & Metrics
              </h2>

              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <TrustScoreBadge score={trustMetrics.trustScore || 0} />
                </div>

                <div className="space-y-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Approval Rate
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {trustMetrics.eventsApproved &&
                      trustMetrics.eventsCreated
                        ? Math.round(
                            (trustMetrics.eventsApproved /
                              trustMetrics.eventsCreated) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Total Events
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {trustMetrics.eventsCreated || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowSuspendModal(true)}
                  disabled={isSuspended}
                  className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSuspended ? 'Already Suspended' : 'Suspend Organizer'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Active Flags
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {trustMetrics.currentFlags || 0}
              </p>
            </div>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Total Suspensions
              </p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {trustMetrics.suspensions || 0}
              </p>
            </div>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Avg Rating
              </p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {trustMetrics.averageRating
                  ? trustMetrics.averageRating.toFixed(1)
                  : 'N/A'}
              </p>
            </div>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Resolved Issues
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {trustMetrics.resolvedIssues || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Activity Timeline
        </h2>

        {isAuditLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
              />
            ))}
          </div>
        ) : auditData?.logs && auditData.logs.length > 0 ? (
          <div className="space-y-3">
            {auditData.logs.map((log) => (
              <div
                key={log._id}
                className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex-shrink-0">
                  <Clock className="text-gray-400" size={18} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {log.action}
                    </p>
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">
                      {log.entityType}
                    </span>
                  </div>

                  {log.changes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {Object.entries(log.changes)
                        .map(
                          ([key, val]) =>
                            `${key}: ${JSON.stringify(val)}`
                        )
                        .join(', ')}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            {auditData.logs.length > 10 && (
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                Showing 10 most recent activities
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-center py-6">
            No activity yet
          </p>
        )}
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Suspend Organizer
            </h3>

            <p className="text-gray-600 dark:text-gray-400">
              {organizer?.fullName} will not be able to create events during
              suspension.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Suspension Duration (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={suspensionDays}
                onChange={(e) => setSuspensionDays(Math.max(1, parseInt(e.target.value) || 30))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={suspendMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suspendMutation.isPending ? 'Suspending...' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
