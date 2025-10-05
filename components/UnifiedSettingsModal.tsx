import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserSettings } from '../context/UserSettingsContext';
import { useLocalization, languages } from '../context/LocalizationContext';
import type { UserProfile, AppSettings, BloodPressureReading } from '../types';

// Lazy load the Calendar Sync component
const CalendarSyncSettings = lazy(() => import('./CalendarSyncSettings').then(m => ({ default: m.CalendarSyncSettings })));

interface UnifiedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile, settings: AppSettings) => void;
  onClearData: () => void;
  currentProfile: UserProfile;
  currentSettings: AppSettings;
  readings?: BloodPressureReading[];
}

type TabType = 'profile' | 'account' | 'preferences' | 'targets' | 'sync' | 'data';

export const UnifiedSettingsModal: React.FC<UnifiedSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onClearData,
  currentProfile,
  currentSettings,
  readings = [],
}) => {
  const { t, language, setLanguage } = useLocalization();
  const { user, signOut, updateProfile, loading } = useAuth();
  const { targets, updateTargets, resetToDefaults, loading: targetsLoading } = useUserSettings();
  
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [profile, setProfile] = useState<UserProfile>(currentProfile);
  const [settings, setSettings] = useState<AppSettings>(currentSettings);
  
  // Account editing states
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Target editing states
  const [targetData, setTargetData] = useState({
    systolic: targets.systolic,
    diastolic: targets.diastolic,
    pulse: targets.pulse,
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProfile(currentProfile);
      
      // Sync settings goals with targets (targets are the source of truth)
      const syncedSettings = {
        ...currentSettings,
        goals: {
          systolic: targets.systolic,
          diastolic: targets.diastolic,
        },
      };
      setSettings(syncedSettings);
      
      setFormData({
        fullName: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        newPassword: '',
        confirmPassword: '',
      });
      setTargetData({
        systolic: targets.systolic,
        diastolic: targets.diastolic,
        pulse: targets.pulse,
      });
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, currentProfile, currentSettings, user, targets]);

  if (!isOpen) return null;

  const tabs: Array<{ id: TabType; label: string; icon: JSX.Element }> = [
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'account',
      label: 'Account',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'targets',
      label: 'Health Targets',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'sync',
      label: 'Calendar Sync',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'data',
      label: 'Data',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
    },
  ];

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.id]: e.target.value });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' });
  };

  const handleGoalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      goals: {
        ...settings.goals,
        [e.target.id]: parseInt(e.target.value, 10) || 0,
      },
    });
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setTargetData({
      ...targetData,
      [e.target.name]: value,
    });
  };

  const handleSaveProfile = () => {
    onSave(profile, settings);
    setSuccess('Profile settings saved successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate passwords if changing
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
    }

    setUpdateLoading(true);
    try {
      const updates: any = {};

      if (formData.fullName !== (user?.user_metadata?.full_name || '')) {
        updates.full_name = formData.fullName;
      }

      if (formData.email !== user?.email) {
        updates.email = formData.email;
      }

      if (formData.newPassword) {
        updates.password = formData.newPassword;
      }

      await updateProfile(updates);
      setSuccess('Account updated successfully!');
      setFormData({
        ...formData,
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update account');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSaveTargets = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Update targets in UserSettings context
      await updateTargets(targetData);
      
      // Also update app settings goals to keep them in sync
      const updatedSettings = {
        ...settings,
        goals: {
          systolic: targetData.systolic,
          diastolic: targetData.diastolic,
        },
      };
      setSettings(updatedSettings);
      onSave(profile, updatedSettings);
      
      setSuccess('Target values updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update target values');
    }
  };

  const handleResetTargets = async () => {
    try {
      await resetToDefaults();
      const defaultTargets = {
        systolic: 120,
        diastolic: 80,
        pulse: 70,
      };
      setTargetData(defaultTargets);
      
      // Also update app settings goals to keep them in sync
      const updatedSettings = {
        ...settings,
        goals: {
          systolic: defaultTargets.systolic,
          diastolic: defaultTargets.diastolic,
        },
      };
      setSettings(updatedSettings);
      onSave(profile, updatedSettings);
      
      setSuccess('Target values reset to defaults!');
    } catch (err: any) {
      setError(err.message || 'Failed to reset target values');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Settings</h2>
              <p className="text-xs sm:text-sm text-white/80">Manage your account and preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Alerts */}
        {(error || success) && (
          <div className="px-4 sm:px-6 pt-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm flex-1">{error}</p>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-700 text-sm flex-1">{success}</p>
                <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-16 sm:w-20 lg:w-56 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
            <nav className="p-2 sm:p-3 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setError(null);
                    setSuccess(null);
                  }}
                  className={`w-full flex flex-col lg:flex-row items-center lg:gap-3 p-2 sm:p-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.icon}
                  <span className="text-xs lg:text-sm font-medium mt-1 lg:mt-0 text-center lg:text-left">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t('settings.profile.name')}
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={profile.name}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="dob" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t('settings.profile.dob')}
                      </label>
                      <input
                        type="date"
                        id="dob"
                        value={profile.dob}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Account Settings</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Manage your authentication details</p>
                </div>

                <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {user?.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                    Account created: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>

                <form onSubmit={handleUpdateAccount} className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Change Password</h4>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          New Password
                        </label>
                        <input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Enter new password (optional)"
                        />
                      </div>

                      {formData.newPassword && (
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Confirm new password"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="flex-1 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all shadow-lg"
                    >
                      {updateLoading ? 'Updating...' : 'Update Account'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('settings.appearance.title')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Customize how the app looks and feels</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t('settings.appearance.theme')}
                    </label>
                    <select
                      id="theme"
                      value={settings.theme}
                      onChange={handleThemeChange}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="light">{t('settings.appearance.theme.light')}</option>
                      <option value="dark">{t('settings.appearance.theme.dark')}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t('settings.appearance.language')}
                    </label>
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as 'en' | 'lt')}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {languages.map(({ code, name }) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-lg"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Targets Tab */}
            {activeTab === 'targets' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Health Target Values</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Set your target blood pressure and pulse values</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Systolic</div>
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">{targets.systolic}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">mmHg</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Diastolic</div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{targets.diastolic}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">mmHg</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Pulse</div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{targets.pulse}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">bpm</div>
                  </div>
                </div>

                <form onSubmit={handleSaveTargets} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="systolic-target" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Systolic Target
                      </label>
                      <input
                        id="systolic-target"
                        name="systolic"
                        type="number"
                        min="80"
                        max="200"
                        value={targetData.systolic}
                        onChange={handleTargetChange}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="120"
                      />
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">80-200 mmHg</div>
                    </div>
                    <div>
                      <label htmlFor="diastolic-target" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Diastolic Target
                      </label>
                      <input
                        id="diastolic-target"
                        name="diastolic"
                        type="number"
                        min="50"
                        max="120"
                        value={targetData.diastolic}
                        onChange={handleTargetChange}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="80"
                      />
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">50-120 mmHg</div>
                    </div>
                    <div>
                      <label htmlFor="pulse-target" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Pulse Target
                      </label>
                      <input
                        id="pulse-target"
                        name="pulse"
                        type="number"
                        min="40"
                        max="120"
                        value={targetData.pulse}
                        onChange={handleTargetChange}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="70"
                      />
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">40-120 bpm</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      type="submit"
                      disabled={targetsLoading}
                      className="flex-1 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all shadow-lg"
                    >
                      {targetsLoading ? 'Saving...' : 'Save Targets'}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetTargets}
                      className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all"
                    >
                      Reset to Defaults
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Calendar Sync Tab */}
            {activeTab === 'sync' && (
              <Suspense 
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                  </div>
                }
              >
                <CalendarSyncSettings
                  readings={readings}
                  currentSync={settings.googleCalendarSync}
                  onSyncUpdate={(config) => {
                    const updatedSettings = { ...settings, googleCalendarSync: config };
                    setSettings(updatedSettings);
                    onSave(profile, updatedSettings);
                  }}
                  onSuccess={(message) => setSuccess(message)}
                  onError={(message) => setError(message)}
                />
              </Suspense>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('settings.data.title')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Manage your data and storage</p>
                </div>

                <div className="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Danger Zone</h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                        {t('settings.data.clearDescription')}
                      </p>
                      <button
                        onClick={onClearData}
                        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-lg"
                      >
                        {t('settings.data.clearButton')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

