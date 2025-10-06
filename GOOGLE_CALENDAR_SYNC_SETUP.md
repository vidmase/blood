# Google Calendar Sync Setup Guide

## Overview

The Blood Pressure Tracker now includes real-time Google Calendar synchronization! This allows your blood pressure readings to automatically appear in your Google Calendar, helping you visualize your health data alongside your daily activities.

## Features

- **OAuth 2.0 Authentication**: Secure authentication with Google
- **Automatic Sync**: Optionally sync new readings automatically
- **Manual Sync**: On-demand synchronization of all readings
- **Calendar Selection**: Choose which Google Calendar to sync to
- **Color-Coded Events**: Events are color-coded based on health status
- **Sync Status Tracking**: Track which readings have been synced
- **Connection Management**: Easy connect/disconnect functionality

## Setup Instructions

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External (for testing) or Internal (for organization)
   - Fill in the required fields (App name, User support email, Developer contact)
   - Add scopes: `https://www.googleapis.com/auth/calendar.events` and `https://www.googleapis.com/auth/calendar.readonly`
   - Add test users (your email) if using External type
4. Choose "Web application" as the application type
5. Add authorized redirect URIs:
   - For local development: `http://localhost:5173`
   - For production: `https://yourdomain.com`
6. Click "Create"
7. Copy the **Client ID** and **Client Secret**

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   VITE_GOOGLE_CLIENT_SECRET=your_client_secret
   VITE_GOOGLE_REDIRECT_URI=http://localhost:5173
   ```

3. **Important**: Never commit `.env.local` to version control

### 4. Update .gitignore

Ensure your `.gitignore` includes:
```
.env.local
.env
```

### 5. Restart Development Server

After setting environment variables, restart your development server:
```bash
npm run dev
```

## Usage

### Connecting to Google Calendar

1. Open the app and go to **Settings**
2. Click on the **Calendar Sync** tab
3. Click **Connect with Google Calendar**
4. Sign in with your Google account
5. Grant the requested permissions
6. You'll be redirected back to the app

### Syncing Readings

#### Manual Sync
1. Go to **Settings** > **Calendar Sync**
2. Click **Sync Now**
3. Wait for the sync to complete

#### Automatic Sync
1. Go to **Settings** > **Calendar Sync**
2. Toggle on **Automatic Sync**
3. New readings will automatically sync when added

### Selecting a Calendar

1. Go to **Settings** > **Calendar Sync**
2. Use the **Select Calendar** dropdown
3. Choose which calendar to sync to
4. Your preference is saved automatically

### Disconnecting

1. Go to **Settings** > **Calendar Sync**
2. Click **Disconnect**
3. This will revoke access tokens and clear sync data

## Calendar Event Format

Each blood pressure reading becomes a calendar event:

### Event Title
```
BP: 120/80 - ✅ Optimal
```

### Event Description
```
Blood Pressure Reading

📊 Measurements:
• Systolic: 120 mmHg
• Diastolic: 80 mmHg
• Pulse: 72 bpm

📈 Status: ✅ Optimal

📝 Notes: Feeling good today

🕒 Recorded: 1/15/2025, 10:30 AM

--- Blood Pressure Tracker App ---
```

### Event Colors

Events are automatically color-coded based on health status:
- 🟢 **Green** (Optimal): Systolic < 120, Diastolic < 80
- 🔵 **Blue** (Low): Systolic < 90 or Diastolic < 60
- 🟡 **Yellow** (Elevated): Systolic 121-129, Diastolic 81-84
- 🟠 **Orange** (High): Systolic 130-139, Diastolic 85-89
- 🔴 **Red** (Critical): Systolic ≥ 140 or Diastolic ≥ 90

## Troubleshooting

### "OAuth credentials not configured" Error

**Solution**: Set the environment variables in `.env.local` and restart the dev server.

### "Connection test failed" Error

**Possible causes**:
1. Token expired - Try disconnecting and reconnecting
2. API not enabled - Enable Google Calendar API in Cloud Console
3. Invalid credentials - Verify Client ID and Secret

### Redirect URI Mismatch Error

**Solution**: Ensure the redirect URI in your `.env.local` matches exactly with the one configured in Google Cloud Console (including http/https and trailing slashes).

### Vercel Deployment OAuth Issues

**Common Issues**:
1. **"redirect_uri_mismatch" Error**: 
   - Ensure your Vercel app URL is added to Google Cloud Console authorized redirect URIs
   - Check that both `https://your-app.vercel.app` and `https://your-app.vercel.app/` are added
   
2. **Environment Variables Not Loading**:
   - Verify all environment variables are set in Vercel dashboard
   - Redeploy the application after adding/updating environment variables
   - Check that variable names start with `VITE_` for client-side access
   
3. **OAuth Works Locally But Not on Vercel**:
   - Double-check that Google Cloud Console has your Vercel URL in authorized redirect URIs
   - Ensure OAuth consent screen is configured for production (not just localhost)
   - Verify environment variables are correctly set in Vercel

### Events Not Appearing in Calendar

**Possible causes**:
1. Wrong calendar selected - Check calendar selection in settings
2. Sync not completed - Wait for sync to finish
3. Calendar view filtered - Check Google Calendar's view settings

### Token Refresh Failed

**Solution**: Disconnect and reconnect to get a new refresh token.

## Security Best Practices

1. **Never share your Client Secret**: Keep it secure and never commit it to version control
2. **Use HTTPS in production**: Always use secure connections for OAuth
3. **Rotate credentials**: Periodically rotate your OAuth credentials
4. **Limit scopes**: Only request the calendar scopes you need
5. **Review access**: Regularly review connected apps in your Google Account settings

## Development vs Production

### Development
- Use `http://localhost:5173` as redirect URI
- Test with test users in OAuth consent screen
- Keep credentials in `.env.local`

### Production (Vercel Deployment)
- Use your Vercel deployment URL as redirect URI (e.g., `https://your-app-name.vercel.app`)
- Submit OAuth consent screen for verification if public
- Store credentials securely in Vercel environment variables
- Use HTTPS only

#### Vercel Environment Variables Setup
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:
   ```
   VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   VITE_GOOGLE_CLIENT_SECRET=your_client_secret
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```
4. **Important**: Do NOT set `VITE_GOOGLE_REDIRECT_URI` in Vercel - the app will auto-detect the correct URL
5. Redeploy your application after adding environment variables

#### Google Cloud Console Redirect URIs
For Vercel deployment, add these URIs to your OAuth 2.0 credentials:
- `https://your-app-name.vercel.app`
- `https://your-app-name.vercel.app/` (with trailing slash)
- Keep `http://localhost:5173` for local development

## API Limits

Google Calendar API has usage limits:
- **Queries per day**: 1,000,000
- **Queries per user per second**: 10

For most users, these limits are more than sufficient. The app implements:
- Token refresh to minimize authentication calls
- Batch syncing to reduce API calls
- Error handling for rate limits

## Privacy

- **Local processing**: All sync logic runs in your browser
- **Your control**: You control when and what to sync
- **Revocable access**: Disconnect at any time
- **No data collection**: We don't collect your calendar data
- **Secure tokens**: Access tokens are stored locally and can be revoked

## Support

For issues or questions:
1. Check this documentation
2. Verify environment variables are set correctly
3. Check browser console for error messages
4. Review Google Cloud Console for API status

## References

- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [OAuth 2.0 for Web Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Cloud Console](https://console.cloud.google.com/)

---

*Blood Pressure Tracker - Track. Analyze. Improve.*

