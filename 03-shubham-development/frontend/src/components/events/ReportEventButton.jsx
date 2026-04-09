'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from 'contexts/AuthProvider';
import axiosInstance from 'lib/axios';
import ReportEventModal from './ReportEventModal';

export default function ReportEventButton({ eventId, eventName, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Check if user has already reported this event
  useEffect(() => {
    const checkExistingReport = async () => {
      if (!user?.id || !eventId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/api/v1/event-reports/check/${eventId}`);
        setHasReported(response.data?.hasReported || false);
      } catch (error) {
        // If error, allow reporting (don't block on error)
        setHasReported(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingReport();
  }, [user?.id, eventId]);

  const handleReportSuccess = () => {
    setHasReported(true);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <button disabled className="inline-flex items-center gap-2 lg:px-4 lg:py-2.5 rounded-lg border-2 border-[#C0A04C]/30 bg-[#C0A04C]/5 text-[#3a1224]/50 font-semibold text-sm  opacity-50">
        <AlertCircle size={16} />
        Loading...
      </button>
    );
  }

  if (hasReported) {
    return (
      <button
        disabled
        title="You have already reported this event"
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-green-500/50 bg-green-500/10 text-green-700 font-semibold text-sm opacity-75 cursor-not-allowed ${className}`}
      >
        <CheckCircle size={16} />
        Already Reported
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 lg:px-4 lg:py-2.5 rounded-lg border-2 border-[#C0A04C]/50 bg-[#C0A04C]/10  hover:border-[#C0A04C] hover:bg-[#C0A04C]/20 transition font-semibold py-2 px-2 text-red-500 text-[10px] lg:text-sm ${className}`}
      >
        <AlertCircle size={16} />
        Report Event
      </button>

      <ReportEventModal
        eventId={eventId}
        eventName={eventName}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onReportSuccess={handleReportSuccess}
      />
    </>
  );
}
