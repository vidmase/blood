

import React, { useState, useEffect } from 'react';
import { useLocalization } from '../context/LocalizationContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: { includeAnalysis: boolean; includeInsights: boolean }) => void;
  analysisAvailable: boolean;
  insightsAvailable: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onConfirm, analysisAvailable, insightsAvailable }) => {
  const { t } = useLocalization();
  const [includeAnalysis, setIncludeAnalysis] = useState(true);
  const [includeInsights, setIncludeInsights] = useState(true);

  useEffect(() => {
    if (isOpen) {
        setIncludeAnalysis(analysisAvailable);
        setIncludeInsights(insightsAvailable);
    }
  }, [isOpen, analysisAvailable, insightsAvailable]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({ 
        includeAnalysis: analysisAvailable && includeAnalysis, 
        includeInsights: insightsAvailable && includeInsights 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center animate-fadeInUp" style={{animationDuration: '0.3s'}} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-8 m-4 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-[var(--c-text-primary)] mb-6">{t('export.modal.title')}</h2>
        
        <div className="space-y-4">
            <label className={`flex items-center p-4 rounded-lg bg-slate-50 border border-slate-200 transition-all ${analysisAvailable ? 'cursor-pointer hover:bg-slate-100' : 'opacity-60'}`}>
                <input 
                    type="checkbox" 
                    checked={includeAnalysis}
                    onChange={(e) => setIncludeAnalysis(e.target.checked)}
                    disabled={!analysisAvailable}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed"
                />
                <span className="ml-3 text-slate-700 font-medium select-none">
                    {t('export.modal.includeAnalysis')}
                    {!analysisAvailable && <span className="text-xs text-slate-400 block font-normal">{t('export.modal.notAvailable')}</span>}
                </span>
            </label>
            <label className={`flex items-center p-4 rounded-lg bg-slate-50 border border-slate-200 transition-all ${insightsAvailable ? 'cursor-pointer hover:bg-slate-100' : 'opacity-60'}`}>
                <input 
                    type="checkbox" 
                    checked={includeInsights}
                    onChange={(e) => setIncludeInsights(e.target.checked)}
                    disabled={!insightsAvailable}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed"
                />
                <span className="ml-3 text-slate-700 font-medium select-none">
                    {t('export.modal.includeInsights')}
                    {!insightsAvailable && <span className="text-xs text-slate-400 block font-normal">{t('export.modal.notAvailable')}</span>}
                </span>
            </label>
        </div>

        <div className="flex justify-end gap-3 mt-8">
            <button
                onClick={onClose}
                className="bg-white text-slate-600 font-bold py-2 px-5 rounded-lg border border-slate-300 hover:bg-slate-100 transition-all"
            >
                {t('common.cancel')}
            </button>
            <button
                onClick={handleConfirm}
                className="bg-gradient-to-r from-[var(--c-primary)] to-[var(--c-secondary)] text-white font-bold py-2 px-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5"
            >
                {t('export.button')}
            </button>
        </div>
      </div>
    </div>
  );
};
