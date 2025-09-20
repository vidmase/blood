
import React from 'react';
import { useLocalization } from '../context/LocalizationContext';

interface DateFilterProps {
  startDate: string;
  endDate: string;
  onFilterChange: (dates: { startDate: string; endDate: string }) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({ startDate, endDate, onFilterChange }) => {
  const { t } = useLocalization();
  
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
    <div className="mb-4 p-4 bg-slate-50/70 rounded-lg border border-slate-200/80">
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
  );
};
