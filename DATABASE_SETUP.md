# Database Setup Guide

This guide will help you set up the Supabase database tables for storing blood pressure readings and user settings.

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

## Step 2: Create the Database Schema

Copy and paste the contents of `database/schema.sql` into the SQL editor and run it. This will create:

### Tables Created:

#### `blood_pressure_readings`
- Stores all blood pressure readings for users
- Includes systolic, diastolic, pulse, and reading date
- Has Row Level Security (RLS) enabled
- Users can only access their own readings

#### `user_settings` 
- Stores user preferences (theme, goals, language)
- Automatically created when a user signs up
- Has Row Level Security (RLS) enabled

### Security Features:
- **Row Level Security (RLS)**: Users can only access their own data
- **Data validation**: Constraints ensure realistic blood pressure values
- **Automatic timestamps**: Created and updated timestamps are managed automatically
- **Indexes**: Optimized for fast queries

## Step 3: Verify the Setup

After running the schema, you should see:

1. **Tables** in the Table Editor:
   - `blood_pressure_readings`
   - `user_settings`

2. **Policies** in Authentication > Policies:
   - Policies for both tables allowing users to manage their own data

3. **Functions** in Database > Functions:
   - `update_updated_at_column`
   - `handle_new_user_settings`

## Step 4: Test the Database

You can test the database by:

1. **Creating a test reading**:
```sql
INSERT INTO blood_pressure_readings (user_id, systolic, diastolic, pulse, reading_date)
VALUES (auth.uid(), 120, 80, 72, now());
```

2. **Querying your readings**:
```sql
SELECT * FROM blood_pressure_readings WHERE user_id = auth.uid();
```

3. **Checking user settings**:
```sql
SELECT * FROM user_settings WHERE user_id = auth.uid();
```

## Step 5: Update Your Application

The application will automatically use the database once the tables are created. The `bloodPressureService` will handle all database operations.

### Features Available:
- ✅ **Cloud Storage**: Readings stored in Supabase
- ✅ **Cross-Device Sync**: Access data from any device
- ✅ **Data Backup**: Automatic backups by Supabase
- ✅ **Real-time Updates**: Changes sync across devices
- ✅ **Secure Access**: Row Level Security protects user data

## Migration from Local Storage

If you have existing readings in local storage, they will be automatically migrated to the database when you first use the app after setting up the tables.

## Database Schema Details

### Blood Pressure Readings Table Structure:
```sql
blood_pressure_readings (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  systolic integer (1-299),
  diastolic integer (1-199), 
  pulse integer (1-299),
  reading_date timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  notes text (optional)
)
```

### User Settings Table Structure:
```sql
user_settings (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  theme text ('light' or 'dark'),
  systolic_goal integer (default: 130),
  diastolic_goal integer (default: 85),
  language text ('en' or 'lt'),
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
```

## Troubleshooting

### Common Issues:

1. **Permission Denied**:
   - Ensure you're authenticated when testing queries
   - Check that RLS policies are correctly applied

2. **Table Not Found**:
   - Verify the schema was executed successfully
   - Check the Tables section in Supabase dashboard

3. **Data Not Syncing**:
   - Check browser console for errors
   - Verify Supabase connection in the app

### Getting Help:

- Check the Supabase logs in Dashboard > Logs
- Review the SQL Editor for any error messages
- Ensure your Supabase project is active and not paused
