-- =====================================================
-- PoultryCo AWS Database Schema
-- File: seeds/01_reference_data.sql
-- Description: Seed data for reference tables (excluding countries/states)
-- Version: 2.0
-- Date: 2025-12-01
-- Note: Countries and states are in seeds/00_countries_states.sql
-- =====================================================

-- =====================================================
-- SECTION 2: ROLES
-- =====================================================

INSERT INTO ref_roles (name, slug, description, category, is_active) VALUES
-- Primary Roles
('Farmer', 'farmer', 'Poultry farm owner or operator', 'primary', true),
('Feed Supplier', 'feed-supplier', 'Animal feed manufacturer or supplier', 'primary', true),
('Equipment Supplier', 'equipment-supplier', 'Poultry equipment supplier', 'primary', true),
('Veterinarian', 'veterinarian', 'Veterinary doctor specializing in poultry', 'primary', true),
('Consultant', 'consultant', 'Poultry business consultant', 'primary', true),
('Trader', 'trader', 'Poultry and egg trader', 'primary', true),

-- Secondary Roles
('Hatchery Owner', 'hatchery-owner', 'Day-old chick hatchery owner', 'secondary', true),
('Processing Unit Owner', 'processing-unit-owner', 'Poultry processing facility owner', 'secondary', true),
('Researcher', 'researcher', 'Poultry research professional', 'secondary', true),
('Student', 'student', 'Student of poultry science or related field', 'secondary', true),
('Government Official', 'government-official', 'Government agriculture/animal husbandry official', 'secondary', true),
('Association Member', 'association-member', 'Member of poultry association', 'secondary', true),
('Investor', 'investor', 'Investor in poultry industry', 'secondary', true),
('Service Provider', 'service-provider', 'Other poultry-related service provider', 'secondary', true)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SECTION 3: BUSINESS TYPES
-- =====================================================

INSERT INTO ref_business_types (name, slug, description, is_active) VALUES
('Layer Farm', 'layer-farm', 'Egg-laying poultry farm', true),
('Broiler Farm', 'broiler-farm', 'Meat chicken farm', true),
('Breeder Farm', 'breeder-farm', 'Parent stock breeding farm', true),
('Hatchery', 'hatchery', 'Day-old chick hatchery', true),
('Feed Mill', 'feed-mill', 'Animal feed manufacturing unit', true),
('Equipment Supplier', 'equipment-supplier', 'Poultry equipment supplier', true),
('Veterinary Clinic', 'veterinary-clinic', 'Veterinary services provider', true),
('Processing Plant', 'processing-plant', 'Poultry meat processing facility', true),
('Trading Company', 'trading-company', 'Poultry and egg trading business', true),
('Consultancy', 'consultancy', 'Poultry consultancy services', true),
('Laboratory', 'laboratory', 'Poultry diagnostic laboratory', true),
('Integrator', 'integrator', 'Integrated poultry company', true)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SECTION 4: ORGANIZATION TYPES
-- =====================================================

INSERT INTO ref_organization_types (name, slug, description, is_active) VALUES
('Poultry Association', 'poultry-association', 'Industry association or federation', true),
('Cooperative Society', 'cooperative-society', 'Farmer cooperative society', true),
('Research Institute', 'research-institute', 'Research and development institution', true),
('Educational Institute', 'educational-institute', 'University or training center', true),
('Government Body', 'government-body', 'Government department or agency', true),
('NGO', 'ngo', 'Non-governmental organization', true),
('Trade Union', 'trade-union', 'Workers trade union', true),
('Professional Body', 'professional-body', 'Professional membership organization', true)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SECTION 5: EVENT TYPES
-- =====================================================

INSERT INTO ref_event_types (name, slug, description, is_active) VALUES
('Conference', 'conference', 'Industry conference or summit', true),
('Workshop', 'workshop', 'Training workshop or seminar', true),
('Webinar', 'webinar', 'Online webinar or virtual event', true),
('Trade Show', 'trade-show', 'Exhibition or trade fair', true),
('Meetup', 'meetup', 'Local networking meetup', true),
('Farm Visit', 'farm-visit', 'Farm tour or visit', true),
('Training Program', 'training-program', 'Educational training program', true),
('AGM', 'agm', 'Annual General Meeting', true),
('Auction', 'auction', 'Livestock or equipment auction', true),
('Competition', 'competition', 'Poultry show or competition', true)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SECTION 6: JOB CATEGORIES
-- =====================================================

INSERT INTO ref_job_categories (name, slug, description, is_active) VALUES
('Farm Management', 'farm-management', 'Farm manager and supervisor roles', true),
('Veterinary', 'veterinary', 'Veterinary and animal health roles', true),
('Technical', 'technical', 'Technical and engineering roles', true),
('Sales & Marketing', 'sales-marketing', 'Sales and marketing positions', true),
('Operations', 'operations', 'Operations and production roles', true),
('Quality Control', 'quality-control', 'Quality assurance and control', true),
('Research & Development', 'research-development', 'R&D and innovation roles', true),
('Administration', 'administration', 'Administrative and office roles', true),
('Finance & Accounts', 'finance-accounts', 'Finance and accounting positions', true),
('Human Resources', 'human-resources', 'HR and training roles', true)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SECTION 7: SKILLS
-- =====================================================

