-- Migration: Create Aggregated Stats Tables
-- These tables store pre-computed stats for efficient retrieval
-- Run this migration in your Supabase SQL Editor

-- ============================================
-- Daily Aggregated Stats Table
-- ============================================
CREATE TABLE IF NOT EXISTS aggregated_daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT NOT NULL,
    date DATE NOT NULL,
    focus_score INTEGER DEFAULT 0,
    sleep_hours DECIMAL(4,2) DEFAULT 0,
    steps INTEGER DEFAULT 0,
    workouts_completed INTEGER DEFAULT 0,
    pages_read INTEGER DEFAULT 0,
    meditation_minutes INTEGER DEFAULT 0,
    goals_completed INTEGER DEFAULT 0,
    goals_total INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per user per day
    CONSTRAINT unique_daily_stats UNIQUE (firebase_uid, date)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date 
ON aggregated_daily_stats(firebase_uid, date DESC);

-- ============================================
-- Weekly Aggregated Stats Table
-- ============================================
CREATE TABLE IF NOT EXISTS aggregated_weekly_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    avg_focus_score INTEGER DEFAULT 0,
    total_sleep_hours DECIMAL(5,2) DEFAULT 0,
    total_steps INTEGER DEFAULT 0,
    total_workouts INTEGER DEFAULT 0,
    total_pages_read INTEGER DEFAULT 0,
    total_meditation_minutes INTEGER DEFAULT 0,
    goal_completion_rate INTEGER DEFAULT 0,
    best_day DATE,
    worst_day DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per user per week
    CONSTRAINT unique_weekly_stats UNIQUE (firebase_uid, week_start)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_weekly_stats_user_week 
ON aggregated_weekly_stats(firebase_uid, week_start DESC);

-- ============================================
-- Monthly Aggregated Stats Table
-- ============================================
CREATE TABLE IF NOT EXISTS aggregated_monthly_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT NOT NULL,
    month VARCHAR(7) NOT NULL, -- YYYY-MM format
    avg_focus_score INTEGER DEFAULT 0,
    total_workouts INTEGER DEFAULT 0,
    total_pages_read INTEGER DEFAULT 0,
    total_meditation_minutes INTEGER DEFAULT 0,
    goal_completion_rate INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per user per month
    CONSTRAINT unique_monthly_stats UNIQUE (firebase_uid, month)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_monthly_stats_user_month 
ON aggregated_monthly_stats(firebase_uid, month DESC);

-- ============================================
-- AI Insights Table
-- ============================================
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('daily_summary', 'weekly_review', 'goal_suggestion')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    -- Index for type-based queries
    CONSTRAINT valid_insight_type CHECK (type IN ('daily_summary', 'weekly_review', 'goal_suggestion'))
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_type 
ON ai_insights(firebase_uid, type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_insights_expires 
ON ai_insights(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- User Streaks Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT NOT NULL UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    streak_start_date DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- User Preferences Table (for scheduled functions)
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT NOT NULL UNIQUE,
    morning_notification BOOLEAN DEFAULT true,
    evening_notification BOOLEAN DEFAULT true,
    weekly_review_notification BOOLEAN DEFAULT true,
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Health Data Table (for steps, sleep)
-- ============================================
CREATE TABLE IF NOT EXISTS health_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT NOT NULL,
    date DATE NOT NULL,
    sleep_hours DECIMAL(4,2),
    steps INTEGER,
    heart_rate_avg INTEGER,
    water_glasses INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_health_data UNIQUE (firebase_uid, date)
);

CREATE INDEX IF NOT EXISTS idx_health_data_user_date 
ON health_data(firebase_uid, date DESC);

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE aggregated_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE aggregated_weekly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE aggregated_monthly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (Cloud Functions)
-- Note: These policies allow the service role to access all data
-- Individual user access should be through Cloud Functions

CREATE POLICY "Service role access for daily stats" ON aggregated_daily_stats
    FOR ALL USING (true);

CREATE POLICY "Service role access for weekly stats" ON aggregated_weekly_stats
    FOR ALL USING (true);

CREATE POLICY "Service role access for monthly stats" ON aggregated_monthly_stats
    FOR ALL USING (true);

CREATE POLICY "Service role access for ai insights" ON ai_insights
    FOR ALL USING (true);

CREATE POLICY "Service role access for user streaks" ON user_streaks
    FOR ALL USING (true);

CREATE POLICY "Service role access for user preferences" ON user_preferences
    FOR ALL USING (true);

CREATE POLICY "Service role access for health data" ON health_data
    FOR ALL USING (true);

-- ============================================
-- Function to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_daily_stats_updated_at
    BEFORE UPDATE ON aggregated_daily_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_data_updated_at
    BEFORE UPDATE ON health_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at
    BEFORE UPDATE ON user_streaks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
