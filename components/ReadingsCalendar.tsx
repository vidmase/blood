import React, { useState, useMemo } from 'react';
import type { BloodPressureReading } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { classifyBloodPressure } from '../utils/bpClassification';

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
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const CalendarIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// ESH-Based Status Level for Calendar
const getStatusLevel = (systolic: number, diastolic: number): 'optimal' | 'normal' | 'elevated' | 'high' | 'critical' => {
  const eshCategory = classifyBloodPressure(systolic, diastolic);
  
  // Map ESH categories to calendar status levels
  switch (eshCategory.categoryShort) {
    case 'Crisis':
    case 'Grade 3 HTN':
    case 'Grade 2 HTN':
      return 'critical';
    case 'Grade 1 HTN':
    case 'ISH':
      return 'high';
    case 'High-Normal':
      return 'elevated';
    case 'Normal':
      return 'normal';
    case 'Low':
      return 'normal'; // Low BP shows as normal blue
    case 'Optimal':
    default:
      return 'optimal';
  }
};

// Solid, distinct colors for each status - highly visible
const getStatusColor = (status: 'optimal' | 'normal' | 'elevated' | 'high' | 'critical') => {
  switch (status) {
    case 'critical': return 'bg-red-500 hover:bg-red-600';
    case 'high': return 'bg-orange-500 hover:bg-orange-600';
    case 'elevated': return 'bg-amber-400 hover:bg-amber-500';
    case 'optimal': return 'bg-emerald-500 hover:bg-emerald-600';
    default: return 'bg-blue-500 hover:bg-blue-600';
  }
};

const getStatusBorderColor = (status: 'optimal' | 'normal' | 'elevated' | 'high' | 'critical') => {
  switch (status) {
    case 'critical': return 'border-red-600';
    case 'high': return 'border-orange-600';
    case 'elevated': return 'border-amber-500';
    case 'optimal': return 'border-emerald-600';
    default: return 'border-blue-600';
  }
};

