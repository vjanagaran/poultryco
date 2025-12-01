-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 00_extensions.sql
-- Description: PostgreSQL extensions and core setup
-- Version: 2.0
-- Date: 2025-12-01
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable unaccent for search
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Enable PostGIS (if needed for location features)
-- CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enable pg_stat_statements for query performance monitoring
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- Create auth schema for Cognito integration
-- =====================================================

CREATE SCHEMA IF NOT EXISTS auth;

-- Auth users table (synced with AWS Cognito)
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMPTZ,
  phone_number TEXT,
  phone_confirmed_at TIMESTAMPTZ,
  
  -- Cognito attributes
  cognito_sub TEXT UNIQUE,
  cognito_username TEXT,
  
  -- OAuth provider info
  provider TEXT, -- 'cognito', 'google', 'linkedin'
  provider_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ
);

-- Indexes for auth.users
CREATE INDEX idx_auth_users_email ON auth.users(email);
CREATE INDEX idx_auth_users_cognito_sub ON auth.users(cognito_sub);
CREATE INDEX idx_auth_users_provider ON auth.users(provider, provider_id);

-- =====================================================
-- Helper function to get current user ID
-- =====================================================

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID AS $$
BEGIN
  -- This will be set by the application layer
  -- For now, return current_setting if available
  BEGIN
    RETURN current_setting('app.current_user_id')::UUID;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Update timestamp trigger function
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON SCHEMA auth IS 'Authentication schema for AWS Cognito integration';
COMMENT ON TABLE auth.users IS 'User authentication records synced with AWS Cognito';
COMMENT ON FUNCTION auth.uid() IS 'Returns the current authenticated user ID';
COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updated_at timestamp';

