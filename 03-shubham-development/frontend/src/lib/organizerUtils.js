/**
 * Utility functions for organizer operations
 */

// Export events to CSV
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      let value = row[header];
      
      // Handle dates
      if (value instanceof Date) {
        value = value.toISOString().split('T')[0];
      }
      
      // Escape quotes and wrap in quotes if contains comma
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    });
    csvContent += values.join(',') + '\n';
  });

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export attendees to CSV
export const exportAttendees = (attendees) => {
  const formatted = attendees.map(attendee => ({
    'Full Name': attendee.fullName || `${attendee.firstName} ${attendee.lastName}`,
    'Email': attendee.email || '—',
    'Phone': attendee.phone || '—',
    'Registered': attendee.createdAt ? new Date(attendee.createdAt).toLocaleDateString() : '—',
    'Check-in Status': attendee.isCheckedIn ? 'Checked In' : 'Not Checked In',
    'Check-in Time': attendee.checkedInAt ? new Date(attendee.checkedInAt).toLocaleString() : '—',
  }));

  exportToCSV(formatted, 'attendees');
};

// Export events to CSV
export const exportEvents = (events) => {
  const formatted = events.map(event => ({
    'Event Name': event.name || '—',
    'Status': event.status || '—',
    'Date': event.eventDate ? new Date(event.eventDate).toLocaleDateString() : '—',
    'Capacity': event.capacity || '—',
    'Registrations': event.registrations || 0,
    'Revenue': event.revenue || '$0',
  }));

  exportToCSV(formatted, 'events');
};

// Export attendance report
export const exportAttendanceReport = (event, attendees) => {
  const totalAttendees = attendees.length;
  const checkedIn = attendees.filter(a => a.isCheckedIn).length;
  
  const report = [
    {
      'Metric': 'Event Name',
      'Value': event.name || '—'
    },
    {
      'Metric': 'Event Date',
      'Value': event.eventDate ? new Date(event.eventDate).toLocaleDateString() : '—'
    },
    {
      'Metric': 'Total Registrations',
      'Value': totalAttendees
    },
    {
      'Metric': 'Total Check-ins',
      'Value': checkedIn
    },
    {
      'Metric': 'Check-in Rate',
      'Value': `${((checkedIn / totalAttendees) * 100).toFixed(1)}%`
    },
  ];

  exportToCSV(report, `report-${event.name}`);
};
