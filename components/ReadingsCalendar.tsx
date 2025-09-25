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
    <div className="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden backdrop-blur-sm">
      {/* Modern Calendar Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-5 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-3 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="text-white" />
          </button>
          
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl font-bold text-white drop-shadow-sm">
              {currentDate.toLocaleDateString(dateLocale, { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm bg-white/20 text-white hover:bg-white/30 rounded-full transition-all duration-300 font-semibold backdrop-blur-sm border border-white/20 hover:scale-105 transform"
            >
              Today
            </button>
          </div>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-3 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
            aria-label="Next month"
          >
            <ChevronRightIcon className="text-white" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-sm font-bold text-slate-600 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const todayClass = isToday(day.date) ? 'ring-2 ring-indigo-400 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-900 font-bold shadow-lg' : '';
            const readingClass = day.hasReadings ? 'cursor-pointer hover:scale-105 hover:shadow-md' : '';
            const monthClass = day.isCurrentMonth ? 'text-slate-900' : 'text-slate-400 opacity-60';
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className={`
                  relative h-14 flex items-center justify-center text-sm rounded-xl transition-all duration-300 transform
                  ${monthClass} ${todayClass} ${readingClass}
                  ${day.hasReadings ? 'bg-white shadow-sm border border-slate-200/60' : 'hover:bg-slate-50'}
                `}
              >
                <span className="relative z-20 font-semibold">{day.date.getDate()}</span>
                
                {/* Reading Indicator with Gradient */}
                {day.hasReadings && (
                  <>
                    <div className={`absolute inset-1 rounded-lg bg-gradient-to-br opacity-20 ${
                      day.averageStatus === 'critical' ? 'from-red-400 to-red-600' :
                      day.averageStatus === 'high' ? 'from-orange-400 to-orange-600' :
                      day.averageStatus === 'elevated' ? 'from-amber-400 to-amber-600' :
                      day.averageStatus === 'normal' ? 'from-blue-400 to-blue-600' :
                      'from-emerald-400 to-emerald-600'
                    }`}></div>
                    
                    <div className="absolute bottom-1 right-1">
                      <div className={`w-3 h-3 rounded-full shadow-sm ${
                        day.averageStatus === 'critical' ? 'bg-red-500' :
                        day.averageStatus === 'high' ? 'bg-orange-500' :
                        day.averageStatus === 'elevated' ? 'bg-amber-500' :
                        day.averageStatus === 'normal' ? 'bg-blue-500' :
                        'bg-emerald-500'
                      }`}></div>
                    </div>
                  </>
                )}
                
                {/* Multiple readings indicator with modern design */}
                {day.readings.length > 1 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                    {day.readings.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Legend */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-t border-slate-200/60 px-6 py-4">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 group">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
            <span className="text-slate-700 font-medium">Optimal</span>
          </div>
          <div className="flex items-center gap-2 group">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
            <span className="text-slate-700 font-medium">Normal</span>
          </div>
          <div className="flex items-center gap-2 group">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
            <span className="text-slate-700 font-medium">Elevated</span>
          </div>
          <div className="flex items-center gap-2 group">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
            <span className="text-slate-700 font-medium">High</span>
          </div>
          <div className="flex items-center gap-2 group">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
            <span className="text-slate-700 font-medium">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
};
