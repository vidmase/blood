

import React from 'react';
import type { AnalysisData, TrendComparison } from '../types';
import { useLocalization } from '../context/LocalizationContext';

interface AnalysisSummaryProps {
  analysisData: AnalysisData | null;
  isLoading: boolean;
  onRegenerate: () => void;
  hasEnoughReadings: boolean;
  style?: React.CSSProperties;
}

const WandIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const ArrowUpIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
);
const ArrowDownIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
);
const MinusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
);


const TrendIcon: React.FC<{ trend: AnalysisData['overallTrend']['trend'] }> = ({ trend }) => {
    const iconClass = "w-6 h-6 mr-3";
    switch (trend) {
        case 'Increasing':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-red-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>;
        case 'Decreasing':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-green-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l-5-5m0 0l5-5m-5 5h12" /></svg>;
        case 'Stable':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
        case 'Fluctuating':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-yellow-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
        default:
            return null;
    }
};

const ObservationIcon: React.FC<{ type: AnalysisData['observations'][0]['type'] }> = ({ type }) => {
    const iconClass = "w-5 h-5 mr-3 flex-shrink-0";
     switch (type) {
        case 'High Systolic':
        case 'High Diastolic':
             return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-red-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
        case 'Low Systolic':
        case 'Low Diastolic':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'Pulse Rate':
             return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-pink-500`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>;
        case 'Goal Achievement':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-green-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        default:
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-slate-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" /></svg>;
    }
};

const TrendDetail: React.FC<{ label: string; comparison: TrendComparison }> = ({ label, comparison }) => {
    const isUp = comparison.direction === 'up';
    const isDown = comparison.direction === 'down';
    const colorClasses = isUp ? 'text-red-500' : isDown ? 'text-green-500' : 'text-slate-500';

    return (
        <div className="bg-slate-50/70 dark:bg-gray-700/50 p-3 rounded-lg flex-1">
            <p className="text-xs text-[var(--c-text-secondary)] font-semibold">{label}</p>
            <div className="flex items-center mt-1">
                {isUp && <ArrowUpIcon className={`w-4 h-4 mr-1.5 ${colorClasses}`} />}
                {isDown && <ArrowDownIcon className={`w-4 h-4 mr-1.5 ${colorClasses}`} />}
                {!isUp && !isDown && <MinusIcon className={`w-4 h-4 mr-1.5 ${colorClasses}`} />}
                <p className={`text-lg font-bold ${colorClasses}`}>
                    {comparison.change > 0 ? `+${comparison.change.toFixed(1)}` : comparison.change.toFixed(1)}
                </p>
            </div>
            <p className="text-xs text-[var(--c-text-tertiary)] mt-1">{comparison.summary}</p>
        </div>
    );
};

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-5 bg-slate-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-slate-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-20 bg-slate-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-20 bg-slate-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        <div className="h-5 bg-slate-200 dark:bg-gray-700 rounded w-1/2 mt-6 mb-2"></div>
        <div className="h-12 bg-slate-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="space-y-3 pt-6">
             <div className="h-5 bg-slate-200 dark:bg-gray-700 rounded w-1/3"></div>
             <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-full"></div>
             <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
    </div>
);


export const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ analysisData, isLoading, onRegenerate, hasEnoughReadings, style }) => {
  const { t, translateEnum } = useLocalization();
  
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }
    
    if (!hasEnoughReadings) {
        return (
            <div className="text-center py-10 px-6 bg-slate-50/70 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-[var(--c-border)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="mt-4 text-[var(--c-text-secondary)] font-medium">{t('analysis.empty.notEnough')}</p>
            </div>
        );
    }

    if (!analysisData) {
      return <p className="text-[var(--c-text-secondary)] text-center py-4">{t('analysis.empty.noAnalysis')}</p>;
    }

    const { keyMetrics, overallTrend, historicalComparison, observations, encouragement } = analysisData;

    return (
      <div className="space-y-6 animate-fadeInUp">
        <div>
          <h3 className="text-sm font-semibold text-[var(--c-text-secondary)] mb-2">{t('analysis.keyMetrics')}</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
                <p className="text-xs font-bold text-red-700 dark:text-red-400">{t('analysis.systolic')}</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-200">{Math.round(keyMetrics.avgSystolic)}</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg">
                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{t('analysis.diastolic')}</p>
                <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">{Math.round(keyMetrics.avgDiastolic)}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-lg">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{t('analysis.pulse')}</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">{Math.round(keyMetrics.avgPulse)}</p>
            </div>
          </div>
        </div>

        <div>
            <h3 className="text-sm font-semibold text-[var(--c-text-secondary)] mb-2">{t('analysis.overallTrend')}</h3>
            <div className="bg-slate-50/70 dark:bg-gray-800/50 p-4 rounded-lg flex items-center">
                <TrendIcon trend={overallTrend.trend} />
                <div>
                    <p className="font-bold text-[var(--c-text-primary)]">{translateEnum(overallTrend.trend)}</p>
                    <p className="text-sm text-[var(--c-text-secondary)]">{overallTrend.summary}</p>
                </div>
            </div>
        </div>
        
        {historicalComparison && (
            <div>
                <h3 className="text-sm font-semibold text-[var(--c-text-secondary)] mb-2">{t('analysis.comparison')} <span className="font-normal text-[var(--c-text-tertiary)]">({historicalComparison.period})</span></h3>
                <div className="flex gap-3">
                    <TrendDetail label={t('analysis.systolic')} comparison={historicalComparison.systolic} />
                    <TrendDetail label={t('analysis.diastolic')} comparison={historicalComparison.diastolic} />
                    <TrendDetail label={t('analysis.pulse')} comparison={historicalComparison.pulse} />
                </div>
            </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-[var(--c-text-secondary)] mb-2">{t('analysis.observations')}</h3>
          <ul className="space-y-2">
            {observations.map((obs, index) => (
              <li key={index} className="flex items-start text-[var(--c-text-secondary)] text-sm p-3 bg-slate-50/70 dark:bg-gray-800/50 rounded-lg">
                <ObservationIcon type={obs.type} />
                <span>{obs.message}</span>
              </li>
            ))}
          </ul>
        </div>
        
         <p className="text-sm italic text-center text-[var(--c-text-tertiary)] pt-2">"{encouragement}"</p>

      </div>
    );
  };
  
  return (
    <div className="bg-[var(--c-surface)] p-6 rounded-2xl shadow-lg shadow-indigo-100/50 animate-fadeInUp" style={style}>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
                <WandIcon className="w-7 h-7 text-transparent bg-clip-text bg-gradient-to-r from-[var(--c-primary)] to-[var(--c-secondary)]" />
                <h2 className="text-2xl font-bold text-[var(--c-text-primary)]">{t('analysis.title')}</h2>
            </div>
            <button
                onClick={onRegenerate}
                disabled={isLoading || !hasEnoughReadings}
                className="p-2 rounded-full text-[var(--c-text-secondary)] hover:bg-[var(--c-primary-light)] hover:text-[var(--c-primary)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors duration-200"
                aria-label={t('analysis.regenerateAriaLabel')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 11M20 20l-1.5-1.5A9 9 0 013.5 13" />
                </svg>
            </button>
        </div>
        {renderContent()}
    </div>
  );
};
