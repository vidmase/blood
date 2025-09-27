
import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from './auth/UserProfile';
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
  const [showProfileModal, setShowProfileModal] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.email || userName || 'User';

  return (
    <>
      <header className="bg-[var(--c-surface)] shadow-md shadow-slate-200/50 dark:shadow-black/20 sticky top-0 z-10 backdrop-blur-lg animate-fadeInUp">
        <div className="container mx-auto px-4 md:px-8 xl:px-12 2xl:px-16 py-4 xl:py-6 flex items-center justify-between">
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
            {/* User Profile and Settings */}
            <div className="flex items-center space-x-3 xl:space-x-4">
              {user && (
                <div className="flex items-center space-x-3 xl:space-x-4">
                  <span className="text-sm xl:text-base font-medium text-[var(--c-text-secondary)] hidden lg:block">
                    Welcome, <span className="font-semibold text-[var(--c-text-primary)]">{displayName}</span>
                  </span>
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center justify-center h-10 w-10 xl:h-12 xl:w-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm xl:text-base font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    title="View Profile"
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </button>
                </div>
              )}
              <button
                onClick={onOpenSettings}
                className="p-2.5 xl:p-3 rounded-full text-[var(--c-text-secondary)] hover:bg-[var(--c-primary-light)] hover:text-[var(--c-primary)] transition-all duration-300 hover:shadow-lg"
                aria-label={t('header.settingsAriaLabel')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 xl:h-7 xl:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="relative">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 z-10"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <UserProfile />
          </div>
        </div>
      )}
    </>
  );
};
