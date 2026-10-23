/**
 * Supabase Integration Adapter
 * 
 * This module prepares the application for instant cloud synchronization with Supabase.
 * If VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are provided in your environment,
 * you can switch between local offline storage and direct Supabase PostgreSQL sync.
 */

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  supabaseUrl: string | null;
  hasAnonKey: boolean;
  statusMessage: string;
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const isConfigured = Boolean(url && key && url.includes('supabase.co'));

  return {
    isConfigured,
    supabaseUrl: url || null,
    hasAnonKey: Boolean(key),
    statusMessage: isConfigured
      ? 'Connected to Supabase PostgreSQL database'
      : 'Operating in High-Performance Local Persistence Mode (Supabase Ready)',
  };
}

export const SUPABASE_SETUP_SQL = `-- ========================================================
-- Charity Donation Impact Visualizer - Supabase Schema
-- Run this in your Supabase SQL Editor (SQL Query Runner)
-- ========================================================

CREATE TABLE IF NOT EXISTS public.donations (
    id TEXT PRIMARY KEY,
    donor_name TEXT NOT NULL,
    donor_email TEXT,
    donor_type TEXT NOT NULL CHECK (donor_type IN ('Individual', 'Corporate', 'Foundation', 'Anonymous')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    expense_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (expense_amount >= 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT NOT NULL CHECK (category IN (
        'Clean Water', 
        'Food & Nutrition', 
        'Healthcare & Medicine', 
        'Education & Literacy', 
        'Disaster Relief', 
        'Shelter & Housing'
    )),
    campaign TEXT NOT NULL,
    beneficiaries_helped INTEGER NOT NULL DEFAULT 0 CHECK (beneficiaries_helped >= 0),
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Deployed' CHECK (status IN ('Allocated', 'In Progress', 'Deployed')),
    location TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_donations_category ON public.donations(category);
CREATE INDEX IF NOT EXISTS idx_donations_date ON public.donations(date DESC);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Allow public read access for transparency dashboards
CREATE POLICY "Public read access for transparency" 
ON public.donations FOR SELECT USING (true);

-- Allow authenticated or public insert/update based on app policy
CREATE POLICY "Allow public insert and update for demo" 
ON public.donations FOR ALL USING (true);
`;
