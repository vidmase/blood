
import React from 'react';
import type { BloodPressureReading } from '../types';
import { useLocalization } from '../context/LocalizationContext';

interface ReadingsTableProps {
  readings: BloodPressureReading[];
  totalReadings: number;
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


export const ReadingsTable: React.FC<ReadingsTableProps> = ({ readings, totalReadings }) => {
  const { t, language } = useLocalization();
  const hasOriginalReadings = totalReadings > 0;
  const hasFilteredReadings = readings.length > 0;
  
  const dateLocale = language === 'lt' ? 'lt-LT' : 'en-US';

  return (
    <div className="max-h-[70vh] overflow-auto relative">
        {!hasFilteredReadings ? (
            <div className="text-center py-16 px-6 bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No Readings Found</h3>
                <p className="text-slate-600">
                  {hasOriginalReadings
                    ? t('table.empty.filtered')
                    : t('table.empty.noData')
                  }
                </p>
            </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-slate-200/60 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CalendarIcon className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Blood Pressure Readings</h3>
                    <p className="text-sm text-slate-600">
                      {readings.length} {readings.length === 1 ? 'reading' : 'readings'} found
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/60 text-slate-700 text-xs font-medium shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Latest Data
                  </span>
                </div>
              </div>
            </div>

            {/* Modern List */}
            <div className="divide-y divide-slate-100">
              {readings.map((reading, index) => {
                const systolicStatus = getStatusIndicator(reading.systolic, 'systolic');
                const diastolicStatus = getStatusIndicator(reading.diastolic, 'diastolic');
                const overallLevel = systolicStatus.level === 'critical' || diastolicStatus.level === 'critical' 
                  ? 'critical' 
                  : systolicStatus.level === 'high' || diastolicStatus.level === 'high' 
                  ? 'high' 
                  : systolicStatus.level === 'elevated' || diastolicStatus.level === 'elevated' 
                  ? 'elevated' 
                  : 'normal';
                
                return (
                  <div 
                    key={reading.id} 
                    className="p-6 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-indigo-50/30 transition-all duration-300 animate-fadeInUp group cursor-pointer border-l-4 border-transparent hover:border-indigo-400"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left: Date & Time */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center group-hover:from-indigo-100 group-hover:to-purple-100 transition-all duration-300">
                          <ClockIcon className="text-slate-600 group-hover:text-indigo-600 transition-colors duration-300" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-slate-900">
                            {new Date(reading.date).toLocaleDateString(dateLocale, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-sm text-slate-500 font-medium">
                            {new Date(reading.date).toLocaleTimeString(dateLocale, { 
                              hour: 'numeric', 
                              minute: '2-digit', 
                              hour12: true 
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Center: Readings */}
                      <div className="flex items-center gap-8">
                        {/* Systolic */}
                        <div className="text-center">
                          <div className="flex items-center gap-2 mb-1">
                            <SystolicIcon className="text-slate-500" />
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Systolic</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900 mb-1">{reading.systolic}</div>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${systolicStatus.textColor} ${systolicStatus.bgColor}`}>
                            {systolicStatus.indicator}
                            <span>mmHg</span>
                          </div>
                        </div>

                        {/* Diastolic */}
                        <div className="text-center">
                          <div className="flex items-center gap-2 mb-1">
                            <DiastolicIcon className="text-slate-500" />
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Diastolic</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900 mb-1">{reading.diastolic}</div>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${diastolicStatus.textColor} ${diastolicStatus.bgColor}`}>
                            {diastolicStatus.indicator}
                            <span>mmHg</span>
                          </div>
                        </div>

                        {/* Pulse */}
                        <div className="text-center">
                          <div className="flex items-center gap-2 mb-1">
                            <HeartIcon className="text-pink-500" />
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pulse</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900 mb-1">{reading.pulse}</div>
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-pink-50 text-pink-700">
                            <HeartIcon className="w-3 h-3" />
                            <span>BPM</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status */}
                      <div className="text-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm shadow-sm ${
                          overallLevel === 'critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                          overallLevel === 'high' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                          overallLevel === 'elevated' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span className="text-lg">
                            {overallLevel === 'critical' ? '🚨' : 
                             overallLevel === 'high' ? '⚠️' : 
                             overallLevel === 'elevated' ? '📈' : '✅'}
                          </span>
                          <span className="capitalize">
                            {overallLevel === 'normal' ? 'Optimal' : overallLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 px-6 py-4 border-t border-slate-200/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
                    Optimal
                  </span>
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></div>
                    Elevated
                  </span>
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></div>
                    High
                  </span>
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                    Critical
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-700">
                  Total: {readings.length} readings
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
