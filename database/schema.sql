-- Blood Pressure Readings Table
create table blood_pressure_readings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  systolic integer not null check (systolic > 0 and systolic < 300),
  diastolic integer not null check (diastolic > 0 and diastolic < 200),
  pulse integer not null check (pulse > 0 and pulse < 300),
  reading_date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  notes text
);

-- Enable Row Level Security
alter table blood_pressure_readings enable row level security;

-- Create policies for blood_pressure_readings
create policy "Users can view their own readings" on blood_pressure_readings
  for select using (auth.uid() = user_id);

create policy "Users can insert their own readings" on blood_pressure_readings
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own readings" on blood_pressure_readings
  for update using (auth.uid() = user_id);

create policy "Users can delete their own readings" on blood_pressure_readings
  for delete using (auth.uid() = user_id);

-- Create indexes for better performance
create index blood_pressure_readings_user_id_idx on blood_pressure_readings(user_id);
create index blood_pressure_readings_reading_date_idx on blood_pressure_readings(reading_date desc);
create index blood_pressure_readings_user_date_idx on blood_pressure_readings(user_id, reading_date desc);

-- Create updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_blood_pressure_readings_updated_at
  before update on blood_pressure_readings
  for each row execute function update_updated_at_column();

-- User Settings Table (optional - for storing user preferences)
create table user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  theme text default 'light' check (theme in ('light', 'dark')),
  systolic_goal integer default 130 check (systolic_goal > 0 and systolic_goal < 300),
  diastolic_goal integer default 85 check (diastolic_goal > 0 and diastolic_goal < 200),
  language text default 'en' check (language in ('en', 'lt')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security for user_settings
alter table user_settings enable row level security;

-- Create policies for user_settings
create policy "Users can view their own settings" on user_settings
  for select using (auth.uid() = user_id);

create policy "Users can insert their own settings" on user_settings
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own settings" on user_settings
  for update using (auth.uid() = user_id);

create policy "Users can delete their own settings" on user_settings
  for delete using (auth.uid() = user_id);

-- Create trigger for user_settings updated_at
create trigger update_user_settings_updated_at
  before update on user_settings
  for each row execute function update_updated_at_column();

-- Function to automatically create user settings when a user signs up
create or replace function handle_new_user_settings()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_settings (user_id)
  values (new.id);
  return new;
end;
$$;

-- Trigger to create user settings for new users
create trigger on_auth_user_created_settings
  after insert on auth.users
  for each row execute procedure public.handle_new_user_settings();
