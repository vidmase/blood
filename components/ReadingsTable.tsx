
import React, { useState, useMemo } from 'react';
import type { BloodPressureReading } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { useUserSettings } from '../context/UserSettingsContext';
import { classifyReading } from '../utils/bpClassification';
import { ESHClassificationButton } from './ESHClassificationButton';

interface ReadingsTableProps {
  readings: BloodPressureReading[];
  totalReadings: number;
  onEditReading?: (reading: BloodPressureReading) => void;
  onDeleteReading?: (reading: BloodPressureReading) => void;
  onSyncReading?: (reading: BloodPressureReading) => void;
  onBulkSync?: (readings: BloodPressureReading[]) => void;
  isGoogleCalendarConnected?: boolean;
}

// Medical Icons
const SystolicIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const DiastolicIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
);

const HeartIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
);

const ClockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CalendarIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const SyncIcon: React.FC<{ synced?: boolean }> = ({ synced }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        {synced ? (
            // Synced icon (checkmark in circle)
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        ) : (
            // Not synced icon (refresh/arrow)
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        )}
    </svg>
);

const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const DeleteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const TrendUpIcon: React.FC<{ className?: string }> = ({ className = "h-3 w-3" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
);

const TrendDownIcon: React.FC<{ className?: string }> = ({ className = "h-3 w-3" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

// ESH Blood Pressure Assessment Wrapper
// Maps ESH classification to table display format
const getBloodPressureAssessment = (systolic: number, diastolic: number): {
  category: string;
  level: 'low' | 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis';
  color: string;
  bgColor: string;
  description: string;
} => {
  const eshCategory = classifyReading({ systolic, diastolic, pulse: 0, id: '', date: new Date().toISOString() });
  
  // Map ESH categories to table levels for backwards compatibility
  let level: 'low' | 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis';
  
  switch (eshCategory.categoryShort) {
    case 'Crisis':
    case 'Grade 3 HTN':
      level = 'crisis';
      break;
    case 'Grade 2 HTN':
      level = 'stage2';
      break;
    case 'Grade 1 HTN':
    case 'ISH':
      level = 'stage1';
      break;
    case 'High-Normal':
      level = 'elevated';
      break;
    case 'Low':
      level = 'low';
      break;
    case 'Normal':
      level = 'normal';
      break;
    case 'Optimal':
    default:
      level = 'normal';
      break;
  }
  
  // Map ESH colors to Tailwind text/bg classes
  const getColorClasses = (color: string) => {
    if (color.includes('#991b1b') || color.includes('#dc2626')) return { text: 'text-red-900', bg: 'bg-red-100' };
    if (color.includes('#f87171')) return { text: 'text-red-700', bg: 'bg-red-50' };
    if (color.includes('#fb923c') || color.includes('#f97316')) return { text: 'text-orange-700', bg: 'bg-orange-50' };
    if (color.includes('#fbbf24')) return { text: 'text-amber-700', bg: 'bg-amber-50' };
    if (color.includes('#60a5fa')) return { text: 'text-blue-700', bg: 'bg-blue-50' };
    if (color.includes('#84cc16')) return { text: 'text-lime-700', bg: 'bg-lime-50' };
    if (color.includes('#10b981')) return { text: 'text-emerald-700', bg: 'bg-emerald-50' };
    return { text: 'text-slate-700', bg: 'bg-slate-50' };
  };
  
  const colors = getColorClasses(eshCategory.color);
  
  return {
    category: eshCategory.category,
    level,
    color: colors.text,
    bgColor: colors.bg,
    description: eshCategory.description
  };
};

// ESH-Based Status Indicator
const getStatusIndicator = (value: number, type: 'systolic' | 'diastolic'): { 
  className: string, 
  indicator: React.ReactNode, 
  level: 'optimal' | 'normal' | 'elevated' | 'high' | 'critical',
  textColor: string,
  bgColor: string
} => {
  let indicator: React.ReactNode = null;
  let level: 'optimal' | 'normal' | 'elevated' | 'high' | 'critical' = 'normal';
  let textColor = '';
  let bgColor = '';

  if (type === 'systolic') {
    // ESH Systolic Thresholds
    if (value >= 220) {
      indicator = <TrendUpIcon className="h-3 w-3" />;
      textColor = 'text-red-900';
      bgColor = 'bg-red-100';
      level = 'critical';
    } else if (value >= 180) {
      indicator = <TrendUpIcon className="h-3 w-3" />;
      textColor = 'text-red-800';
      bgColor = 'bg-red-100';
      level = 'critical';
    } else if (value >= 160) {
      indicator = <TrendUpIcon className="h-3 w-3" />;
      textColor = 'text-red-700';
      bgColor = 'bg-red-50';
      level = 'critical';
    } else if (value >= 140) {
      indicator = <TrendUpIcon className="h-3 w-3" />;
      textColor = 'text-orange-700';
      bgColor = 'bg-orange-50';
      level = 'high';
    } else if (value >= 130) {
      indicator = <TrendUpIcon className="h-3 w-3" />;
      textColor = 'text-amber-700';
      bgColor = 'bg-amber-50';
      level = 'elevated';
    } else if (value >= 120) {
      textColor = 'text-lime-700';
      bgColor = 'bg-lime-50';
      level = 'normal';
    } else if (value < 90) {
      indicator = <TrendDownIcon className="h-3 w-3" />;
      textColor = 'text-blue-700';
      bgColor = 'bg-blue-50';
      level = 'normal';
    } else {
      textColor = 'text-emerald-700';
      bgColor = 'bg-emerald-50';
      level = 'optimal';
    }
  } else { // diastolic - ESH Diastolic Thresholds
    if (value >= 120) {
      indicator = <TrendUpIcon className="h-3 w-3" />;
      textColor = 'text-red-900';
      bgColor = 'bg-red-100';
      level = 'critical';
    } else if (value >= 110) {
      indicator = <TrendUpIcon className="h-3 w-3" />;
      textColor = 'text-red-800';
      bgColor = 'bg-red-100';
      level = 'critical';
    } else if (value >= 100) {
      indicator = <TrendUpIcon className="h-3 w-3" />;
      textColor = 'text-red-700';
      bgColor = 'bg-red-50';
      level = 'critical';
    } else if (value >= 90) {
      indicator = <TrendUpIcon className="h-3 w-3" />;
      textColor = 'text-orange-700';
      bgColor = 'bg-orange-50';
      level = 'high';
    } else if (value >= 85) {
      indicator = <TrendUpIcon className="h-3 w-3" />;
      textColor = 'text-amber-700';
      bgColor = 'bg-amber-50';
      level = 'elevated';
    } else if (value >= 80) {
      textColor = 'text-lime-700';
      bgColor = 'bg-lime-50';
      level = 'normal';
    } else if (value < 60) {
      indicator = <TrendDownIcon className="h-3 w-3" />;
      textColor = 'text-blue-700';
      bgColor = 'bg-blue-50';
      level = 'normal';
    } else {
      textColor = 'text-emerald-700';
      bgColor = 'bg-emerald-50';
      level = 'optimal';
    }
  }

  return { 
    className: `inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${textColor} ${bgColor}`, 
    indicator, 
    level, 
    textColor, 
    bgColor 
  };
};


export const ReadingsTable: React.FC<ReadingsTableProps> = ({ 
  readings, 
  totalReadings, 
  onEditReading, 
  onDeleteReading, 
  onSyncReading,
  onBulkSync,
  isGoogleCalendarConnected = false
}) => {
  const { t, language } = useLocalization();
  const { targets } = useUserSettings();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const hasOriginalReadings = totalReadings > 0;
  const hasFilteredReadings = readings.length > 0;
  
  const dateLocale = language === 'lt' ? 'lt-LT' : 'en-US';
  
  // Calculate sync statistics using the database column
  const unsyncedReadings = readings.filter(reading => !reading.synced_to_calendar);
  const syncedCount = readings.length - unsyncedReadings.length;

  // Shared styling functions
  const getStatusGradient = (level: string) => {
    switch(level) {
      case 'crisis': return 'from-red-700 to-red-800';
      case 'stage2': return 'from-red-500 to-red-600';
      case 'stage1': return 'from-orange-500 to-orange-600';
      case 'elevated': return 'from-amber-500 to-amber-600';
      case 'low': return 'from-blue-500 to-blue-600';
      default: return 'from-emerald-500 to-emerald-600';
    }
  };

  const getRowBg = (level: string) => {
    switch(level) {
      case 'crisis': return 'hover:bg-gradient-to-r hover:from-red-100/50 hover:to-red-50/30';
      case 'stage2': return 'hover:bg-gradient-to-r hover:from-red-50/50 hover:to-red-50/30';
      case 'stage1': return 'hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-orange-50/30';
      case 'elevated': return 'hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-amber-50/30';
      case 'low': return 'hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-50/30';
      default: return 'hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-emerald-50/30';
    }
  };

  const getBorderColor = (level: string) => {
    switch(level) {
      case 'crisis': return 'border-red-500';
      case 'stage2': return 'border-red-500';
      case 'stage1': return 'border-orange-500';
      case 'elevated': return 'border-amber-500';
      case 'low': return 'border-blue-500';
      default: return 'border-emerald-500';
    }
  };

  const getStatusBg = (level: string) => {
    switch(level) {
      case 'crisis': return 'bg-gradient-to-br from-red-100 to-red-200/50';
      case 'stage2': return 'bg-gradient-to-br from-red-50 to-red-100/50';
      case 'stage1': return 'bg-gradient-to-br from-orange-50 to-orange-100/50';
      case 'elevated': return 'bg-gradient-to-br from-amber-50 to-amber-100/50';
      case 'low': return 'bg-gradient-to-br from-blue-50 to-blue-100/50';
      default: return 'bg-gradient-to-br from-emerald-50 to-emerald-100/50';
    }
  };

  // Pagination logic
  const paginatedReadings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return readings.slice(startIndex, endIndex);
  }, [readings, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(readings.length / itemsPerPage);

  // Reset to first page when readings change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [readings.length]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    document.querySelector('.readings-table-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="readings-table-container relative">
        {!hasFilteredReadings ? (
            <div className="text-center py-12 px-4 bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{t('table.noReadingsFound')}</h3>
                <p className="text-slate-600">
                  {hasOriginalReadings
                    ? t('table.empty.filtered')
                    : t('table.empty.noData')
                  }
                </p>
            </div>
        ) : (
          <div className="bg-gradient-to-br from-white to-slate-50/30 rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
            {/* Modern Header */}
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-slate-200/60 px-6 py-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{t('table.bloodPressureHistory')}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {t('table.showingReadings', {
                      start: ((currentPage - 1) * itemsPerPage) + 1,
                      end: Math.min(currentPage * itemsPerPage, readings.length),
                      total: readings.length
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* ESH Classification Button */}
                  <ESHClassificationButton variant="secondary" size="sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    ESH Guide
                  </ESHClassificationButton>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-600">Show:</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="px-2 py-1 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <span className="text-xs font-medium text-slate-600">{t('table.latestData')}</span>
                  </div>
                  {/* Current Targets Chip */}
                  <div className="hidden sm:flex items-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 bg-indigo-100 border border-indigo-200">
                      {t('table.currentTargets', { sys: targets.systolic, dia: targets.diastolic })}
                    </span>
                  </div>
                  
                  {/* Bulk Sync Button */}
                  {isGoogleCalendarConnected && unsyncedReadings.length > 0 && onBulkSync && (
                    <button
                      onClick={() => onBulkSync(unsyncedReadings)}
                      className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      title={`Sync ${unsyncedReadings.length} unsynced readings to Google Calendar`}
                    >
                      <SyncIcon synced={false} />
                      <span>Sync All ({unsyncedReadings.length})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Table - Enhanced Modern Design */}
            <div className="hidden lg:block overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                    <th className="px-4 py-4 text-left text-sm font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <CalendarIcon />
                        {t('table.dateTime')}
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-2">
                        <HeartIcon className="w-4 h-4" />
                        {t('table.bloodPressure')}
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-2">
                        <HeartIcon className="w-4 h-4 text-red-400" />
                        {t('table.pulse')}
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('table.assessment')}
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        {t('table.notes')}
                      </div>
                    </th>
                    {isGoogleCalendarConnected && (
                      <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Sync
                        </div>
                      </th>
                    )}
                    {(onEditReading || onDeleteReading) && (
                      <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          </svg>
                          {t('table.actions')}
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {paginatedReadings.map((reading, index) => {
                    const assessment = getBloodPressureAssessment(reading.systolic, reading.diastolic);
                    const systolicStatus = getStatusIndicator(reading.systolic, 'systolic');
                    const diastolicStatus = getStatusIndicator(reading.diastolic, 'diastolic');
                    
                    const d = new Date(reading.date);
                    const dd = String(d.getDate()).padStart(2,'0');
                    const mm = String(d.getMonth() + 1).padStart(2,'0');
                    const yyyy = d.getFullYear();
                    const hh = String(d.getHours()).padStart(2,'0');
                    const min = String(d.getMinutes()).padStart(2,'0');

                    const isOverTarget = reading.systolic > targets.systolic || reading.diastolic > targets.diastolic;
                    const isSynced = reading.synced_to_calendar || false;
                    return (
                      <tr key={reading.id} className={`group transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-gradient-to-r hover:from-white hover:to-slate-50/50 border-b border-slate-100/60`}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                              <CalendarIcon />
                            </div>
                            <div className="leading-tight">
                              <div className="text-sm font-bold text-slate-900">{`${dd}-${mm}-${yyyy}`}</div>
                              <div className="text-xs text-slate-600 font-medium flex items-center gap-1">
                                <ClockIcon />
                                {`${hh}:${min}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="relative">
                            <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-3 shadow-lg border border-slate-200/60 inline-block min-w-[100px] group-hover:shadow-xl transition-all duration-300">
                              <div className="flex items-baseline justify-center gap-1 mb-1">
                                <span className="text-2xl font-black text-slate-900" style={{color: systolicStatus.color}}>{reading.systolic}</span>
                                <span className="text-slate-400 text-lg font-bold">/</span>
                                <span className="text-xl font-bold text-slate-700" style={{color: diastolicStatus.color}}>{reading.diastolic}</span>
                              </div>
                              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">mmHg</div>
                              <div className={`mt-2 px-2 py-1 rounded-full text-[10px] font-bold ${isOverTarget ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {reading.systolic > targets.systolic ? '+' : ''}{reading.systolic - targets.systolic}/{reading.diastolic > targets.diastolic ? '+' : ''}{reading.diastolic - targets.diastolic}
                              </div>
                            </div>
                            {/* Trend indicators */}
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                              <SystolicIcon />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="relative">
                            <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-3 shadow-lg border border-slate-200/60 inline-block min-w-[70px] group-hover:shadow-xl transition-all duration-300">
                              <div className="text-lg font-black text-slate-900">{reading.pulse}</div>
                              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">BPM</div>
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                              <HeartIcon className="w-2.5 h-2.5 text-white" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r ${getStatusGradient(assessment.level)} shadow-lg transition-all duration-200 group-hover:shadow-xl group-hover:scale-105`} title={assessment.description}>
                              {assessment.category}
                            </span>
                            {assessment.level === 'crisis' && (
                              <div className="flex items-center gap-1 text-xs text-red-700 font-bold animate-pulse bg-red-100 px-2 py-1 rounded-full">
                                <span>⚠️</span>
                                <span>URGENT</span>
                              </div>
                            )}
                            {assessment.level === 'stage2' && (
                              <div className="flex items-center gap-1 text-xs text-orange-700 font-bold bg-orange-100 px-2 py-1 rounded-full">
                                <span>⚠️</span>
                                <span>HIGH</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {reading.notes ? (
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-3 border border-slate-200/60 group-hover:shadow-md transition-all duration-300">
                              <p className="text-xs text-slate-700 leading-relaxed" title={reading.notes}>
                                {reading.notes.length > 30 ? `${reading.notes.substring(0, 30)}...` : reading.notes}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-slate-100/50 rounded-xl p-3 border border-slate-200/40">
                              <span className="text-slate-400 text-xs italic">No notes</span>
                            </div>
                          )}
                        </td>
                        {isGoogleCalendarConnected && (
                          <td className="px-4 py-4 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-md ${
                                isSynced 
                                  ? 'text-green-800 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200' 
                                  : 'text-amber-800 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200'
                              }`}>
                                <SyncIcon synced={isSynced} />
                                <span className="hidden xl:inline">{isSynced ? 'Synced' : 'Not Synced'}</span>
                              </div>
                              {!isSynced && onSyncReading && (
                                <button
                                  onClick={() => onSyncReading(reading)}
                                  className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                                  title="Sync to Google Calendar"
                                >
                                  Sync Now
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                        {(onEditReading || onDeleteReading) && (
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {onEditReading && (
                                <button
                                  onClick={() => onEditReading(reading)}
                                  className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center group"
                                  title="Edit reading"
                                >
                                  <EditIcon />
                                </button>
                              )}
                              {onDeleteReading && (
                                <button
                                  onClick={() => onDeleteReading(reading)}
                                  className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center group"
                                  title="Delete reading"
                                >
                                  <DeleteIcon />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Medium Table - Enhanced Tablet View */}
            <div className="hidden md:block lg:hidden">
              <div className="space-y-4">
                {paginatedReadings.map((reading, index) => {
                  const assessment = getBloodPressureAssessment(reading.systolic, reading.diastolic);
                  const isOverTarget = reading.systolic > targets.systolic || reading.diastolic > targets.diastolic;
                  const isSynced = reading.synced_to_calendar || false;
                  
                  const d = new Date(reading.date);
                  const dd = String(d.getDate()).padStart(2,'0');
                  const mm = String(d.getMonth() + 1).padStart(2,'0');
                  const yyyy = d.getFullYear();
                  const hh = String(d.getHours()).padStart(2,'0');
                  const min = String(d.getMinutes()).padStart(2,'0');

                  return (
                    <div key={reading.id} className={`group bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                      {/* Enhanced Header */}
                      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-4 text-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                              <CalendarIcon />
                            </div>
                            <div>
                              <div className="text-sm font-bold">{`${dd}-${mm}-${yyyy}`}</div>
                              <div className="text-xs text-indigo-100 flex items-center gap-1">
                                <ClockIcon />
                                {`${hh}:${min}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-white/20 backdrop-blur-sm shadow-lg`}>
                              {assessment.category}
                            </span>
                            {isGoogleCalendarConnected && (
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                                isSynced 
                                  ? 'bg-green-500/20 text-green-100' 
                                  : 'bg-amber-500/20 text-amber-100'
                              }`}>
                                <SyncIcon synced={isSynced} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Content */}
                      <div className="px-4 py-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {/* Blood Pressure */}
                          <div className="text-center">
                            <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-4 shadow-lg border border-slate-200/60 group-hover:shadow-xl transition-all duration-300">
                              <div className="flex items-baseline justify-center gap-1 mb-2">
                                <span className="text-2xl font-black text-slate-900">{reading.systolic}</span>
                                <span className="text-slate-400 text-lg font-bold">/</span>
                                <span className="text-xl font-bold text-slate-700">{reading.diastolic}</span>
                              </div>
                              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">mmHg</div>
                              <div className={`mt-2 px-2 py-1 rounded-full text-[10px] font-bold ${isOverTarget ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {reading.systolic > targets.systolic ? '+' : ''}{reading.systolic - targets.systolic}/{reading.diastolic > targets.diastolic ? '+' : ''}{reading.diastolic - targets.diastolic}
                              </div>
                            </div>
                          </div>
                          
                          {/* Pulse */}
                          <div className="text-center">
                            <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-4 shadow-lg border border-slate-200/60 group-hover:shadow-xl transition-all duration-300">
                              <div className="text-2xl font-black text-slate-900 mb-2">{reading.pulse}</div>
                              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">BPM</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Notes */}
                        {reading.notes && (
                          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-3 mb-4 border border-slate-200/60">
                            <p className="text-sm text-slate-700">{reading.notes}</p>
                          </div>
                        )}
                        
                        {/* Enhanced Actions */}
                        <div className="flex items-center justify-between">
                          {!isSynced && onSyncReading && (
                            <button
                              onClick={() => onSyncReading(reading)}
                              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
                            >
                              <SyncIcon synced={false} />
                              Sync Now
                            </button>
                          )}
                          
                          <div className="flex items-center gap-2 ml-auto">
                            {onEditReading && (
                              <button
                                onClick={() => onEditReading(reading)}
                                className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center"
                                title="Edit reading"
                              >
                                <EditIcon />
                              </button>
                            )}
                            {onDeleteReading && (
                              <button
                                onClick={() => onDeleteReading(reading)}
                                className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center"
                                title="Delete reading"
                              >
                                <DeleteIcon />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile-Optimized Cards */}
            <div className="md:hidden space-y-4 p-4">
              {/* Current Targets Chip (Mobile) */}
              <div className="flex justify-end">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 bg-indigo-100 border border-indigo-200">
                  {t('table.currentTargets', { sys: targets.systolic, dia: targets.diastolic })}
                </span>
              </div>
              {paginatedReadings.map((reading, index) => {
                const assessment = getBloodPressureAssessment(reading.systolic, reading.diastolic);

                const md = new Date(reading.date);
                const mdd = String(md.getDate()).padStart(2,'0');
                const mmm = String(md.getMonth() + 1).padStart(2,'0');
                const myyyy = md.getFullYear();
                const mhh = String(md.getHours()).padStart(2,'0');
                const mmin = String(md.getMinutes()).padStart(2,'0');

                const isOverTarget = reading.systolic > targets.systolic || reading.diastolic > targets.diastolic;
                const isSynced = reading.synced_to_calendar || false;
                return (
                  <div key={reading.id} className={`relative rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${getStatusBg(assessment.level)} animate-fadeInUp`}>
                    {/* Status Indicator Bar */}
                    <div className={`h-2 bg-gradient-to-r ${getStatusGradient(assessment.level)} shadow-sm`}></div>
                    
                    <div className="p-5">
                      {/* Header with Date and Actions */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 leading-tight">
                          <div className="text-base font-bold text-slate-900 whitespace-nowrap">{`${mdd}-${mmm}-${myyyy}`}</div>
                          <div className="text-xs text-slate-600 font-semibold mt-0.5 whitespace-nowrap">{`${mhh}:${mmin}`}</div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getStatusGradient(assessment.level)} shadow-sm`} title={assessment.description}>
                            {assessment.category}
                          </span>
                          {assessment.level === 'crisis' && (
                            <span className="text-xs text-red-700 font-semibold animate-pulse">⚠️ Emergency</span>
                          )}
                          
                          {/* Sync Status */}
                          {isGoogleCalendarConnected && (
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                              isSynced 
                                ? 'text-green-700 bg-green-100 border border-green-200' 
                                : 'text-amber-700 bg-amber-100 border border-amber-200'
                            }`}>
                              <SyncIcon synced={isSynced} />
                              <span>{isSynced ? 'Synced' : 'Not Synced'}</span>
                            </div>
                          )}
                          
                          {(onEditReading || onDeleteReading) && (
                            <div className="flex items-center gap-1">
                              {onEditReading && (
                                <button
                                  onClick={() => onEditReading(reading)}
                                  className="p-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg transition-all duration-200 shadow-sm"
                                  title="Edit reading"
                                >
                                  <EditIcon />
                                </button>
                              )}
                              {onDeleteReading && (
                                <button
                                  onClick={() => onDeleteReading(reading)}
                                  className="p-2 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200 shadow-sm"
                                  title="Delete reading"
                                >
                                  <DeleteIcon />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Main Blood Pressure Display */
                      }
                      <div className="bg-white/70 rounded-xl p-4 mb-4 backdrop-blur-sm">
                        <div className="flex items-center justify-center">
                          <div className="text-center">
                            <div className="flex items-baseline justify-center gap-2 mb-2">
                              <span className="text-4xl font-black text-slate-900">{reading.systolic}</span>
                              <span className="text-slate-400 text-2xl font-bold">/</span>
                              <span className="text-3xl font-bold text-slate-700">{reading.diastolic}</span>
                            </div>
                            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">mmHg</div>
                            <div className={`mt-1 text-xs font-bold ${isOverTarget ? 'text-red-600' : 'text-emerald-600'}`}>
                              {reading.systolic > targets.systolic ? '+' : ''}{reading.systolic - targets.systolic}/{reading.diastolic > targets.diastolic ? '+' : ''}{reading.diastolic - targets.diastolic} <span className="opacity-70 text-[10px]">vs target</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pulse Display */}
                      <div className="bg-white/70 rounded-xl p-3 mb-4 backdrop-blur-sm">
                        <div className="text-center">
                          <div className="flex items-baseline justify-center gap-2 mb-1">
                            <span className="text-2xl font-bold text-slate-900">{reading.pulse}</span>
                            <span className="text-sm font-semibold text-slate-500">BPM</span>
                          </div>
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pulse Rate</div>
                        </div>
                      </div>
                      
                      {/* Notes Section */}
                      {reading.notes && (
                        <div className="bg-white/70 rounded-xl p-3 backdrop-blur-sm">
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</div>
                          <p className="text-sm text-slate-700 leading-relaxed">{reading.notes}</p>
                        </div>
                      )}
                      
                      {/* Sync Action Section */}
                      {isGoogleCalendarConnected && !isSynced && onSyncReading && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">Calendar Sync</div>
                              <p className="text-sm text-indigo-600">Not synced to Google Calendar</p>
                            </div>
                            <button
                              onClick={() => onSyncReading(reading)}
                              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 flex items-center gap-1"
                            >
                              <SyncIcon synced={false} />
                              Sync Now
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-t border-slate-200/60 px-6 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Page Info */}
                  <div className="text-sm text-slate-600">
                    Page {currentPage} of {totalPages} ({readings.length} total readings)
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              currentPage === pageNum
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Quick Jump */}
                  {totalPages > 5 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">Go to:</span>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => {
                          const page = parseInt(e.target.value);
                          if (page >= 1 && page <= totalPages) {
                            handlePageChange(page);
                          }
                        }}
                        className="w-16 px-2 py-1 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
};
