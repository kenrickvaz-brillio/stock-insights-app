-- =====================================================
-- STOCK INSIGHTS APP - SUPABASE SCHEMA
-- =====================================================
-- This schema supports user authentication, stock selection,
-- and caching of market data from Alpha Vantage.
-- Designed for extensibility (future: alerts, AI summaries)
-- =====================================================

-- Enable Row Level Security (RLS) for all tables
-- This ensures users can only access their own data

-- =====================================================
-- TABLE: user_stocks
-- =====================================================
-- Stores which stocks each user has selected to track
-- One user can track multiple stocks
-- =====================================================

CREATE TABLE IF NOT EXISTS user_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol VARCHAR(10) NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can't add the same stock twice
  UNIQUE(user_id, symbol)
);

-- Index for faster lookups by user
CREATE INDEX idx_user_stocks_user_id ON user_stocks(user_id);

-- RLS Policies for user_stocks
ALTER TABLE user_stocks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own stocks
CREATE POLICY "Users can view their own stocks"
  ON user_stocks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own stocks
CREATE POLICY "Users can insert their own stocks"
  ON user_stocks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own stocks
CREATE POLICY "Users can delete their own stocks"
  ON user_stocks
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: stock_data_cache
-- =====================================================
-- Caches stock market data from Alpha Vantage
-- Reduces API calls and improves performance
-- TTL: Data older than 24 hours should be refreshed
-- =====================================================

CREATE TABLE IF NOT EXISTS stock_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(10) NOT NULL,
  data_type VARCHAR(50) NOT NULL, -- e.g., 'TIME_SERIES_DAILY'
  data JSONB NOT NULL, -- Raw API response
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure we only cache one entry per symbol/type combination
  UNIQUE(symbol, data_type)
);

-- Index for faster lookups by symbol
CREATE INDEX idx_stock_data_cache_symbol ON stock_data_cache(symbol);
CREATE INDEX idx_stock_data_cache_fetched_at ON stock_data_cache(fetched_at);

-- RLS Policies for stock_data_cache
-- Cache is read-only for all authenticated users
-- Only backend/service role can write to cache
ALTER TABLE stock_data_cache ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read cached data
CREATE POLICY "Authenticated users can read cache"
  ON stock_data_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- FUTURE EXTENSIBILITY NOTES
-- =====================================================
-- 1. Alerts Table:
--    - user_id, stock_symbol, alert_type, threshold, is_active
--    - Trigger notifications when conditions are met
--
-- 2. AI Summaries Table:
--    - symbol, summary_text, generated_at
--    - Store AI-generated insights for stocks
--
-- 3. User Preferences Table:
--    - user_id, theme, notification_settings, default_view
--    - Personalization options
-- =====================================================
