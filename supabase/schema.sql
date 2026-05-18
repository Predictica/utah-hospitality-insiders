-- Utah Hospitality Insiders — Complete Database Schema
-- Run this in the Supabase SQL Editor to create all tables

-- Job Categories lookup table
create table job_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Seed job categories
insert into job_categories (name, slug, sort_order) values
  ('Server', 'server', 1),
  ('Bartender', 'bartender', 2),
  ('Busser', 'busser', 3),
  ('Hostess', 'hostess', 4),
  ('Food Prep', 'food-prep', 5),
  ('Dishwasher', 'dishwasher', 6),
  ('Cook / Line Cook', 'cook-line-cook', 7),
  ('Front Desk', 'front-desk', 8),
  ('Guest Services', 'guest-services', 9),
  ('Housekeeping', 'housekeeping', 10),
  ('Maintenance', 'maintenance', 11),
  ('Management', 'management', 12),
  ('Spa', 'spa', 13),
  ('Golf / Recreation', 'golf-recreation', 14),
  ('Other', 'other', 15);

-- Employers table
create table employers (
  id uuid default gen_random_uuid() primary key,
  company_name text not null,
  contact_name text not null,
  email text not null unique,
  phone text,
  website text,
  number_of_locations integer,
  number_of_employees integer,
  tier text not null default 'free' check (tier in ('free', 'standard', 'sponsored', 'premium_annual')),
  is_small_business boolean default false,
  is_verified boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Job Listings table
create table job_listings (
  id uuid default gen_random_uuid() primary key,
  employer_id uuid references employers(id) on delete set null,
  employer_name text,
  source text not null default 'free' check (source in ('scraped', 'free', 'standard', 'sponsored')),
  title text not null,
  description text,
  job_type text check (job_type in ('full_time', 'part_time', 'seasonal', 'gig')),
  category_id uuid references job_categories(id) on delete set null,
  location_city text,
  location_region text,
  pay_min numeric,
  pay_max numeric,
  pay_type text check (pay_type in ('hourly', 'salary', 'tips_plus')),
  application_method text check (application_method in ('external_link', 'email')),
  application_url text,
  is_featured boolean default false,
  is_active boolean default true,
  scraped_source_url text,
  posted_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 days'),
  created_at timestamptz default now()
);

-- Candidates table
create table candidates (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  sms_opted_in boolean default false,
  email_opted_in boolean default true,
  preferred_locations text[] default '{}',
  preferred_categories uuid[] default '{}',
  availability text[] default '{}',
  pay_minimum numeric,
  years_experience text check (years_experience in ('0-1', '1-3', '3-5', '5-10', '10+')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Listing Views tracking
create table listing_views (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references job_listings(id) on delete cascade,
  viewed_at timestamptz default now(),
  ip_address text,
  user_agent text
);

-- Listing Clicks tracking
create table listing_clicks (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references job_listings(id) on delete cascade,
  clicked_at timestamptz default now(),
  ip_address text,
  user_agent text
);

-- Alert Sends log
create table alert_sends (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references job_listings(id) on delete cascade,
  candidate_id uuid references candidates(id) on delete cascade,
  channel text check (channel in ('email', 'sms')),
  sent_at timestamptz default now(),
  status text default 'sent' check (status in ('sent', 'delivered', 'failed', 'bounced'))
);

-- Subscriptions table
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  employer_id uuid references employers(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  tier text check (tier in ('standard', 'sponsored', 'premium_annual')),
  status text check (status in ('active', 'past_due', 'cancelled', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  amount_cents integer,
  billing_interval text check (billing_interval in ('monthly', 'annual')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Scrape Targets table
create table scrape_targets (
  id uuid default gen_random_uuid() primary key,
  employer_name text not null,
  careers_page_url text not null,
  is_active boolean default true,
  last_scraped_at timestamptz,
  scrape_frequency_hours integer default 24,
  notes text,
  created_at timestamptz default now()
);

-- Seed initial scrape targets
insert into scrape_targets (employer_name, careers_page_url, notes) values
  ('Hyatt Regency Salt Lake City', 'https://www.hyatt.com/en-US/careers', 'Large property, high volume'),
  ('Grand America Hotel', 'https://www.grandamerica.com/careers', 'Flagship Utah luxury property'),
  ('Snowbird Resort', 'https://www.snowbird.com/jobs/', 'Seasonal hiring peaks'),
  ('Deer Valley Resort', 'https://www.deervalley.com/plan-your-trip/jobs', 'High end resort'),
  ('Sundance Mountain Resort', 'https://www.sundanceresort.com/employment', 'Year round resort');
