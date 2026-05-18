'use client';

import { Calendar, Users, BarChart3, Search, ArrowRight } from 'lucide-react';

const EmptyStates = {
  NO_EVENTS: {
    icon: Calendar,
    title: 'No events yet',
    description: 'Create an event from a confirmed venue booking, then add tickets and publication details.',
    cta: 'Create event',
  },
  NO_ATTENDEES: {
    icon: Users,
    title: 'No attendees yet',
    description: 'Registrations and check-ins will appear here once tickets start moving.',
    cta: 'View event',
  },
  NO_DATA: {
    icon: BarChart3,
    title: 'No analytics data',
    description: 'Performance data will appear after events receive registrations.',
    cta: 'View events',
  },
  NO_RESULTS: {
    icon: Search,
    title: 'No matching events',
    description: 'Adjust the search term or status filter to widen the list.',
    cta: 'Clear filters',
  },
  NO_SELECTION: {
    icon: Calendar,
    title: 'No events selected',
    description: 'Select events to export, duplicate, or delete them in bulk.',
    cta: 'Select events',
  },
};

export default function EmptyState({
  type = 'NO_EVENTS',
  onCtaClick,
  ctaText,
  description,
  title,
}) {
  const config = EmptyStates[type] || EmptyStates.NO_EVENTS;
  const Icon = config.icon;

  return (
    <div className="px-5 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[#e8dcc8] bg-[#fbf8f2] text-[#3a1224]/60">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-black text-[#3a1224]">{title || config.title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#3a1224]/55">{description || config.description}</p>
      {onCtaClick && (
        <button
          onClick={onCtaClick}
          className="mt-6 inline-flex items-center gap-2 bg-[#3a1224] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#4b1830]"
        >
          {ctaText || config.cta}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
