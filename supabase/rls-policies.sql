-- RLS policies for Utah Hospitality Insiders
-- Run in Supabase SQL Editor after creating tables

-- Allow public read access
create policy "Public read job_categories" on job_categories for select to anon using (true);
create policy "Public read job_listings" on job_listings for select to anon using (true);
create policy "Public read employers" on employers for select to anon using (true);

-- Allow anonymous inserts for tracking and signups
alter table candidates enable row level security;

create policy "Anyone can insert candidates"
on candidates for insert
to anon
with check (true);

create policy "Anyone can insert listing views"
on listing_views for insert
to anon
with check (true);

create policy "Anyone can insert listing clicks"
on listing_clicks for insert
to anon
with check (true);