INSERT INTO ref_skills (name, slug, category, is_active) VALUES
-- Technical Skills
('Poultry Farming', 'poultry-farming', 'technical', true),
('Layer Management', 'layer-management', 'technical', true),
('Broiler Management', 'broiler-management', 'technical', true),
('Hatchery Management', 'hatchery-management', 'technical', true),
('Feed Formulation', 'feed-formulation', 'technical', true),
('Disease Management', 'disease-management', 'technical', true),
('Biosecurity', 'biosecurity', 'technical', true),
('Vaccination', 'vaccination', 'technical', true),
('Breeding', 'breeding', 'technical', true),
('Nutrition', 'nutrition', 'technical', true),

-- Business Skills
('Farm Management', 'farm-management', 'business', true),
('Business Planning', 'business-planning', 'business', true),
('Financial Management', 'financial-management', 'business', true),
('Marketing', 'marketing', 'business', true),
('Sales', 'sales', 'business', true),
('Supply Chain', 'supply-chain', 'business', true),

-- Soft Skills
('Leadership', 'leadership', 'soft', true),
('Team Management', 'team-management', 'soft', true),
('Communication', 'communication', 'soft', true),
('Problem Solving', 'problem-solving', 'soft', true)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SECTION 8: NOTIFICATION TYPES
-- =====================================================

INSERT INTO ref_notification_types (name, slug, description, is_active) VALUES
('Connection Request', 'connection-request', 'New connection request received', true),
('Connection Accepted', 'connection-accepted', 'Connection request accepted', true),
('New Message', 'new-message', 'New message received', true),
('Post Like', 'post-like', 'Someone liked your post', true),
('Post Comment', 'post-comment', 'Someone commented on your post', true),
('Comment Reply', 'comment-reply', 'Someone replied to your comment', true),
('Post Mention', 'post-mention', 'You were mentioned in a post', true),
('Event Invitation', 'event-invitation', 'Invited to an event', true),
('Event Reminder', 'event-reminder', 'Upcoming event reminder', true),
('Resource Published', 'resource-published', 'New resource published', true),
('Job Application', 'job-application', 'New job application received', true),
('Profile View', 'profile-view', 'Someone viewed your profile', true),
('System Update', 'system-update', 'System update or announcement', true)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SECTION 9: ADMIN ROLES
-- =====================================================

INSERT INTO adm_roles (name, description, level, permissions, is_active) VALUES
('Super Admin', 'Full system access', 0, '{
  "users": {"view": true, "create": true, "edit": true, "delete": true, "ban": true},
  "content": {"view": true, "create": true, "edit": true, "delete": true, "moderate": true},
  "settings": {"view": true, "edit": true},
  "analytics": {"view": true},
  "admin": {"view": true, "create": true, "edit": true, "delete": true}
}'::jsonb, true),

('Admin', 'General administrative access', 1, '{
  "users": {"view": true, "create": false, "edit": true, "delete": false, "ban": true},
  "content": {"view": true, "create": true, "edit": true, "delete": true, "moderate": true},
  "settings": {"view": true, "edit": false},
  "analytics": {"view": true},
  "admin": {"view": true, "create": false, "edit": false, "delete": false}
}'::jsonb, true),

('Moderator', 'Content moderation access', 2, '{
  "users": {"view": true, "create": false, "edit": false, "delete": false, "ban": false},
  "content": {"view": true, "create": false, "edit": false, "delete": true, "moderate": true},
  "settings": {"view": false, "edit": false},
  "analytics": {"view": true},
  "admin": {"view": false, "create": false, "edit": false, "delete": false}
}'::jsonb, true),

('Support', 'Customer support access', 3, '{
  "users": {"view": true, "create": false, "edit": false, "delete": false, "ban": false},
  "content": {"view": true, "create": false, "edit": false, "delete": false, "moderate": false},
  "settings": {"view": false, "edit": false},
  "analytics": {"view": false},
  "admin": {"view": false, "create": false, "edit": false, "delete": false}
}'::jsonb, true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SECTION 10: SYSTEM SETTINGS
-- =====================================================

INSERT INTO adm_system_settings (key, value, description, category, is_public) VALUES
('platform.name', '"PoultryCo"', 'Platform name', 'general', true),
('platform.tagline', '"India''s Poultry Professional Network"', 'Platform tagline', 'general', true),
('platform.version', '"2.0.0"', 'Platform version', 'general', true),
('platform.launch_date', '"2025-03-01"', 'Platform launch date', 'general', true),

('features.marketplace_enabled', 'false', 'Enable marketplace features', 'features', false),
('features.jobs_enabled', 'true', 'Enable jobs features', 'features', false),
('features.events_enabled', 'true', 'Enable events features', 'features', false),
('features.resources_enabled', 'true', 'Enable resources features', 'features', false),
('features.messaging_enabled', 'true', 'Enable messaging features', 'features', false),

('limits.max_connections', '5000', 'Maximum connections per user', 'limits', false),
('limits.max_post_length', '5000', 'Maximum post content length', 'limits', false),
('limits.max_message_length', '2000', 'Maximum message length', 'limits', false),
('limits.max_file_size_mb', '10', 'Maximum file upload size in MB', 'limits', false),

('email.from_address', '"noreply@poultryco.in"', 'Default from email address', 'email', false),
('email.from_name', '"PoultryCo"', 'Default from name', 'email', false),
('email.support_address', '"support@poultryco.in"', 'Support email address', 'email', true),

('seo.meta_title', '"PoultryCo - India''s Poultry Professional Network"', 'Default meta title', 'seo', true),
('seo.meta_description', '"Connect with poultry professionals, farmers, suppliers, and experts across India. Join PoultryCo for networking, resources, and business opportunities."', 'Default meta description', 'seo', true)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- Comments
-- =====================================================

-- Seed data successfully loaded

