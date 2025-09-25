import React, { useState, useMemo } from 'react';
import type { BloodPressureReading } from '../types';
import { useLocalization } from '../context/LocalizationContext';

interface ReadingsCalendarProps {
  readings: BloodPressureReading[];
  onDateSelect?: (date: Date, readings: BloodPressureReading[]) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  readings: BloodPressureReading[];
  hasReadings: boolean;
  averageStatus: 'optimal' | 'normal' | 'elevated' | 'high' | 'critical';
}

const ChevronLeftIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const getStatusLevel = (systolic: number, diastolic: number): 'optimal' | 'normal' | 'elevated' | 'high' | 'critical' => {
  if (systolic >= 140 || diastolic >= 90) return 'critical';
  if (systolic >= 130 || diastolic >= 85) return 'high';
  if (systolic > 120 || diastolic > 80) return 'elevated';
  if (systolic < 90 || diastolic < 60) return 'normal';
  return 'optimal';
};

const getStatusColor = (status: 'optimal' | 'normal' | 'elevated' | 'high' | 'critical') => {
  switch (status) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'elevated': return 'bg-amber-500';
    case 'optimal': return 'bg-emerald-500';
    default: return 'bg-blue-500';
  }
};

const getStatusEmoji = (status: 'optimal' | 'normal' | 'elevated' | 'high' | 'critical') => {
  switch (status) {
    case 'critical': return '🚨';
    case 'high': return '⚠️';
    case 'elevated': return '📈';
    case 'optimal': return '✅';
    default: return '💙';
  }
};

export const ReadingsCalendar: React.FC<ReadingsCalendarProps> = ({ readings, onDateSelect }) => {
  const { t, language } = useLocalization();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const dateLocale = language === 'lt' ? 'lt-LT' : 'en-US';

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the first Sunday before or on the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End on the last Saturday after or on the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const dayReadings = readings.filter(reading => {
        const readingDate = new Date(reading.date).toISOString().split('T')[0];
        return readingDate === dateStr;
      });
      
      let averageStatus: 'optimal' | 'normal' | 'elevated' | 'high' | 'critical' = 'optimal';
      if (dayReadings.length > 0) {
        const statuses = dayReadings.map(r => getStatusLevel(r.systolic, r.diastolic));
        // Use the worst status of the day
        if (statuses.includes('critical')) averageStatus = 'critical';
        else if (statuses.includes('high')) averageStatus = 'high';
        else if (statuses.includes('elevated')) averageStatus = 'elevated';
        else if (statuses.includes('normal')) averageStatus = 'normal';
        else averageStatus = 'optimal';
      }
      
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        readings: dayReadings,
        hasReadings: dayReadings.length > 0,
        averageStatus
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate, readings]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day: CalendarDay) => {
    if (day.hasReadings && onDateSelect) {
      onDateSelect(day.date, day.readings);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {currentDate.toLocaleDateString(dateLocale, { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors duration-200"
              aria-label="Previous month"
            >
              <ChevronLeftIcon />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors duration-200"
              aria-label="Next month"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDateClick(day)}
              className={`
                relative p-2 h-12 flex items-center justify-center text-sm rounded-lg transition-all duration-200
                ${day.isCurrentMonth ? 'text-slate-900' : 'text-slate-400'}
                ${isToday(day.date) ? 'bg-indigo-100 text-indigo-900 font-semibold' : ''}
                ${day.hasReadings ? 'cursor-pointer hover:bg-slate-100' : ''}
                ${!day.isCurrentMonth ? 'opacity-50' : ''}
              `}
            >
              <span className="relative z-10">{day.date.getDate()}</span>
              
              {/* Reading Indicator */}
              {day.hasReadings && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs
                    ${getStatusColor(day.averageStatus)} bg-opacity-20 border-2 border-current
                  `}>
                    <span className="text-lg leading-none">
                      {getStatusEmoji(day.averageStatus)}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Multiple readings indicator */}
              {day.readings.length > 1 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-slate-600 text-white text-xs rounded-full flex items-center justify-center">
                  {day.readings.length}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-3">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-slate-600">Optimal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-600">Normal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-slate-600">Elevated</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-slate-600">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-slate-600">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
};
