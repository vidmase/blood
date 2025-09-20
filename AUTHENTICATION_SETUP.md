# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for your Blood Pressure Tracker application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. The application dependencies installed (`npm install`)

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "blood-pressure-tracker")
5. Enter a database password (save this securely)
6. Select a region close to your users
7. Click "Create new project"

## Step 2: Configure Environment Variables

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

3. Update your `.env.local` file with these values:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Configure Authentication Providers

### Email Authentication (Default)
Email authentication is enabled by default. Users can:
- Sign up with email/password
- Sign in with email/password
- Use magic links (passwordless login)
- Reset passwords

### OAuth Providers (Optional)

To enable Google and GitHub authentication:

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Configure the providers you want to enable:

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your Supabase callback URL: `https://your-project-id.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret to Supabase

#### GitHub OAuth:
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `https://your-project-id.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

## Step 4: Configure Authentication Settings

In Supabase dashboard, go to **Authentication** → **Settings**:

### Site URL Configuration:
- **Site URL**: `http://localhost:5173` (for development)
- **Redirect URLs**: Add your production domain when deploying

### Email Templates (Optional):
Customize the email templates for:
- Confirmation emails
- Password reset emails
- Magic link emails

## Step 5: Database Setup (Optional)

The authentication system works out of the box, but you can extend it:

### User Profiles Table:
```sql
-- Create a profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  
  constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a trigger to automatically create a profile for new users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Step 6: Install Dependencies

Make sure you have the Supabase client installed:

```bash
npm install @supabase/supabase-js
```

## Step 7: Test the Authentication

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:5173`
3. You should see the authentication page
4. Test the following flows:
   - Sign up with email/password
   - Sign in with email/password
   - Password reset
   - Magic link login (if enabled)
   - OAuth providers (if configured)

## Authentication Features Implemented

### ✅ Email/Password Authentication
- User registration with email verification
- Secure login with password
- Password strength validation
- Account confirmation emails

### ✅ Magic Link Authentication
- Passwordless login via email
- Secure token-based authentication
- One-click login experience

### ✅ OAuth Authentication
- Google OAuth integration
- GitHub OAuth integration
- Seamless social login experience

### ✅ Password Reset
- Secure password reset via email
- Token-based reset process
- User-friendly reset flow

### ✅ User Profile Management
- View and edit profile information
- Update email and password
- Account information display

### ✅ Protected Routes
- Automatic authentication checks
- Redirect to login when needed
- Persistent authentication state

### ✅ Session Management
- Automatic session refresh
- Secure token handling
- Logout functionality

## Security Features

- **Row Level Security (RLS)**: Database-level security policies
- **JWT Tokens**: Secure authentication tokens
- **Password Hashing**: Bcrypt password hashing
- **Email Verification**: Confirmed email addresses
- **Rate Limiting**: Built-in Supabase rate limiting
- **HTTPS Only**: Secure connections required

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading**
   - Ensure `.env.local` is in the project root
   - Restart the development server after changes
   - Check variable names start with `VITE_`

2. **Authentication Errors**
   - Verify Supabase URL and keys are correct
   - Check Supabase project is active
   - Ensure redirect URLs are configured

3. **OAuth Not Working**
   - Verify OAuth provider configuration
   - Check callback URLs match exactly
   - Ensure OAuth apps are approved/published

4. **Email Not Sending**
   - Check Supabase email settings
   - Verify SMTP configuration (if custom)
   - Check spam folders

### Getting Help:

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## Production Deployment

When deploying to production:

1. Update environment variables with production Supabase URL
2. Configure production redirect URLs in Supabase
3. Set up custom domain (optional)
4. Configure email templates with your branding
5. Set up monitoring and logging
6. Review and test all authentication flows

## Next Steps

- Implement user roles and permissions
- Add two-factor authentication
- Set up user analytics
- Implement social features
- Add user preferences and settings
