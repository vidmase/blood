import React, { useState, useMemo } from 'react';
import type { BloodPressureReading } from '../types';
import { googleCalendarService } from '../services/googleCalendarService';

interface GoogleCalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  readings: BloodPressureReading[];
  currentMonth?: Date;
}

export const GoogleCalendarExportModal: React.FC<GoogleCalendarExportModalProps> = ({
  isOpen,
  onClose,
  readings,
  currentMonth = new Date(),
}) => {
  const [exportRange, setExportRange] = useState<'all' | 'month' | 'custom'>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Filter readings based on selected range
  const filteredReadings = useMemo(() => {
    if (exportRange === 'all') {
      return readings;
    }
    
    if (exportRange === 'month') {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      return readings.filter(reading => {
        const readingDate = new Date(reading.date);
        return readingDate.getFullYear() === year && readingDate.getMonth() === month;
      });
    }
    
    if (exportRange === 'custom' && startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      return readings.filter(reading => {
        const readingTime = new Date(reading.date).getTime();
        return readingTime >= start && readingTime <= end;
      });
    }
    
    return readings;
  }, [exportRange, readings, currentMonth, startDate, endDate]);

  const handleExport = async () => {
    if (filteredReadings.length === 0) {
      alert('No readings to export in the selected date range.');
      return;
    }

    setIsExporting(true);
    try {
      const result = googleCalendarService.exportMultipleToGoogleCalendar(filteredReadings);
      setShowInstructions(true);
      
      // Auto-hide instructions after 10 seconds
      setTimeout(() => {
        setShowInstructions(false);
      }, 10000);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export readings. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  const instructions = googleCalendarService.getImportInstructions();

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Export to Google Calendar</h2>
              <p className="text-sm text-white/80">Download readings as calendar events</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Export Range Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Select Date Range</h3>
              
              <div className="space-y-3">
                {/* All Readings */}
                <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="exportRange"
                    value="all"
                    checked={exportRange === 'all'}
                    onChange={(e) => setExportRange(e.target.value as 'all')}
                    className="w-5 h-5 text-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">All Readings</div>
                    <div className="text-sm text-slate-600">{readings.length} total readings</div>
                  </div>
                </label>

                {/* Current Month */}
                <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="exportRange"
                    value="month"
                    checked={exportRange === 'month'}
                    onChange={(e) => setExportRange(e.target.value as 'month')}
                    className="w-5 h-5 text-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">Current Month</div>
                    <div className="text-sm text-slate-600">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - {
                        readings.filter(r => {
                          const d = new Date(r.date);
                          return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
                        }).length
                      } readings
                    </div>
                  </div>
                </label>

                {/* Custom Range */}
                <label className="flex items-start gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="exportRange"
                    value="custom"
                    checked={exportRange === 'custom'}
                    onChange={(e) => setExportRange(e.target.value as 'custom')}
                    className="w-5 h-5 text-indigo-600 mt-0.5"
                  />
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="font-semibold text-slate-900">Custom Range</div>
                      <div className="text-sm text-slate-600">Select specific dates</div>
                    </div>
                    
                    {exportRange === 'custom' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-indigo-900">
                    {filteredReadings.length} reading{filteredReadings.length !== 1 ? 's' : ''} selected
                  </div>
                  <div className="text-sm text-indigo-700">Ready to export to Google Calendar</div>
                </div>
              </div>
            </div>

            {/* Instructions (shown after export) */}
            {showInstructions && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 animate-fadeIn">
                <div className="flex items-start gap-3 mb-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-2">Import Instructions</h4>
                    <ol className="space-y-1 text-sm text-blue-800">
                      {instructions.map((instruction, index) => (
                        <li key={index} className="leading-relaxed">{instruction}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Feature Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What you'll get:
              </h4>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• Each reading becomes a calendar event</li>
                <li>• Color-coded by status (Optimal, High, Critical, etc.)</li>
                <li>• Includes BP values, pulse, and notes</li>
                <li>• Events show exact date and time of reading</li>
                <li>• Easy to view alongside other calendar items</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || filteredReadings.length === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Calendar File</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

