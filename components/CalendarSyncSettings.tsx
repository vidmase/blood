import React, { useState, useEffect } from 'react';
import type { GoogleCalendarSync, BloodPressureReading } from '../types';

interface CalendarSyncSettingsProps {
  readings: BloodPressureReading[];
  currentSync?: GoogleCalendarSync;
  onSyncUpdate: (config: GoogleCalendarSync) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const CalendarSyncSettings: React.FC<CalendarSyncSettingsProps> = ({
  readings,
  currentSync,
  onSyncUpdate,
  onSuccess,
  onError,
}) => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'connecting' | 'syncing'>('idle');
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [calendars, setCalendars] = useState<Array<{ id: string; summary: string; primary?: boolean }>>([]);
  const [serviceReady, setServiceReady] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('CalendarSyncSettings - currentSync:', currentSync);
    console.log('CalendarSyncSettings - has accessToken:', !!currentSync?.accessToken);
  }, [currentSync]);

  // Load calendars when connected
  useEffect(() => {
    const loadCalendars = async () => {
      if (currentSync?.accessToken && calendars.length === 0) {
        try {
          const { googleCalendarSyncService } = await import('../services/googleCalendarSyncService');
          const calendarList = await googleCalendarSyncService.listCalendars(currentSync);
          setCalendars(calendarList);
          setServiceReady(true);
        } catch (err) {
          console.error('Failed to load calendars:', err);
        }
      }
    };
    loadCalendars();
  }, [currentSync?.accessToken, calendars.length]);

  const handleConnect = async () => {
    try {
      setSyncStatus('connecting');
      // Clear any existing OAuth state before starting new flow
      sessionStorage.removeItem('oauth_state');
      localStorage.removeItem('oauth_state');
      
      const { googleCalendarSyncService } = await import('../services/googleCalendarSyncService');
      googleCalendarSyncService.initiateOAuth();
    } catch (err: any) {
      onError(err.message || 'Failed to connect to Google Calendar');
      setSyncStatus('idle');
    }
  };

  const handleSelectCalendar = (calendarId: string) => {
    const updatedSync: GoogleCalendarSync = {
      ...(currentSync || { enabled: false }),
      calendarId,
    };
    onSyncUpdate(updatedSync);
  };

  const handleToggleAutoSync = () => {
    if (!currentSync) return;
    const updatedSync: GoogleCalendarSync = {
      ...currentSync,
      autoSync: !currentSync.autoSync,
    };
    onSyncUpdate(updatedSync);
  };

  const handleSyncNow = async () => {
    if (!currentSync?.accessToken) {
      onError('Please connect to Google Calendar first');
      return;
    }

    setSyncStatus('syncing');
    
    try {
      const { googleCalendarSyncService } = await import('../services/googleCalendarSyncService');
      
      const updatedConfig = await googleCalendarSyncService.syncReadings(
        readings,
        currentSync,
        (current: number, total: number) => {
          setSyncProgress({ current, total });
        }
      );
      
      onSyncUpdate(updatedConfig);
      setSyncStatus('idle');
      onSuccess(`Successfully synced ${syncProgress.current} reading(s) to Google Calendar!`);
    } catch (err: any) {
      onError(err.message || 'Failed to sync readings');
      setSyncStatus('idle');
    }
  };

  const handleDisconnect = async () => {
    if (!currentSync) return;
    
    try {
      const { googleCalendarSyncService } = await import('../services/googleCalendarSyncService');
      await googleCalendarSyncService.disconnect(currentSync);
      
      const updatedSettings: GoogleCalendarSync = {
        enabled: false,
        autoSync: false,
      };
      
      onSyncUpdate(updatedSettings);
      setCalendars([]);
      onSuccess('Disconnected from Google Calendar');
    } catch (err: any) {
      onError(err.message || 'Failed to disconnect from Google Calendar');
    }
  };

  const handleTestConnection = async () => {
    if (!currentSync?.accessToken) {
      onError('Please connect to Google Calendar first');
      return;
    }
    
    try {
      const { googleCalendarSyncService } = await import('../services/googleCalendarSyncService');
      const isConnected = await googleCalendarSyncService.testConnection(currentSync);
      if (isConnected) {
        onSuccess('Connection test successful!');
      } else {
        onError('Connection test failed. Please reconnect.');
      }
    } catch (err: any) {
      onError(err.message || 'Connection test failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Google Calendar Sync</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Automatically sync your blood pressure readings to Google Calendar
        </p>
      </div>

      {(!currentSync || !currentSync.accessToken) ? (
        /* Not Connected State */
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Connect Your Calendar</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                  Sync your blood pressure readings to Google Calendar and view them alongside your daily schedule.
                </p>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Automatic synchronization of new readings
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Color-coded events by health status
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    View patterns alongside your daily activities
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleConnect}
            disabled={syncStatus === 'connecting'}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all shadow-lg"
          >
            {syncStatus === 'connecting' ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Connect with Google Calendar</span>
              </>
            )}
          </button>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-semibold mb-1">Setup Required</p>
                <p>Configure OAuth credentials in .env.local. See GOOGLE_CALENDAR_SYNC_SETUP.md for instructions.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Connected State */
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-green-900 dark:text-green-100">Connected</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {currentSync.lastSyncedAt 
                      ? `Last synced: ${new Date(currentSync.lastSyncedAt).toLocaleString()}`
                      : 'Ready to sync'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleTestConnection}
                className="px-4 py-2 text-sm bg-white dark:bg-slate-700 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-slate-600 transition-colors"
              >
                Test Connection
              </button>
            </div>
          </div>

          {calendars.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select Calendar
              </label>
              <select
                value={currentSync.calendarId || 'primary'}
                onChange={(e) => handleSelectCalendar(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {calendars.map((calendar) => (
                  <option key={calendar.id} value={calendar.id}>
                    {calendar.summary} {calendar.primary ? '(Primary)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 dark:text-white">Automatic Sync</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Sync new readings when added</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentSync.autoSync || false}
                onChange={handleToggleAutoSync}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Readings</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{readings.length}</div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Synced</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {currentSync.syncedReadingIds?.length || 0}
              </div>
            </div>
          </div>

          {syncStatus === 'syncing' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  Syncing... {syncProgress.current} / {syncProgress.total}
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${syncProgress.total > 0 ? (syncProgress.current / syncProgress.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleSyncNow}
              disabled={syncStatus === 'syncing'}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
            </button>
            <button
              onClick={handleDisconnect}
              className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

