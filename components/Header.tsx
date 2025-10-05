
import React from 'react';
import { useLocalization } from '../context/LocalizationContext';
import { useAuth } from '../context/AuthContext';
import { MiniGauges } from './MiniGauges';
import type { BloodPressureReading } from '../types';

const HeartbeatIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-9 w-9 text-rose-500 animate-pulse-heart"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ animationDuration: '2.5s' }}
  >
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    />
  </svg>
);

// Mobile-optimized mini gauge
const MobileGauge: React.FC<{
  value: number;
  label: string;
  color: string;
  max: number;
}> = ({ value, label, color, max }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 12;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-12 h-12 sm:w-14 sm:h-14">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="12" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
          <circle
            cx="16"
            cy="16"
            r="12"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs sm:text-sm font-bold text-slate-800">{value}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-slate-600 mt-1">{label}</span>
    </div>
  );
};

interface HeaderProps {
    userName?: string;
    onOpenSettings: () => void;
    onAnalyze?: () => void;
    isAnalyzing?: boolean;
    canAnalyze?: boolean;
    onGenerateInsights?: () => void;
    isFetchingInsights?: boolean;
    insightsAvailable?: boolean;
    readings?: BloodPressureReading[];
}

export const Header: React.FC<HeaderProps> = ({ userName, onOpenSettings, onAnalyze, isAnalyzing = false, canAnalyze = true, onGenerateInsights, isFetchingInsights = false, insightsAvailable = false, readings = [] }) => {
  const { t } = useLocalization();
  const { user } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email || userName || 'User';

  return (
    <header className="bg-[var(--c-surface)] shadow-md shadow-slate-200/50 dark:shadow-black/20 sticky top-0 z-10 backdrop-blur-lg animate-fadeInUp">
        <div className="container mx-auto px-3 sm:px-4 md:px-8 xl:px-12 2xl:px-16 py-3 sm:py-4 xl:py-6">
          {/* Mobile Layout (< 1024px) */}
          <div className="lg:hidden">
            {/* Top Row - Title and Actions */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="scale-90 sm:scale-100">
                  <HeartbeatIcon />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--c-primary)] to-[var(--c-secondary)]">
                  {t('header.title')}
                </h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenSettings}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-all duration-200 shadow-md"
                  aria-label="Settings"
                  title="Settings"
                >
                  {user && (
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-white/20 text-xs font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Bottom Row - Mobile Mini Gauges and Last Reading Time */}
            {readings.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-3 sm:gap-4 px-2 py-2 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-xl border border-slate-200/60">
                  <MobileGauge value={readings[0].systolic} label="SYS" color="#ef4444" max={200} />
                  <div className="text-lg font-bold text-slate-300">/</div>
                  <MobileGauge value={readings[0].diastolic} label="DIA" color="#3b82f6" max={120} />
                  <div className="w-px h-8 bg-slate-200"></div>
                  <MobileGauge value={readings[0].pulse} label="HR" color="#10b981" max={120} />
                  <div className="w-px h-8 bg-slate-200"></div>
                  {/* Last Reading Time */}
                  <div className="flex flex-col items-center">
                    <div className="text-xs font-bold text-slate-800">
                      {new Date(readings[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs font-semibold text-slate-600 mt-0.5">
                      {new Date(readings[0].date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Layout (≥ 1024px) */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center space-x-3 xl:space-x-4">
              <div className="xl:scale-110 2xl:scale-125">
                <HeartbeatIcon />
              </div>
              <h1 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--c-primary)] to-[var(--c-secondary)]">
                {t('header.title')}
              </h1>
            </div>
            
            {/* Mini Gauges - Center */}
            <div className="flex-1 flex justify-center">
              <MiniGauges readings={readings} />
            </div>
            
            <div className="flex items-center space-x-3 xl:space-x-6">
              {/* Settings Button */}
              {user && (
                <div className="flex items-center space-x-3 xl:space-x-4">
                  <span className="text-sm xl:text-base font-medium text-[var(--c-text-secondary)] hidden xl:block">
                    Welcome, <span className="font-semibold text-[var(--c-text-primary)]">{displayName}</span>
                  </span>
                  <button
                    onClick={onOpenSettings}
                    className="flex items-center gap-2 xl:gap-3 px-4 xl:px-5 py-2 xl:py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm xl:text-base font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    aria-label="Settings"
                    title="Settings"
                  >
                    <div className="flex items-center justify-center h-7 w-7 xl:h-8 xl:w-8 rounded-full bg-white/20 text-sm xl:text-base font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline">Settings</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 xl:h-6 xl:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
  );
};
