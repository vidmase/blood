
import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from './auth/UserProfile';

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
}

export const Header: React.FC<HeaderProps> = ({ userName, onOpenSettings, onAnalyze, isAnalyzing = false, canAnalyze = true, onGenerateInsights, isFetchingInsights = false, insightsAvailable = false }) => {
  const { t } = useLocalization();
  const { user } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.email || userName || 'User';

  return (
    <>
      <header className="bg-[var(--c-surface)] shadow-md shadow-slate-200/50 dark:shadow-black/20 sticky top-0 z-10 backdrop-blur-lg animate-fadeInUp">
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HeartbeatIcon />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--c-primary)] to-[var(--c-secondary)]">
              {t('header.title')}
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* AI Analysis Button */}
            {typeof onAnalyze === 'function' && (
              <button
                onClick={onAnalyze}
                disabled={!canAnalyze || isAnalyzing}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--c-border)] text-[var(--c-text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Run AI Analysis"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isAnalyzing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m13.364 5.364l-2.121-2.121M8.757 8.757 6.636 6.636m10.728 0-2.121 2.121M8.757 15.243l-2.121 2.121" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-medium">AI Analysis</span>
              </button>
            )}

            {/* Health Insights Button */}
            {typeof onGenerateInsights === 'function' && (
              <button
                onClick={onGenerateInsights}
                disabled={isFetchingInsights}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--c-border)] text-[var(--c-text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={insightsAvailable ? 'Refresh Insights' : 'Generate Insights'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isFetchingInsights ? 'animate-pulse' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a7 7 0 00-7 7c0 2.577 1.5 4.5 3 6 1 1 2 2 2 3v2h4v-2c0-1 1-2 2-3 1.5-1.5 3-3.423 3-6a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-medium">{insightsAvailable ? 'Insights' : 'Get Insights'}</span>
              </button>
            )}
            {user && (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-[var(--c-text-secondary)] hidden sm:block">
                  Welcome, {displayName}
                </span>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                  title="View Profile"
                >
                  {displayName.charAt(0).toUpperCase()}
                </button>
              </div>
            )}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-full text-[var(--c-text-secondary)] hover:bg-[var(--c-primary-light)] hover:text-[var(--c-primary)] transition-colors duration-200"
              aria-label={t('header.settingsAriaLabel')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
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
