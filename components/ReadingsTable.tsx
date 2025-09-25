
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
            <div className="text-center py-12 px-4 bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-2xl border-2 border-dashed border-slate-200">
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
          <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
            {/* Simple Table Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-slate-900">Blood Pressure Readings ({readings.length})</h3>
            </div>

            {/* Simple Table */}
            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <table className="hidden sm:table w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Systolic</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Diastolic</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Pulse</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
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
                      <tr key={reading.id} className="hover:bg-slate-50 transition-colors duration-200">
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {new Date(reading.date).toLocaleDateString(dateLocale, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                            <div className="text-sm text-slate-500">
                              {new Date(reading.date).toLocaleTimeString(dateLocale, { 
                                hour: 'numeric', 
                                minute: '2-digit', 
                                hour12: true 
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="text-lg font-semibold text-slate-900">{reading.systolic}</div>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${systolicStatus.textColor} ${systolicStatus.bgColor}`}>
                            {systolicStatus.indicator}
                            mmHg
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="text-lg font-semibold text-slate-900">{reading.diastolic}</div>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${diastolicStatus.textColor} ${diastolicStatus.bgColor}`}>
                            {diastolicStatus.indicator}
                            mmHg
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="text-lg font-semibold text-slate-900">{reading.pulse}</div>
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-pink-50 text-pink-700">
                            <HeartIcon className="w-3 h-3 animate-heartbeat" />
                            BPM
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            overallLevel === 'critical' ? 'bg-red-100 text-red-700' :
                            overallLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                            overallLevel === 'elevated' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {overallLevel === 'critical' ? '🚨' : 
                             overallLevel === 'high' ? '⚠️' : 
                             overallLevel === 'elevated' ? '📈' : '✅'}
                            {overallLevel === 'normal' ? 'Optimal' : overallLevel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile List */}
              <div className="sm:hidden divide-y divide-slate-200">
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
                    <div key={reading.id} className="p-4 hover:bg-slate-50 transition-colors duration-200">
                      {/* Date & Status Row */}
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {new Date(reading.date).toLocaleDateString(dateLocale, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(reading.date).toLocaleTimeString(dateLocale, { 
                              hour: 'numeric', 
                              minute: '2-digit', 
                              hour12: true 
                            })}
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          overallLevel === 'critical' ? 'bg-red-100 text-red-700' :
                          overallLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                          overallLevel === 'elevated' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {overallLevel === 'critical' ? '🚨' : 
                           overallLevel === 'high' ? '⚠️' : 
                           overallLevel === 'elevated' ? '📈' : '✅'}
                          {overallLevel === 'normal' ? 'Optimal' : overallLevel}
                        </span>
                      </div>
                      
                      {/* Readings Row */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">SYSTOLIC</div>
                          <div className="text-lg font-semibold text-slate-900">{reading.systolic}</div>
                          <div className={`inline-flex items-center gap-1 px-1 py-0.5 rounded text-xs ${systolicStatus.textColor} ${systolicStatus.bgColor}`}>
                            {systolicStatus.indicator}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">DIASTOLIC</div>
                          <div className="text-lg font-semibold text-slate-900">{reading.diastolic}</div>
                          <div className={`inline-flex items-center gap-1 px-1 py-0.5 rounded text-xs ${diastolicStatus.textColor} ${diastolicStatus.bgColor}`}>
                            {diastolicStatus.indicator}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">PULSE</div>
                          <div className="text-lg font-semibold text-slate-900">{reading.pulse}</div>
                          <div className="inline-flex items-center gap-1 px-1 py-0.5 rounded text-xs bg-pink-50 text-pink-700">
                            <HeartIcon className="w-2.5 h-2.5 animate-heartbeat" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
