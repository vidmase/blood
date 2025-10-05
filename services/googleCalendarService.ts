import type { BloodPressureReading } from '../types';

interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  colorId?: string;
}

// Get status color ID for Google Calendar
const getCalendarColorId = (systolic: number, diastolic: number): string => {
  // Google Calendar color IDs:
  // 1: Lavender, 2: Sage, 3: Grape, 4: Flamingo, 5: Banana
  // 6: Tangerine, 7: Peacock, 8: Graphite, 9: Blueberry, 10: Basil, 11: Tomato
  if (systolic >= 140 || diastolic >= 90) return '11'; // Red - Critical
  if (systolic >= 130 || diastolic >= 85) return '6';  // Orange - High
  if (systolic > 120 || diastolic > 80) return '5';   // Yellow - Elevated
  if (systolic < 90 || diastolic < 60) return '7';    // Blue - Normal
  return '10'; // Green - Optimal
};

// Get status label
const getStatusLabel = (systolic: number, diastolic: number): string => {
  if (systolic >= 140 || diastolic >= 90) return '🚨 Critical';
  if (systolic >= 130 || diastolic >= 85) return '⚠️ High';
  if (systolic > 120 || diastolic > 80) return '📈 Elevated';
  if (systolic < 90 || diastolic < 60) return '💙 Normal';
  return '✅ Optimal';
};

// Format reading for calendar event
const formatReadingEvent = (reading: BloodPressureReading): CalendarEvent => {
  const readingDate = new Date(reading.date);
  const endDate = new Date(readingDate.getTime() + 15 * 60000); // 15 minutes duration
  
  const status = getStatusLabel(reading.systolic, reading.diastolic);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const summary = `BP: ${reading.systolic}/${reading.diastolic} - ${status}`;
  
  let description = `Blood Pressure Reading\n\n`;
  description += `📊 Measurements:\n`;
  description += `• Systolic: ${reading.systolic} mmHg\n`;
  description += `• Diastolic: ${reading.diastolic} mmHg\n`;
  description += `• Pulse: ${reading.pulse} bpm\n\n`;
  description += `📈 Status: ${status}\n\n`;
  
  if (reading.notes) {
    description += `📝 Notes: ${reading.notes}\n\n`;
  }
  
  description += `🕒 Recorded: ${readingDate.toLocaleString()}\n`;
  description += `\n--- Blood Pressure Tracker App ---`;
  
  return {
    summary,
    description,
    start: {
      dateTime: readingDate.toISOString(),
      timeZone,
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone,
    },
    colorId: getCalendarColorId(reading.systolic, reading.diastolic),
  };
};

// Create .ics file content (iCalendar format)
export const createICSFile = (readings: BloodPressureReading[]): string => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  let icsContent = 'BEGIN:VCALENDAR\r\n';
  icsContent += 'VERSION:2.0\r\n';
  icsContent += 'PRODID:-//Blood Pressure Tracker//EN\r\n';
  icsContent += 'CALSCALE:GREGORIAN\r\n';
  icsContent += 'METHOD:PUBLISH\r\n';
  icsContent += 'X-WR-CALNAME:Blood Pressure Readings\r\n';
  icsContent += 'X-WR-TIMEZONE:' + Intl.DateTimeFormat().resolvedOptions().timeZone + '\r\n';
  
  readings.forEach((reading) => {
    const event = formatReadingEvent(reading);
    const readingDate = new Date(reading.date);
    const endDate = new Date(readingDate.getTime() + 15 * 60000);
    
    const dtStart = readingDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dtEnd = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const uid = `bp-reading-${reading.id}-${timestamp}@bloodpressuretracker.app`;
    
    icsContent += 'BEGIN:VEVENT\r\n';
    icsContent += `UID:${uid}\r\n`;
    icsContent += `DTSTAMP:${timestamp}\r\n`;
    icsContent += `DTSTART:${dtStart}\r\n`;
    icsContent += `DTEND:${dtEnd}\r\n`;
    icsContent += `SUMMARY:${event.summary.replace(/\n/g, '\\n')}\r\n`;
    icsContent += `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\r\n`;
    icsContent += 'STATUS:CONFIRMED\r\n';
    icsContent += 'SEQUENCE:0\r\n';
    icsContent += 'END:VEVENT\r\n';
  });
  
  icsContent += 'END:VCALENDAR\r\n';
  
  return icsContent;
};

// Download .ics file
export const downloadICSFile = (readings: BloodPressureReading[], filename: string = 'blood-pressure-readings.ics') => {
  const icsContent = createICSFile(readings);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

// Create Google Calendar link (opens in browser)
export const createGoogleCalendarLink = (reading: BloodPressureReading): string => {
  const event = formatReadingEvent(reading);
  const readingDate = new Date(reading.date);
  const endDate = new Date(readingDate.getTime() + 15 * 60000);
  
  // Format dates for Google Calendar URL (YYYYMMDDTHHmmssZ)
  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const startDate = formatGoogleDate(readingDate);
  const endDateFormatted = formatGoogleDate(endDate);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.summary,
    details: event.description,
    dates: `${startDate}/${endDateFormatted}`,
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Open Google Calendar with reading
export const addToGoogleCalendar = (reading: BloodPressureReading) => {
  const link = createGoogleCalendarLink(reading);
  window.open(link, '_blank', 'noopener,noreferrer');
};

// Export multiple readings to Google Calendar
export const exportMultipleToGoogleCalendar = (readings: BloodPressureReading[]) => {
  if (readings.length === 0) {
    throw new Error('No readings to export');
  }
  
  // For multiple readings, we create and download an .ics file
  // which can be imported into Google Calendar
  const today = new Date().toISOString().split('T')[0];
  downloadICSFile(readings, `bp-readings-${today}.ics`);
  
  return {
    success: true,
    count: readings.length,
    message: 'Calendar file downloaded. Import it into Google Calendar.',
  };
};

// Create instructions for importing .ics file
export const getImportInstructions = (): string[] => {
  return [
    '1. Open Google Calendar (calendar.google.com)',
    '2. Click the ⚙️ Settings icon in the top right',
    '3. Select "Import & export" from the left menu',
    '4. Click "Select file from your computer"',
    '5. Choose the downloaded .ics file',
    '6. Select which calendar to import to',
    '7. Click "Import"',
    '8. Your blood pressure readings will appear in your calendar!',
  ];
};

export const googleCalendarService = {
  createICSFile,
  downloadICSFile,
  createGoogleCalendarLink,
  addToGoogleCalendar,
  exportMultipleToGoogleCalendar,
  getImportInstructions,
  formatReadingEvent,
};

