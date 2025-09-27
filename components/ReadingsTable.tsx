
import React, { useState, useMemo } from 'react';
import type { BloodPressureReading } from '../types';
import { useLocalization } from '../context/LocalizationContext';

interface ReadingsTableProps {
  readings: BloodPressureReading[];
  totalReadings: number;
  onEditReading?: (reading: BloodPressureReading) => void;
  onDeleteReading?: (reading: BloodPressureReading) => void;
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
    if (value >= 140) {
      indicator = <TrendUpIcon className="h-3 w-3" />;
      textColor = 'text-red-700';
      bgColor = 'bg-red-50';
      level = 'critical';
    } else if (value >= 130) {
      indicator = <TrendUpIcon className="h-3 w-3" />;
      textColor = 'text-orange-700';
      bgColor = 'bg-orange-50';
      level = 'high';
    } else if (value > 120) {
      indicator = <TrendUpIcon className="h-3 w-3" />;
      textColor = 'text-amber-700';
      bgColor = 'bg-amber-50';
      level = 'elevated';
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
  } else { // diastolic
    if (value >= 90) {
      indicator = <TrendUpIcon className="h-3 w-3" />;
      textColor = 'text-red-700';
      bgColor = 'bg-red-50';
      level = 'critical';
    } else if (value >= 85) {
      indicator = <TrendUpIcon className="h-3 w-3" />;
      textColor = 'text-orange-700';
      bgColor = 'bg-orange-50';
      level = 'high';
    } else if (value > 80) {
      indicator = <TrendUpIcon className="h-3 w-3" />;
      textColor = 'text-amber-700';
      bgColor = 'bg-amber-50';
      level = 'elevated';
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


export const ReadingsTable: React.FC<ReadingsTableProps> = ({ readings, totalReadings, onEditReading, onDeleteReading }) => {
  const { t, language } = useLocalization();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const hasOriginalReadings = totalReadings > 0;
  const hasFilteredReadings = readings.length > 0;
  
  const dateLocale = language === 'lt' ? 'lt-LT' : 'en-US';

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
                </div>
              </div>
            </div>

            {/* Desktop Table - Modern Design */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 via-indigo-50/30 to-purple-50/30 border-b-2 border-indigo-100">
                    <th className="px-3 lg:px-6 py-4 text-left text-xs lg:text-sm font-bold text-slate-800 uppercase tracking-wide w-[15%]">{t('table.dateTime')}</th>
                    <th className="px-3 lg:px-6 py-4 text-center text-xs lg:text-sm font-bold text-slate-800 uppercase tracking-wide w-[20%]">{t('table.bloodPressure')}</th>
                    <th className="px-3 lg:px-6 py-4 text-center text-xs lg:text-sm font-bold text-slate-800 uppercase tracking-wide w-[15%]">{t('table.pulse')}</th>
                    <th className="px-3 lg:px-6 py-4 text-center text-xs lg:text-sm font-bold text-slate-800 uppercase tracking-wide w-[15%]">{t('table.assessment')}</th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs lg:text-sm font-bold text-slate-800 uppercase tracking-wide w-[20%]">{t('table.notes')}</th>
                    {(onEditReading || onDeleteReading) && (
                      <th className="px-3 lg:px-6 py-4 text-center text-xs lg:text-sm font-bold text-slate-800 uppercase tracking-wide w-[15%]">{t('table.actions')}</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedReadings.map((reading, index) => {
                    const systolicStatus = getStatusIndicator(reading.systolic, 'systolic');
                    const diastolicStatus = getStatusIndicator(reading.diastolic, 'diastolic');
                    const overallLevel = systolicStatus.level === 'critical' || diastolicStatus.level === 'critical' 
                      ? 'critical' 
                      : systolicStatus.level === 'high' || diastolicStatus.level === 'high' 
                      ? 'high' 
                      : systolicStatus.level === 'elevated' || diastolicStatus.level === 'elevated' 
                      ? 'elevated' 
                      : 'normal';
                    
                    const getStatusText = (level: string) => {
                      switch(level) {
                        case 'critical': return 'Critical';
                        case 'high': return 'High';
                        case 'elevated': return 'Elevated';
                        case 'normal': return 'Low';
                        default: return 'Optimal';
                      }
                    };

                    const getStatusGradient = (level: string) => {
                      switch(level) {
                        case 'critical': return 'from-red-500 to-red-600';
                        case 'high': return 'from-orange-500 to-orange-600';
                        case 'elevated': return 'from-amber-500 to-amber-600';
                        case 'normal': return 'from-blue-500 to-blue-600';
                        default: return 'from-emerald-500 to-emerald-600';
                      }
                    };

                    const getRowBg = (level: string) => {
                      switch(level) {
                        case 'critical': return 'hover:bg-gradient-to-r hover:from-red-50/50 hover:to-red-50/30';
                        case 'high': return 'hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-orange-50/30';
                        case 'elevated': return 'hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-amber-50/30';
                        case 'normal': return 'hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-50/30';
                        default: return 'hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-emerald-50/30';
                      }
                    };
                    
                    const d = new Date(reading.date);
                    const dd = String(d.getDate()).padStart(2,'0');
                    const mm = String(d.getMonth() + 1).padStart(2,'0');
                    const yyyy = d.getFullYear();
                    const hh = String(d.getHours()).padStart(2,'0');
                    const min = String(d.getMinutes()).padStart(2,'0');

                    return (
                      <tr key={reading.id} className={`transition-all duration-300 border-l-4 border-transparent hover:border-l-4 hover:border-${overallLevel === 'critical' ? 'red' : overallLevel === 'high' ? 'orange' : overallLevel === 'elevated' ? 'amber' : overallLevel === 'normal' ? 'blue' : 'emerald'}-400 ${getRowBg(overallLevel)} hover:shadow-sm`}>
                        <td className="px-2 lg:px-4 py-3">
                          <div className="leading-tight">
                            <div className="text-xs lg:text-sm font-semibold text-slate-900 whitespace-nowrap">{`${dd}-${mm}-${yyyy}`}</div>
                            <div className="text-xs text-slate-600 font-medium mt-0.5 whitespace-nowrap">{`${hh}:${min}`}</div>
                          </div>
                        </td>
                        <td className="px-2 lg:px-4 py-3 text-center">
                          <div className="bg-white/80 rounded-lg p-2 lg:p-3 shadow-sm border border-slate-100 inline-block">
                            <div className="flex items-baseline justify-center gap-0.5 lg:gap-1">
                              <span className="text-lg lg:text-2xl font-black text-slate-900">{reading.systolic}</span>
                              <span className="text-slate-400 text-sm lg:text-xl font-bold">/</span>
                              <span className="text-base lg:text-xl font-bold text-slate-700">{reading.diastolic}</span>
                            </div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">mmHg</div>
                          </div>
                        </td>
                        <td className="px-2 lg:px-4 py-3 text-center">
                          <div className="bg-white/80 rounded-lg p-2 lg:p-3 shadow-sm border border-slate-100 inline-block">
                            <div className="text-base lg:text-xl font-bold text-slate-900">{reading.pulse}</div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">BPM</div>
                          </div>
                        </td>
                        <td className="px-2 lg:px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs lg:text-sm font-bold text-white bg-gradient-to-r ${getStatusGradient(overallLevel)} shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}>
                            {getStatusText(overallLevel)}
                          </span>
                        </td>
                        <td className="px-2 lg:px-4 py-3">
                          {reading.notes ? (
                            <div className="bg-slate-50/80 rounded-lg p-2 lg:p-3 border border-slate-200/60">
                              <p className="text-xs lg:text-sm text-slate-700 leading-relaxed" title={reading.notes}>
                                {reading.notes.length > 30 ? `${reading.notes.substring(0, 30)}...` : reading.notes}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs lg:text-sm italic">No notes</span>
                          )}
                        </td>
                        {(onEditReading || onDeleteReading) && (
                          <td className="px-2 lg:px-4 py-3 text-center">
                            <div className="flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-2">
                              {onEditReading && (
                                <button
                                  onClick={() => onEditReading(reading)}
                                  className="px-2 lg:px-3 py-1 lg:py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs lg:text-sm font-semibold rounded-md lg:rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 w-full lg:w-auto"
                                >
                                  {t('table.edit')}
                                </button>
                              )}
                              {onDeleteReading && (
                                <button
                                  onClick={() => onDeleteReading(reading)}
                                  className="px-2 lg:px-3 py-1 lg:py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs lg:text-sm font-semibold rounded-md lg:rounded-lg shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 w-full lg:w-auto"
                                >
                                  {t('table.delete')}
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

            {/* Mobile-Optimized Cards */}
            <div className="md:hidden space-y-4 p-4">
              {paginatedReadings.map((reading, index) => {
                const systolicStatus = getStatusIndicator(reading.systolic, 'systolic');
                const diastolicStatus = getStatusIndicator(reading.diastolic, 'diastolic');
                const overallLevel = systolicStatus.level === 'critical' || diastolicStatus.level === 'critical' 
                  ? 'critical' 
                  : systolicStatus.level === 'high' || diastolicStatus.level === 'high' 
                  ? 'high' 
                  : systolicStatus.level === 'elevated' || diastolicStatus.level === 'elevated' 
                  ? 'elevated' 
                  : 'normal';

                const getStatusText = (level: string) => {
                  switch(level) {
                    case 'critical': return 'Critical';
                    case 'high': return 'High';
                    case 'elevated': return 'Elevated';
                    case 'normal': return 'Low';
                    default: return 'Optimal';
                  }
                };

                const getStatusGradient = (level: string) => {
                  switch(level) {
                    case 'critical': return 'from-red-500 to-red-600';
                    case 'high': return 'from-orange-500 to-orange-600';
                    case 'elevated': return 'from-amber-500 to-amber-600';
                    case 'normal': return 'from-blue-500 to-blue-600';
                    default: return 'from-emerald-500 to-emerald-600';
                  }
                };

                const getStatusBg = (level: string) => {
                  switch(level) {
                    case 'critical': return 'bg-gradient-to-br from-red-50 to-red-100/50';
                    case 'high': return 'bg-gradient-to-br from-orange-50 to-orange-100/50';
                    case 'elevated': return 'bg-gradient-to-br from-amber-50 to-amber-100/50';
                    case 'normal': return 'bg-gradient-to-br from-blue-50 to-blue-100/50';
                    default: return 'bg-gradient-to-br from-emerald-50 to-emerald-100/50';
                  }
                };

                const md = new Date(reading.date);
                const mdd = String(md.getDate()).padStart(2,'0');
                const mmm = String(md.getMonth() + 1).padStart(2,'0');
                const myyyy = md.getFullYear();
                const mhh = String(md.getHours()).padStart(2,'0');
                const mmin = String(md.getMinutes()).padStart(2,'0');

                return (
                  <div key={reading.id} className={`relative rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${getStatusBg(overallLevel)} animate-fadeInUp`}>
                    {/* Status Indicator Bar */}
                    <div className={`h-2 bg-gradient-to-r ${getStatusGradient(overallLevel)} shadow-sm`}></div>
                    
                    <div className="p-5">
                      {/* Header with Date and Actions */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 leading-tight">
                          <div className="text-base font-bold text-slate-900 whitespace-nowrap">{`${mdd}-${mmm}-${myyyy}`}</div>
                          <div className="text-xs text-slate-600 font-semibold mt-0.5 whitespace-nowrap">{`${mhh}:${mmin}`}</div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getStatusGradient(overallLevel)} shadow-sm`}>
                            {getStatusText(overallLevel)}
                          </span>
                          
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
                      
                      {/* Main Blood Pressure Display */}
                      <div className="bg-white/70 rounded-xl p-4 mb-4 backdrop-blur-sm">
                        <div className="flex items-center justify-center">
                          <div className="text-center">
                            <div className="flex items-baseline justify-center gap-2 mb-2">
                              <span className="text-4xl font-black text-slate-900">{reading.systolic}</span>
                              <span className="text-slate-400 text-2xl font-bold">/</span>
                              <span className="text-3xl font-bold text-slate-700">{reading.diastolic}</span>
                            </div>
                            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">mmHg</div>
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