const getStatusIcon = (status: 'optimal' | 'normal' | 'elevated' | 'high' | 'critical') => {
  switch (status) {
    case 'critical': 
      return (
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'high':
      return (
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'elevated':
      return (
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case 'optimal':
      return (
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
    default:
      return (
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
  }
};

export const ReadingsCalendar: React.FC<ReadingsCalendarProps> = ({ readings, onDateSelect }) => {
  const { t, language } = useLocalization();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  
  const dateLocale = language === 'lt' ? 'lt-LT' : 'en-US';

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const currentYear = current.getFullYear();
      const currentMonth = current.getMonth();
      const currentDay = current.getDate();
      
      const dayReadings = readings.filter(reading => {
        const readingDate = new Date(reading.date);
        return readingDate.getFullYear() === currentYear &&
               readingDate.getMonth() === currentMonth &&
               readingDate.getDate() === currentDay;
      });
      
      let averageStatus: 'optimal' | 'normal' | 'elevated' | 'high' | 'critical' = 'optimal';
      if (dayReadings.length > 0) {
        const statuses = dayReadings.map(r => getStatusLevel(r.systolic, r.diastolic));
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
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  const weekDays = language === 'lt' 
    ? ['Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št', 'Sk']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate statistics for current month
  const monthStats = useMemo(() => {
    const monthReadings = calendarDays
      .filter(day => day.isCurrentMonth && day.hasReadings)
      .flatMap(day => day.readings);
    
    if (monthReadings.length === 0) return null;
    
    const avgSystolic = Math.round(
      monthReadings.reduce((sum, r) => sum + r.systolic, 0) / monthReadings.length
    );
    const avgDiastolic = Math.round(
      monthReadings.reduce((sum, r) => sum + r.diastolic, 0) / monthReadings.length
    );
    const daysWithReadings = calendarDays.filter(day => day.isCurrentMonth && day.hasReadings).length;
    
    return { avgSystolic, avgDiastolic, daysWithReadings, totalReadings: monthReadings.length };
  }, [calendarDays]);

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
        {/* Modern Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 sm:px-6 py-4 sm:py-6 overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
          </div>
          
          <div className="relative flex items-center justify-between">
            {/* Navigation buttons */}
            <button
              onClick={() => navigateMonth('prev')}
              className="group p-2 sm:p-3 hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 backdrop-blur-sm border border-white/20"
              aria-label="Previous month"
            >
              <ChevronLeftIcon />
            </button>
            
            {/* Center content */}
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/30">
                  <CalendarIcon />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white drop-shadow-lg tracking-tight">
                  {currentDate.toLocaleDateString(dateLocale, { month: 'long' })}
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-base sm:text-lg font-semibold text-white/90">
                    {currentDate.getFullYear()}
                  </span>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm bg-white/20 text-white hover:bg-white/30 rounded-full transition-all duration-300 font-bold backdrop-blur-sm border border-white/30 hover:scale-105 transform active:scale-95 shadow-lg"
                  >
                    Today
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigateMonth('next')}
              className="group p-2 sm:p-3 hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 backdrop-blur-sm border border-white/20"
              aria-label="Next month"
            >
              <ChevronRightIcon />
            </button>
          </div>
          
          {/* Month statistics bar */}
          {monthStats && (
            <div className="relative mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-3 sm:px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-xs sm:text-sm font-semibold text-white/90">{monthStats.daysWithReadings} days</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-white/90">{monthStats.totalReadings} readings</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white">{monthStats.avgSystolic}/{monthStats.avgDiastolic}</span>
                <span className="text-[10px] sm:text-xs text-white/70">avg</span>
              </div>
            </div>
          )}
        </div>

        {/* Calendar Grid */}
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-slate-50/50 to-white">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
            {weekDays.map((day, index) => (
              <div 
                key={day} 
                className={`p-2 sm:p-3 text-center text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                  index === 0 || index === 6 
                    ? 'text-indigo-600' 
                    : 'text-slate-600'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days - Color Coded */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3">
            {calendarDays.map((day, index) => {
              const isTodayDate = isToday(day.date);
              const isHovered = hoveredDay === index;
              
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(day)}
                  onMouseEnter={() => setHoveredDay(index)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`
                    group relative aspect-square flex flex-col items-center justify-center rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 transform
                    ${day.hasReadings ? 'cursor-pointer hover:scale-105 sm:hover:scale-110 hover:z-10' : ''}
                    ${!day.isCurrentMonth ? 'opacity-40' : ''}
                    ${isTodayDate ? 'ring-2 sm:ring-4 ring-white ring-offset-2' : ''}
                  `}
                >
                  {/* Solid color background for days with readings */}
                  <div className={`
                    absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300
                    ${day.hasReadings 
                      ? `${getStatusColor(day.averageStatus)} shadow-lg ${isHovered ? 'shadow-xl scale-105' : ''}`
                      : isTodayDate
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg'
                        : 'bg-slate-50/50 hover:bg-white/80 border border-slate-200/60'
                    }
                  `}></div>
                  
                  {/* Day number - High contrast on colored backgrounds */}
                  <span className={`
                    relative z-10 text-sm sm:text-base md:text-lg font-bold transition-all duration-300
                    ${day.hasReadings || isTodayDate
                      ? 'text-white drop-shadow-md' 
                      : day.isCurrentMonth 
                        ? 'text-slate-700' 
                        : 'text-slate-400'
                    }
                    ${isHovered && day.hasReadings ? 'scale-110' : ''}
                  `}>
                    {day.date.getDate()}
                  </span>
                  
                  {/* Status icon for clarity */}
                  {day.hasReadings && (
                    <div className={`
                      absolute bottom-1 sm:bottom-2 right-1 sm:right-2 text-white/90
                      transform transition-all duration-300
                      ${isHovered ? 'scale-125' : ''}
                    `}>
                      {getStatusIcon(day.averageStatus)}
                    </div>
                  )}
                  
                  {/* Multiple readings badge */}
                  {day.readings.length > 1 && (
                    <div className="absolute -top-1 -right-1 z-20">
                      <div className="relative">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-white text-slate-900 text-[10px] sm:text-xs rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white">
                          {day.readings.length}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Today indicator dot */}
                  {isTodayDate && !day.hasReadings && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                      <div className="w-2 h-2 bg-white rounded-full shadow-lg"></div>
                    </div>
                  )}
                  
                  {/* Mobile-friendly hover tooltip */}
                  {isHovered && day.hasReadings && (
                    <div className="hidden sm:block absolute -bottom-14 md:-bottom-16 left-1/2 -translate-x-1/2 z-30 px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-900 text-white text-[10px] sm:text-xs rounded-lg shadow-xl whitespace-nowrap pointer-events-none animate-fadeIn">
                      <div className="font-bold">{day.readings.length} reading{day.readings.length > 1 ? 's' : ''}</div>
                      <div className="text-slate-300 text-[9px] sm:text-[10px] mt-0.5">Tap to view details</div>
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Color-coded Legend */}
        <div className="relative bg-gradient-to-r from-slate-50 via-white to-slate-50 border-t-2 border-slate-200/60 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-8">
            {[
              { status: 'optimal' as const, label: 'Optimal' },
              { status: 'normal' as const, label: 'Normal' },
              { status: 'elevated' as const, label: 'Elevated' },
              { status: 'high' as const, label: 'High' },
              { status: 'critical' as const, label: 'Critical' }
            ].map(({ status, label }) => (
              <div key={status} className="group flex items-center gap-2 cursor-default">
                <div className={`
                  w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg sm:rounded-xl shadow-md transition-all duration-300 
                  ${getStatusColor(status)}
                  group-hover:scale-110 group-hover:shadow-lg
                  flex items-center justify-center
                `}>
                  <div className="text-white">
                    {getStatusIcon(status)}
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
