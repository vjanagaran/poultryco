-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 00_auth_custom.sql
-- Description: Custom authentication tables (OTP-based, multi-channel)
-- Version: 3.0
-- Date: 2025-12-01
-- =====================================================

-- =====================================================
-- POSTGRESQL EXTENSIONS
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
-- UPDATE TIMESTAMP TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 1: AUTH USERS (User Authentication)
-- =====================================================

-- Auth users table (PostgreSQL-only custom auth)
-- Follows module prefix pattern: auth_ prefix (matches usr_, biz_, adm_ pattern)
CREATE TABLE IF NOT EXISTS auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contact identifiers
  email TEXT UNIQUE,
  phone TEXT,
  
  -- Verification flags (same phone for SMS and WhatsApp)
  email_verified BOOLEAN NOT NULL DEFAULT false,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  
  -- WhatsApp preference flag
  whatsapp_flag BOOLEAN NOT NULL DEFAULT false, -- true if user prefers WhatsApp over SMS
  
  -- Auto-login token (JWT refresh token or session token)
  token TEXT, -- Hashed token for auto-login after verification
  token_expires_at TIMESTAMPTZ,
  
  -- User status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'deleted')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ,
  
  -- Ensure at least one identifier exists
  CONSTRAINT check_identifier CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Indexes for auth_users
CREATE INDEX idx_auth_users_email ON auth_users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_auth_users_phone ON auth_users(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_auth_users_status ON auth_users(status) WHERE status = 'active';
CREATE INDEX idx_auth_users_token ON auth_users(token) WHERE token IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER update_auth_users_updated_at
  BEFORE UPDATE ON auth_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: AUTH REQUESTS (OTP Management)
-- =====================================================

-- OTP requests table - stores hashed OTP codes
CREATE TABLE IF NOT EXISTS auth_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User reference (nullable for new users during signup)
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  
  -- Identifier (email or phone number)
  identifier TEXT NOT NULL, -- email address or phone number
  
  -- Channel (email, sms, whatsapp)
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
  
  -- OTP code (HASHED - never store plain text)
  code_hash TEXT NOT NULL, -- bcrypt/argon2 hash of the OTP
  
  -- OTP metadata
  code_expires_at TIMESTAMPTZ NOT NULL, -- OTP validity (5-10 minutes)
  verified_at TIMESTAMPTZ, -- When OTP was successfully verified
  
  -- Request type (only verification types - no separate login/signup/password_reset)
  request_type TEXT NOT NULL CHECK (request_type IN ('verify_email', 'verify_phone')),
  
  -- Security tracking
  attempts INTEGER NOT NULL DEFAULT 0, -- Number of verification attempts
  max_attempts INTEGER NOT NULL DEFAULT 5, -- Max attempts before OTP is invalidated
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for auth_requests
CREATE INDEX idx_auth_requests_active ON auth_requests(identifier, channel, created_at DESC) 
  WHERE verified_at IS NULL;
  
CREATE INDEX idx_auth_requests_user ON auth_requests(user_id, created_at DESC) 
  WHERE user_id IS NOT NULL;
  
CREATE INDEX idx_auth_requests_expiry ON auth_requests(code_expires_at) 
  WHERE verified_at IS NULL; -- For cleanup job

CREATE INDEX idx_auth_requests_identifier ON auth_requests(identifier, channel);

-- Trigger for updated_at
CREATE TRIGGER update_auth_requests_updated_at
  BEFORE UPDATE ON auth_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: AUTH TEMPLATES (Message Templates)
-- =====================================================

-- Message templates for OTP delivery across channels
CREATE TABLE IF NOT EXISTS auth_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template identification
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
  template_type TEXT NOT NULL CHECK (template_type IN ('otp', 'invite', 'welcome', 'password_reset', 'resend')),
  
  -- Template name (for admin reference)
  name TEXT NOT NULL, -- e.g., 'otp_email_en', 'otp_sms_hi', 'otp_whatsapp_en'
  
  -- Template content
  subject TEXT, -- For email (optional for SMS/WhatsApp)
  body_template TEXT NOT NULL, -- Template with {{code}}, {{name}}, {{expiry}} placeholders
  
  -- Localization
  language TEXT DEFAULT 'en', -- 'en', 'hi', etc.
  
  -- Template variables (JSONB for dynamic content)
  variables JSONB DEFAULT '{}', -- Additional variables like {{company_name}}, {{support_email}}
  
  -- Template status
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER DEFAULT 0, -- For fallback templates (higher = preferred)
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index: one active template per channel+type+language
-- Using index instead of constraint for better ON CONFLICT support
CREATE UNIQUE INDEX unique_active_template_idx ON auth_templates(channel, template_type, language, is_active);

-- Indexes for auth_templates
CREATE INDEX idx_auth_templates_lookup ON auth_templates(channel, template_type, language, is_active) 
  WHERE is_active = true;
  
CREATE INDEX idx_auth_templates_active ON auth_templates(is_active) 
  WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER update_auth_templates_updated_at
  BEFORE UPDATE ON auth_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: COMMENTS
-- =====================================================

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updated_at timestamp';
COMMENT ON TABLE auth_users IS 'User authentication records with OTP-based verification (auth_ prefix pattern)';
COMMENT ON TABLE auth_requests IS 'OTP requests with hashed codes for multi-channel authentication (auth_ prefix pattern)';
COMMENT ON TABLE auth_templates IS 'Message templates for OTP delivery via email, SMS, and WhatsApp (auth_ prefix pattern)';

COMMENT ON COLUMN auth_requests.code_hash IS 'Hashed OTP code (bcrypt/argon2) - never store plain text';
COMMENT ON COLUMN auth_requests.identifier IS 'Email address or phone number (same phone for SMS and WhatsApp)';
COMMENT ON COLUMN auth_requests.channel IS 'Delivery channel: email, sms, or whatsapp';
COMMENT ON COLUMN auth_requests.request_type IS 'Purpose: verify_email or verify_phone (no separate login/signup/password_reset)';

COMMENT ON COLUMN auth_templates.body_template IS 'Template with placeholders: {{code}}, {{name}}, {{expiry}}, etc.';
COMMENT ON COLUMN auth_templates.variables IS 'Additional template variables in JSON format';

-- =====================================================
-- SECTION 5: DEFAULT TEMPLATES (Seed Data)
-- =====================================================

-- Insert default OTP templates (can be customized later via admin)
INSERT INTO auth_templates (channel, template_type, name, subject, body_template, language, is_active, priority)
VALUES
  -- Email OTP
  ('email', 'otp', 'otp_email_en', 'Your PoultryCo Verification Code', 
   'Hello,\n\nYour verification code is: {{code}}\n\nThis code will expire in {{expiry}} minutes.\n\nIf you did not request this code, please ignore this email.\n\nBest regards,\nPoultryCo Team', 
   'en', true, 10),
   
  -- SMS OTP
  ('sms', 'otp', 'otp_sms_en', NULL,
   'Your PoultryCo verification code is {{code}}. Valid for {{expiry}} minutes. Do not share this code.',
   'en', true, 10),
   
  -- WhatsApp OTP
  ('whatsapp', 'otp', 'otp_whatsapp_en', NULL,
   '🔐 *PoultryCo Verification*\n\nYour verification code is: *{{code}}*\n\nValid for {{expiry}} minutes.\n\n⚠️ Do not share this code with anyone.',
   'en', true, 10)
ON CONFLICT (channel, template_type, language, is_active) DO NOTHING;
