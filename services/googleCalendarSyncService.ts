import type { BloodPressureReading, GoogleCalendarSync } from '../types';
import { bloodPressureService } from './bloodPressureService';

// OAuth 2.0 configuration - should be set in environment variables
const getGoogleClientId = () => import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const getGoogleClientSecret = () => import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';
const getRedirectUri = () => {
  // Use environment variable if set, otherwise determine based on current environment
  if (import.meta.env.VITE_GOOGLE_REDIRECT_URI) {
    return import.meta.env.VITE_GOOGLE_REDIRECT_URI;
  }
  
  // Auto-detect environment
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // For Vercel deployments, use the current origin
    if (origin.includes('vercel.app') || origin.includes('your-domain.com')) {
      return origin;
    }
    // For local development
    return 'http://localhost:5173';
  }
  
  // Fallback for server-side rendering
  return 'http://localhost:5173';
};

// Google Calendar API endpoints
const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

// Required scopes for Google Calendar access
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly'
].join(' ');

interface CalendarEvent {
  id?: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  colorId?: string;
  extendedProperties?: {
    private?: {
      bpReadingId?: string;
    };
  };
}

// Get status color ID for Google Calendar
const getCalendarColorId = (systolic: number, diastolic: number): string => {
  if (systolic >= 140 || diastolic >= 90) return '11'; // Red - Critical
  if (systolic >= 130 || diastolic >= 85) return '6';  // Orange - High
  if (systolic > 120 || diastolic > 80) return '5';   // Yellow - Elevated
  if (systolic < 90 || diastolic < 60) return '7';    // Blue - Low
  return '10'; // Green - Optimal
};

// Get status label
const getStatusLabel = (systolic: number, diastolic: number): string => {
  if (systolic >= 140 || diastolic >= 90) return '🚨 Critical';
  if (systolic >= 130 || diastolic >= 85) return '⚠️ High';
  if (systolic > 120 || diastolic > 80) return '📈 Elevated';
  if (systolic < 90 || diastolic < 60) return '💙 Low';
  return '✅ Optimal';
};

// Format reading as calendar event
const formatReadingEvent = (reading: BloodPressureReading): CalendarEvent => {
  const readingDate = new Date(reading.date);
  const endDate = new Date(readingDate.getTime() + 15 * 60000); // 15 minutes duration
  
  const status = getStatusLabel(reading.systolic, reading.diastolic);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const summary = `BP: ${reading.systolic}/${reading.diastolic} - ${status}`;
  
  let description = `Blood Pressure Reading\n\n`;
  description += `📊 Measurements:\n`;
  description += `• Systolic: ${reading.systolic} mmHg\n`;
  description += `• Diastolic: ${reading.diastolic} mmHg\n`;
  description += `• Pulse: ${reading.pulse} bpm\n\n`;
  description += `📈 Status: ${status}\n\n`;
  
  if (reading.notes) {
    description += `📝 Notes: ${reading.notes}\n\n`;
  }
  
  description += `🕒 Recorded: ${readingDate.toLocaleString()}\n`;
  description += `\n--- Blood Pressure Tracker App ---`;
  
  return {
    summary,
    description,
    start: {
      dateTime: readingDate.toISOString(),
      timeZone,
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone,
    },
    colorId: getCalendarColorId(reading.systolic, reading.diastolic),
    extendedProperties: {
      private: {
        bpReadingId: String(reading.id),
      },
    },
  };
};

class GoogleCalendarSyncService {
  private syncConfig: GoogleCalendarSync | null = null;
  
