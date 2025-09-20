

import React from 'react';
import type { HealthInsight } from '../types';
import { useLocalization } from '../context/LocalizationContext';

interface HealthInsightsProps {
  insights: HealthInsight[] | null;
  isLoading: boolean;
  style?: React.CSSProperties;
}

const LightbulbIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const InsightCategoryIcon: React.FC<{ category: HealthInsight['category'] }> = ({ category }) => {
    const iconClass = "w-5 h-5 mr-3 flex-shrink-0";
    switch (category) {
        case 'Diet':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-emerald-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
        case 'Exercise':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-sky-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
        case 'Stress Management':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-purple-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
        default: // General
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-slate-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
};

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="flex items-start">
            <div className="w-5 h-5 mr-3 rounded-full bg-slate-200 flex-shrink-0"></div>
            <div className="space-y-2 flex-grow">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
        </div>
        <div className="flex items-start">
            <div className="w-5 h-5 mr-3 rounded-full bg-slate-200 flex-shrink-0"></div>
            <div className="space-y-2 flex-grow">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-4/6"></div>
            </div>
        </div>
    </div>
);

export const HealthInsights: React.FC<HealthInsightsProps> = ({ insights, isLoading, style }) => {
    const { t, translateEnum } = useLocalization();
    
    const renderContent = () => {
        if (isLoading) {
            return <LoadingSkeleton />;
        }

        if (!insights || insights.length === 0) {
            return (
                 <div className="text-center py-8 px-4 bg-slate-50/70 rounded-lg">
                    <p className="text-slate-500 text-sm font-medium">{t('insights.empty')}</p>
                </div>
            );
        }

        return (
            <ul className="space-y-3 animate-fadeInUp">
                {insights.map((insight, index) => (
                    <li key={index} className="flex items-start text-slate-600 p-3 bg-slate-50/80 rounded-lg">
                        <InsightCategoryIcon category={insight.category} />
                        <div>
                           <p className="font-bold text-slate-700 text-sm">{translateEnum(insight.category)}</p>
                           <p className="text-sm">{insight.tip}</p>
                        </div>
                    </li>
                ))}
            </ul>
        );
    }
    
    return (
        <div className="bg-[var(--c-surface)] p-6 rounded-2xl shadow-lg shadow-indigo-100/50 animate-fadeInUp" style={style}>
            <div className="flex items-center space-x-2 mb-4">
                <LightbulbIcon className="w-7 h-7 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500" />
                <h2 className="text-2xl font-bold text-[var(--c-text-primary)]">{t('insights.title')}</h2>
            </div>
            {renderContent()}
        </div>
    );
};
