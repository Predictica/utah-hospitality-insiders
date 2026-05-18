export interface JobCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface Employer {
  id: string;
  auth_user_id: string | null;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  number_of_locations: number | null;
  number_of_employees: number | null;
  tier: "free" | "standard" | "sponsored" | "premium_annual";
  is_small_business: boolean;
  is_verified: boolean;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobListing {
  id: string;
  employer_id: string | null;
  employer_name: string | null;
  source: "scraped" | "free" | "standard" | "sponsored";
  title: string;
  description: string | null;
  job_type: "full_time" | "part_time" | "seasonal" | "gig" | null;
  category_id: string | null;
  location_city: string | null;
  location_region: string | null;
  pay_min: number | null;
  pay_max: number | null;
  pay_type: "hourly" | "salary" | "tips_plus" | null;
  application_method: "external_link" | "email" | null;
  application_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  scraped_source_url: string | null;
  posted_at: string;
  expires_at: string;
  created_at: string;
}

export interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  sms_opted_in: boolean;
  email_opted_in: boolean;
  preferred_locations: string[];
  preferred_categories: string[];
  availability: string[];
  pay_minimum: number | null;
  years_experience: "0-1" | "1-3" | "3-5" | "5-10" | "10+" | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingView {
  id: string;
  listing_id: string;
  viewed_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface ListingClick {
  id: string;
  listing_id: string;
  clicked_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface AlertSend {
  id: string;
  listing_id: string;
  candidate_id: string;
  channel: "email" | "sms" | null;
  sent_at: string;
  status: "sent" | "delivered" | "failed" | "bounced";
}

export interface Subscription {
  id: string;
  employer_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier: "standard" | "sponsored" | "premium_annual" | null;
  status: "active" | "past_due" | "cancelled" | "trialing" | null;
  current_period_start: string | null;
  current_period_end: string | null;
  amount_cents: number | null;
  billing_interval: "monthly" | "annual" | null;
  created_at: string;
  updated_at: string;
}

export interface ScrapeTarget {
  id: string;
  employer_name: string;
  careers_page_url: string;
  is_active: boolean;
  last_scraped_at: string | null;
  scrape_frequency_hours: number;
  notes: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      job_categories: {
        Row: JobCategory;
        Insert: Omit<JobCategory, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<JobCategory, "id">>;
      };
      employers: {
        Row: Employer;
        Insert: Omit<Employer, "id" | "created_at" | "updated_at" | "is_small_business" | "is_verified" | "is_active"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          is_small_business?: boolean;
          is_verified?: boolean;
          is_active?: boolean;
        };
        Update: Partial<Omit<Employer, "id">>;
      };
      job_listings: {
        Row: JobListing;
        Insert: Omit<JobListing, "id" | "created_at" | "posted_at" | "expires_at" | "is_featured" | "is_active"> & {
          id?: string;
          created_at?: string;
          posted_at?: string;
          expires_at?: string;
          is_featured?: boolean;
          is_active?: boolean;
        };
        Update: Partial<Omit<JobListing, "id">>;
      };
      candidates: {
        Row: Candidate;
        Insert: Omit<Candidate, "id" | "created_at" | "updated_at" | "sms_opted_in" | "email_opted_in" | "is_active"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          sms_opted_in?: boolean;
          email_opted_in?: boolean;
          is_active?: boolean;
        };
        Update: Partial<Omit<Candidate, "id">>;
      };
      listing_views: {
        Row: ListingView;
        Insert: Omit<ListingView, "id" | "viewed_at"> & { id?: string; viewed_at?: string };
        Update: Partial<Omit<ListingView, "id">>;
      };
      listing_clicks: {
        Row: ListingClick;
        Insert: Omit<ListingClick, "id" | "clicked_at"> & { id?: string; clicked_at?: string };
        Update: Partial<Omit<ListingClick, "id">>;
      };
      alert_sends: {
        Row: AlertSend;
        Insert: Omit<AlertSend, "id" | "sent_at"> & { id?: string; sent_at?: string };
        Update: Partial<Omit<AlertSend, "id">>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Subscription, "id">>;
      };
      scrape_targets: {
        Row: ScrapeTarget;
        Insert: Omit<ScrapeTarget, "id" | "created_at" | "is_active" | "scrape_frequency_hours"> & {
          id?: string;
          created_at?: string;
          is_active?: boolean;
          scrape_frequency_hours?: number;
        };
        Update: Partial<Omit<ScrapeTarget, "id">>;
      };
    };
  };
}

export interface JobListingWithEmployer extends JobListing {
  employers: Pick<Employer, "company_name"> | null;
  job_categories: Pick<JobCategory, "name" | "slug"> | null;
}
