'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const breadcrumbConfig = {
  '/organizer-hub': { label: 'Dashboard', icon: '🏠' },
  '/organizer-hub/events': { label: 'Events', parent: 'Dashboard' },
  '/organizer-hub/events/new': { label: 'Create Event', parent: 'Events' },
  '/organizer-hub/settings': { label: 'Settings', parent: 'Dashboard' },
  '/organizer-hub/analytics': { label: 'Analytics', parent: 'Dashboard' },
};

export default function BreadcrumbNav() {
  const pathname = usePathname();
  
  // Build breadcrumb trail
  const buildBreadcrumbs = () => {
    const crumbs = [];
    const pathSegments = pathname.split('/').filter(Boolean);
    
    // Always start with Dashboard
    crumbs.push({ label: 'Organizer', href: '/organizer-hub', isHome: true });
    
    // Build path based on current route
    if (pathname === '/organizer-hub') {
      crumbs.push({ label: 'Dashboard', isActive: true });
    } else if (pathname.includes('/events')) {
      crumbs.push({ label: 'Events', href: '/organizer-hub/events' });
      
      if (pathname.includes('/new')) {
        crumbs.push({ label: 'Create Event', isActive: true });
      } else if (pathname.match(/\/events\/\d+/)) {
        const eventId = pathname.split('/')[3];
        crumbs.push({ label: 'Event Details', isActive: true, eventId });
      }
    } else if (pathname.includes('/settings')) {
      crumbs.push({ label: 'Settings', isActive: true });
    } else if (pathname.includes('/analytics')) {
      crumbs.push({ label: 'Analytics', isActive: true });
    }
    
    return crumbs;
  };
  
  const breadcrumbs = buildBreadcrumbs();
  
  return (
    <nav className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((crumb, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {idx > 0 && <ChevronRight size={16} className="text-[#3a1224]/40" />}
          
          {crumb.isActive ? (
            <span className="text-[#3a1224] font-bold text-xs uppercase tracking-widest">
              {crumb.label}
            </span>
          ) : (
            <Link 
              href={crumb.href} 
              className="text-[#3a1224]/60 hover:text-[#C0A04C] font-medium text-xs uppercase tracking-widest transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
