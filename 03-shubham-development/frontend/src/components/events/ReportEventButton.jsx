'use client';

import { useState, useEffect } from 'react';
import { Flag, Check } from 'lucide-react';
import { useAuth } from 'contexts/AuthProvider';
import axiosInstance from 'lib/axios';
import ReportEventModal from './ReportEventModal';

export default function ReportEventButton({ eventId, eventName, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkExistingReport = async () => {
      if (!user?.id || !eventId) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await axiosInstance.get(`/api/v1/event-reports/check/${eventId}`);
        setHasReported(response.data?.hasReported || false);
      } catch {
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

  if (isLoading) return null;

  if (hasReported) {
    return (
      <span
        title="You have already reported this event"
        className={`inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 ${className}`}
      >
        <Check className="h-3 w-3" />
        Reported
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-[#3a1224]/15 px-3 py-1.5 text-[11px] font-bold text-[#3a1224]/55 transition hover:border-[#3a1224]/30 hover:text-[#3a1224]/80 ${className}`}
      >
        <Flag className="h-3 w-3" />
        Report
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