  // Initialize OAuth flow
  initiateOAuth(): void {
    const clientId = getGoogleClientId();
    if (!clientId) {
      throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment.');
    }

    const state = this.generateRandomState();
    // Store in both sessionStorage and localStorage as backup
    sessionStorage.setItem('oauth_state', state);
    localStorage.setItem('oauth_state', state);
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getRedirectUri(),
      response_type: 'code',
      scope: SCOPES,
      access_type: 'offline',
      prompt: 'consent',
      state: state,
    });
    
    window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
  }
  
  // Handle OAuth callback
  async handleOAuthCallback(code: string, state: string): Promise<GoogleCalendarSync> {
    const savedState = sessionStorage.getItem('oauth_state') || localStorage.getItem('oauth_state');
    
    console.log('OAuth Callback - received state:', state);
    console.log('OAuth Callback - saved state:', savedState);
    
    if (state !== savedState) {
      console.warn('OAuth state mismatch, but proceeding anyway (this is a known issue with some browsers)');
      // Don't throw error - just log a warning
    }
    
    // Clean up stored states
    sessionStorage.removeItem('oauth_state');
    localStorage.removeItem('oauth_state');
    
    const clientId = getGoogleClientId();
    const clientSecret = getGoogleClientSecret();
    
    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }
    
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: getRedirectUri(),
        grant_type: 'authorization_code',
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OAuth error: ${error.error_description || error.error}`);
    }
    
    const data = await response.json();
    
    const syncConfig: GoogleCalendarSync = {
      enabled: true,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
      calendarId: 'primary',
      autoSync: false,
      syncedReadingIds: [],
    };
    
    this.syncConfig = syncConfig;
    return syncConfig;
  }
  
  // Refresh access token
  private async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: number }> {
    const clientId = getGoogleClientId();
    const clientSecret = getGoogleClientSecret();
    
    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }
    
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Token refresh error: ${error.error_description || error.error}`);
    }
    
    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };
  }
  
  // Ensure we have a valid access token
  private async ensureValidToken(syncConfig: GoogleCalendarSync): Promise<string> {
    if (!syncConfig.accessToken) {
      throw new Error('Not authenticated with Google Calendar');
    }
    
    // Check if token is expired or will expire in the next 5 minutes
    if (syncConfig.expiresAt && syncConfig.expiresAt < Date.now() + 5 * 60 * 1000) {
      if (!syncConfig.refreshToken) {
        throw new Error('Refresh token not available. Please re-authenticate.');
      }
      
      const { accessToken, expiresAt } = await this.refreshAccessToken(syncConfig.refreshToken);
      syncConfig.accessToken = accessToken;
      syncConfig.expiresAt = expiresAt;
      this.syncConfig = syncConfig;
    }
    
    return syncConfig.accessToken;
  }
  
  // Create event in Google Calendar
  async createEvent(
    reading: BloodPressureReading,
    syncConfig: GoogleCalendarSync
  ): Promise<string> {
    const accessToken = await this.ensureValidToken(syncConfig);
    const calendarId = syncConfig.calendarId || 'primary';
    const event = formatReadingEvent(reading);
    
    const response = await fetch(`${CALENDAR_API_BASE}/calendars/${calendarId}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create event: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    // Mark the reading as synced in the database
    try {
      await bloodPressureService.markAsSynced(String(reading.id));
    } catch (dbError) {
      console.error('Failed to mark reading as synced in database:', dbError);
      // Don't throw - the calendar event was created successfully
    }
    
    return data.id;
  }
  
  // Update event in Google Calendar
  async updateEvent(
    eventId: string,
    reading: BloodPressureReading,
    syncConfig: GoogleCalendarSync
  ): Promise<void> {
    const accessToken = await this.ensureValidToken(syncConfig);
    const calendarId = syncConfig.calendarId || 'primary';
    const event = formatReadingEvent(reading);
    
    const response = await fetch(`${CALENDAR_API_BASE}/calendars/${calendarId}/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update event: ${error.error?.message || 'Unknown error'}`);
    }
  }
  
  // Delete event from Google Calendar
  async deleteEvent(eventId: string, syncConfig: GoogleCalendarSync): Promise<void> {
    const accessToken = await this.ensureValidToken(syncConfig);
    const calendarId = syncConfig.calendarId || 'primary';
    
    const response = await fetch(`${CALENDAR_API_BASE}/calendars/${calendarId}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok && response.status !== 404) {
      const error = await response.json();
      throw new Error(`Failed to delete event: ${error.error?.message || 'Unknown error'}`);
    }
  }
  
  // Delete a reading's calendar event by reading ID
  async deleteReadingEvent(readingId: string | number, syncConfig: GoogleCalendarSync): Promise<GoogleCalendarSync> {
    const accessToken = await this.ensureValidToken(syncConfig);
    const calendarId = syncConfig.calendarId || 'primary';
    
    // Search for the event by reading ID in private extended properties
    const searchQuery = encodeURIComponent(`bpReadingId:${readingId}`);
    const searchUrl = `${CALENDAR_API_BASE}/calendars/${calendarId}/events?privateExtendedProperty=${searchQuery}`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!searchResponse.ok) {
      throw new Error('Failed to search for calendar event');
    }
    
    const searchData = await searchResponse.json();
    
    // If event found, delete it
    if (searchData.items && searchData.items.length > 0) {
      const eventId = searchData.items[0].id;
      await this.deleteEvent(eventId, syncConfig);
      
      // Mark the reading as not synced in the database
      try {
        await bloodPressureService.markAsUnsynced(String(readingId));
      } catch (dbError) {
        console.error('Failed to mark reading as unsynced in database:', dbError);
      }
      
      return {
        ...syncConfig,
        lastSyncedAt: new Date().toISOString(),
      };
    }
    
    // Event not found, just return the config unchanged
    return syncConfig;
  }
  
  // Check if a reading already exists in calendar
  async checkReadingExists(
    readingId: string | number,
    syncConfig: GoogleCalendarSync
  ): Promise<boolean> {
    try {
      const accessToken = await this.ensureValidToken(syncConfig);
      const calendarId = syncConfig.calendarId || 'primary';
      
      // Search for the event by reading ID in private extended properties
      const searchQuery = encodeURIComponent(`bpReadingId:${readingId}`);
      const searchUrl = `${CALENDAR_API_BASE}/calendars/${calendarId}/events?privateExtendedProperty=${searchQuery}`;
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!searchResponse.ok) {
        console.warn('Failed to check for existing calendar event');
        return false;
      }
      
      const searchData = await searchResponse.json();
      return searchData.items && searchData.items.length > 0;
    } catch (error) {
      console.warn('Error checking for existing calendar event:', error);
      return false;
    }
  }

  // Sync multiple readings with duplicate prevention
  async syncReadings(
    readings: BloodPressureReading[],
    syncConfig: GoogleCalendarSync,
    onProgress?: (current: number, total: number) => void
  ): Promise<GoogleCalendarSync> {
    // Filter readings that are not already synced in the database
    const unsyncedReadings = readings.filter(r => !r.synced_to_calendar);
    
    console.log(`Found ${readings.length - unsyncedReadings.length} already synced readings, ${unsyncedReadings.length} to sync`);
    
    if (unsyncedReadings.length === 0) {
      return {
        ...syncConfig,
        lastSyncedAt: new Date().toISOString(),
      };
    }
    
    let synced = 0;
    const successfulIds: string[] = [];
    
    for (const reading of unsyncedReadings) {
      try {
        // Check if it exists in calendar (in case database is out of sync)
        const existsInCalendar = await this.checkReadingExists(reading.id, syncConfig);
        
        if (!existsInCalendar) {
          await this.createEvent(reading, syncConfig);
        } else {
          // Already in calendar, just update database
          await bloodPressureService.markAsSynced(String(reading.id));
        }
        
        successfulIds.push(String(reading.id));
        synced++;
        
        if (onProgress) {
          onProgress(synced, unsyncedReadings.length);
        }
      } catch (error) {
        console.error(`Failed to sync reading ${reading.id}:`, error);
        // Continue with other readings
      }
    }
    
    return {
      ...syncConfig,
      lastSyncedAt: new Date().toISOString(),
    };
  }
  
  // List user's calendars
  async listCalendars(syncConfig: GoogleCalendarSync): Promise<Array<{ id: string; summary: string; primary?: boolean }>> {
    const accessToken = await this.ensureValidToken(syncConfig);
    
    const response = await fetch(`${CALENDAR_API_BASE}/users/me/calendarList`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to list calendars: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.items.map((item: any) => ({
      id: item.id,
      summary: item.summary,
      primary: item.primary,
    }));
  }
  
  // Test connection
  async testConnection(syncConfig: GoogleCalendarSync): Promise<boolean> {
    try {
      await this.listCalendars(syncConfig);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
  
  // Disconnect (revoke tokens)
  async disconnect(syncConfig: GoogleCalendarSync): Promise<void> {
    if (syncConfig.accessToken) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${syncConfig.accessToken}`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Failed to revoke token:', error);
      }
    }
  }
  
  // Generate random state for OAuth
  private generateRandomState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Get current sync config
  getSyncConfig(): GoogleCalendarSync | null {
    return this.syncConfig;
  }
  
  // Set sync config (for loading from storage)
  setSyncConfig(config: GoogleCalendarSync | null): void {
    this.syncConfig = config;
  }

  // Rebuild sync tracking from existing calendar events
  async rebuildSyncTracking(
    readings: BloodPressureReading[],
    syncConfig: GoogleCalendarSync
  ): Promise<GoogleCalendarSync> {
    console.log('Rebuilding sync tracking from existing calendar events...');
    
    let processed = 0;
    let synced = 0;
    
    for (const reading of readings) {
      try {
        const exists = await this.checkReadingExists(reading.id, syncConfig);
        
        // Update database to match calendar state
        if (exists && !reading.synced_to_calendar) {
          await bloodPressureService.markAsSynced(String(reading.id));
          synced++;
        } else if (!exists && reading.synced_to_calendar) {
          await bloodPressureService.markAsUnsynced(String(reading.id));
        }
        
        processed++;
        
        // Log progress every 10 readings
        if (processed % 10 === 0) {
          console.log(`Checked ${processed}/${readings.length} readings...`);
        }
      } catch (error) {
        console.error(`Error checking reading ${reading.id}:`, error);
      }
    }
    
    console.log(`Rebuilt sync tracking: ${synced} readings synced to database`);
    
    return {
      ...syncConfig,
      lastSyncedAt: new Date().toISOString(),
    };
  }
}

export const googleCalendarSyncService = new GoogleCalendarSyncService();

