
import React, { useState, useEffect } from 'react';
import type { UserProfile, AppSettings } from '../types';
import { useLocalization, languages } from '../context/LocalizationContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile, settings: AppSettings) => void;
  onClearData: () => void;
  currentProfile: UserProfile;
  currentSettings: AppSettings;
}

const InputField: React.FC<{
    label: string;
    id: string;
    type?: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}> = ({ label, id, type = 'text', value, onChange, className }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-sm font-medium text-[var(--c-text-secondary)] mb-1">
            {label}
        </label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--c-primary)] focus:border-[var(--c-primary)]"
        />
    </div>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, onClearData, currentProfile, currentSettings }) => {
  const { t, language, setLanguage } = useLocalization();
  const [profile, setProfile] = useState<UserProfile>(currentProfile);
  const [settings, setSettings] = useState<AppSettings>(currentSettings);

  useEffect(() => {
    if (isOpen) {
      setProfile(currentProfile);
      setSettings(currentSettings);
    }
  }, [isOpen, currentProfile, currentSettings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(profile, settings);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.id]: e.target.value });
  };
  
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' });
  };
  
  const handleGoalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ 
        ...settings, 
        goals: { 
            ...settings.goals, 
            [e.target.id]: parseInt(e.target.value, 10) || 0 
        } 
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center animate-fadeInUp" style={{animationDuration: '0.3s'}} onClick={onClose}>
      <div className="bg-[var(--c-surface)] rounded-2xl shadow-xl p-8 m-4 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--c-text-primary)]">{t('settings.title')}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--c-primary-light)]" aria-label={t('settings.closeAriaLabel')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--c-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        
        <div className="space-y-8">
            {/* Profile Section */}
            <section>
                <h3 className="text-lg font-semibold text-[var(--c-text-primary)] border-b border-[var(--c-border)] pb-2 mb-4">{t('settings.profile.title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label={t('settings.profile.name')} id="name" value={profile.name} onChange={handleProfileChange} />
                    <InputField label={t('settings.profile.dob')} id="dob" type="date" value={profile.dob} onChange={handleProfileChange} />
                </div>
            </section>
            
            {/* Appearance Section */}
            <section>
                <h3 className="text-lg font-semibold text-[var(--c-text-primary)] border-b border-[var(--c-border)] pb-2 mb-4">{t('settings.appearance.title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                         <label htmlFor="theme" className="block text-sm font-medium text-[var(--c-text-secondary)] mb-1">
                            {t('settings.appearance.theme')}
                        </label>
                        <select id="theme" value={settings.theme} onChange={handleThemeChange} className="w-full px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--c-primary)] focus:border-[var(--c-primary)]">
                            <option value="light">{t('settings.appearance.theme.light')}</option>
                            <option value="dark">{t('settings.appearance.theme.dark')}</option>
                        </select>
                    </div>
                     <div>
                         <label htmlFor="language" className="block text-sm font-medium text-[var(--c-text-secondary)] mb-1">
                            {t('settings.appearance.language')}
                        </label>
                        <select id="language" value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'lt')} className="w-full px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--c-primary)] focus:border-[var(--c-primary)]">
                            {languages.map(({ code, name }) => (
                                <option key={code} value={code}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            {/* Health Goals Section */}
            <section>
                <h3 className="text-lg font-semibold text-[var(--c-text-primary)] border-b border-[var(--c-border)] pb-2 mb-4">{t('settings.goals.title')}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label={t('settings.goals.systolic')} id="systolic" type="number" value={settings.goals.systolic} onChange={handleGoalsChange} />
                    <InputField label={t('settings.goals.diastolic')} id="diastolic" type="number" value={settings.goals.diastolic} onChange={handleGoalsChange} />
                </div>
            </section>

            {/* Data Management Section */}
            <section>
                <h3 className="text-lg font-semibold text-[var(--c-text-primary)] border-b border-[var(--c-border)] pb-2 mb-4">{t('settings.data.title')}</h3>
                <div>
                    <button onClick={onClearData} className="w-full sm:w-auto bg-red-100 text-red-700 font-bold py-2 px-4 rounded-lg border border-red-200 hover:bg-red-200 hover:border-red-300 transition-all">
                        {t('settings.data.clearButton')}
                    </button>
                     <p className="text-xs text-[var(--c-text-tertiary)] mt-2">{t('settings.data.clearDescription')}</p>
                </div>
            </section>
        </div>

        <div className="flex justify-end gap-3 mt-8 border-t border-[var(--c-border)] pt-6">
            <button
                onClick={onClose}
                className="bg-[var(--c-surface)] text-[var(--c-text-secondary)] font-bold py-2 px-5 rounded-lg border border-[var(--c-border)] hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
            >
                {t('common.cancel')}
            </button>
            <button
                onClick={handleSave}
                className="bg-gradient-to-r from-[var(--c-primary)] to-[var(--c-secondary)] text-white font-bold py-2 px-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--c-primary)] transition-all transform hover:-translate-y-0.5"
            >
                {t('common.save')}
            </button>
        </div>
      </div>
    </div>
  );
};
