
import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext';

interface DateFilterProps {
  startDate: string;
  endDate: string;
  onFilterChange: (dates: { startDate: string; endDate: string }) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({ startDate, endDate, onFilterChange }) => {
  const { t } = useLocalization();
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ startDate: e.target.value, endDate });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ startDate, endDate: e.target.value });
  };

  const handleReset = () => {
    onFilterChange({ startDate: '', endDate: '' });
  };
  
  const hasFilter = startDate || endDate;

  return (
    <div className="mb-4 bg-slate-50/70 rounded-lg border border-slate-200/80">
      {/* Header with toggle button */}
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {t('filter.title')}
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors duration-200"
          aria-label={t('filter.toggleAriaLabel')}
          aria-expanded={!isCollapsed}
        >
          <span>{isCollapsed ? t('filter.show') : t('filter.hide')}</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-3 w-3 transition-transform duration-200 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* Collapsible content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0' : 'max-h-96'}`}>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 mb-1">
                {t('filter.startDate')}
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={handleStartDateChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                aria-label={t('filter.startDateAriaLabel')}
              />
            </div>
            <div className="lg:col-span-2">
              <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 mb-1">
                {t('filter.endDate')}
              </label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={handleEndDateChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                aria-label={t('filter.endDateAriaLabel')}
              />
            </div>
            <div className="lg:col-span-1">
              <button
                onClick={handleReset}
                disabled={!hasFilter}
                className="w-full flex items-center justify-center bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-md hover:bg-slate-300 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all duration-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {t('filter.reset')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
