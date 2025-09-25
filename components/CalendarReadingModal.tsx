import React from 'react';
import type { BloodPressureReading } from '../types';
import { useLocalization } from '../context/LocalizationContext';

interface CalendarReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  readings: BloodPressureReading[];
}

const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const HeartIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const getStatusInfo = (systolic: number, diastolic: number) => {
  if (systolic >= 140 || diastolic >= 90) {
    return { level: 'Critical', color: 'text-red-700 bg-red-100', emoji: '🚨' };
  }
  if (systolic >= 130 || diastolic >= 85) {
    return { level: 'High', color: 'text-orange-700 bg-orange-100', emoji: '⚠️' };
  }
  if (systolic > 120 || diastolic > 80) {
    return { level: 'Elevated', color: 'text-amber-700 bg-amber-100', emoji: '📈' };
  }
  if (systolic < 90 || diastolic < 60) {
    return { level: 'Low', color: 'text-blue-700 bg-blue-100', emoji: '💙' };
  }
  return { level: 'Optimal', color: 'text-emerald-700 bg-emerald-100', emoji: '✅' };
};

export const CalendarReadingModal: React.FC<CalendarReadingModalProps> = ({
  isOpen,
  onClose,
  date,
  readings
}) => {
  const { t, language } = useLocalization();
  const dateLocale = language === 'lt' ? 'lt-LT' : 'en-US';

  if (!isOpen || !date) return null;

  const sortedReadings = [...readings].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {date.toLocaleDateString(dateLocale, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <p className="text-sm text-slate-600">
              {readings.length} {readings.length === 1 ? 'reading' : 'readings'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors duration-200"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Readings List */}
        <div className="overflow-y-auto max-h-[60vh]">
          {sortedReadings.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No readings found for this date.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {sortedReadings.map((reading, index) => {
                const status = getStatusInfo(reading.systolic, reading.diastolic);
                
                return (
                  <div key={reading.id} className="p-6 hover:bg-slate-50 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-slate-900">
                        {new Date(reading.date).toLocaleTimeString(dateLocale, {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <span>{status.emoji}</span>
                        {status.level}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6">
                      {/* Systolic */}
                      <div className="text-center">
                        <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Systolic</div>
                        <div className="text-2xl font-bold text-slate-900 mb-1">{reading.systolic}</div>
                        <div className="text-xs text-slate-500">mmHg</div>
                      </div>
                      
                      {/* Diastolic */}
                      <div className="text-center">
                        <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Diastolic</div>
                        <div className="text-2xl font-bold text-slate-900 mb-1">{reading.diastolic}</div>
                        <div className="text-xs text-slate-500">mmHg</div>
                      </div>
                      
                      {/* Pulse */}
                      <div className="text-center">
                        <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Pulse</div>
                        <div className="text-2xl font-bold text-slate-900 mb-1">{reading.pulse}</div>
                        <div className="flex items-center justify-center gap-1 text-xs text-pink-600">
                          <HeartIcon className="w-3 h-3 animate-heartbeat" />
                          BPM
                        </div>
                      </div>
                    </div>
                    
                    {/* Notes */}
                    {reading.notes && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Notes</div>
                        <p className="text-sm text-slate-700">{reading.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
