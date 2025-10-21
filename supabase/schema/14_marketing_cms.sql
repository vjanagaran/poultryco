-- =====================================================
-- PoultryCo - Marketing & CMS Schema
-- =====================================================
-- This migration creates tables for:
-- 1. Blog posts, categories, tags
-- 2. Early access signups
-- 3. Newsletter subscribers
-- 4. Contact form submissions
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- BLOG CATEGORIES
-- =====================================================
CREATE TABLE public.blog_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  color text, -- For UI display
  icon text, -- Icon name or emoji
  post_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_blog_categories_slug ON public.blog_categories (slug);
CREATE INDEX idx_blog_categories_is_active ON public.blog_categories (is_active);

-- =====================================================
-- BLOG TAGS
-- =====================================================
CREATE TABLE public.blog_tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  post_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_blog_tags_slug ON public.blog_tags (slug);

-- =====================================================
-- BLOG POSTS
-- =====================================================
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL, -- Rich text content (HTML or Markdown)
  
  -- SEO
  meta_title text,
  meta_description text,
  meta_keywords text[],
  og_image text, -- Open Graph image URL
  
  -- Featured Image
  featured_image text, -- Image URL
  featured_image_alt text,
  
  -- Categorization
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  
  -- Author
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text, -- Cached for performance
  
  -- Status & Publishing
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  published_at timestamptz,
  scheduled_for timestamptz,
  
  -- Engagement Metrics
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  
  -- Reading Stats
  reading_time_minutes integer, -- Estimated reading time
  word_count integer,
  
  -- Featured & Pinned
  is_featured boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  featured_order integer, -- For ordering featured posts
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Search
  search_vector tsvector -- For full-text search
);

-- Indexes
CREATE INDEX idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts (status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts (published_at DESC);
CREATE INDEX idx_blog_posts_category_id ON public.blog_posts (category_id);
CREATE INDEX idx_blog_posts_author_id ON public.blog_posts (author_id);
CREATE INDEX idx_blog_posts_is_featured ON public.blog_posts (is_featured);
CREATE INDEX idx_blog_posts_is_pinned ON public.blog_posts (is_pinned);
CREATE INDEX idx_blog_posts_search_vector ON public.blog_posts USING gin(search_vector);

-- Full-text search trigger
CREATE OR REPLACE FUNCTION public.blog_posts_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_search_update
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.blog_posts_search_trigger();

-- =====================================================
-- BLOG POST TAGS (Many-to-Many)
-- =====================================================
CREATE TABLE public.blog_post_tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES public.blog_tags(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(post_id, tag_id)
);

CREATE INDEX idx_blog_post_tags_post_id ON public.blog_post_tags (post_id);
CREATE INDEX idx_blog_post_tags_tag_id ON public.blog_post_tags (tag_id);

-- =====================================================
-- EARLY ACCESS SIGNUPS
-- =====================================================
CREATE TABLE public.early_access_signups (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact Info
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  
  -- Professional Info
  role text, -- e.g., 'farmer', 'vet', 'business'
  company_name text,
  country text,
  
  -- Interests
  interested_in text[], -- Array of features they're interested in
  message text, -- Additional comments
  
  -- Source Tracking
  source text, -- Where they found us (utm_source)
  utm_campaign text,
  utm_medium text,
  referrer text,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'invited', 'registered', 'rejected')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Admin Notes
  admin_notes text,
  assigned_to uuid REFERENCES public.admin_users(id),
  
  -- Engagement
  email_sent boolean DEFAULT false,
  email_sent_at timestamptz,
  invite_code text UNIQUE,
  invite_accepted_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_early_access_email ON public.early_access_signups (email);
CREATE INDEX idx_early_access_status ON public.early_access_signups (status);
CREATE INDEX idx_early_access_priority ON public.early_access_signups (priority);
CREATE INDEX idx_early_access_created_at ON public.early_access_signups (created_at DESC);
CREATE INDEX idx_early_access_invite_code ON public.early_access_signups (invite_code);

-- =====================================================
-- NEWSLETTER SUBSCRIBERS
-- =====================================================
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact Info
  email text NOT NULL UNIQUE,
  full_name text,
  
  -- Preferences
  subscribed_topics text[], -- Topics they're interested in
  frequency text DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  
  -- Status
  status text DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained')),
  double_opt_in boolean DEFAULT false,
  confirmed_at timestamptz,
  
  -- Source Tracking
  source text, -- Where they subscribed from
  utm_campaign text,
  utm_medium text,
  utm_source text,
  referrer text,
  
  -- Engagement Metrics
  emails_sent integer DEFAULT 0,
  emails_opened integer DEFAULT 0,
  emails_clicked integer DEFAULT 0,
  last_email_sent_at timestamptz,
  last_email_opened_at timestamptz,
  
  -- Unsubscribe Info
  unsubscribed_at timestamptz,
  unsubscribe_reason text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers (email);
CREATE INDEX idx_newsletter_status ON public.newsletter_subscribers (status);
CREATE INDEX idx_newsletter_created_at ON public.newsletter_subscribers (created_at DESC);

-- =====================================================
-- CONTACT FORM SUBMISSIONS
-- =====================================================
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact Info
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company_name text,
  
  -- Inquiry Details
  subject text NOT NULL,
  message text NOT NULL,
  inquiry_type text, -- e.g., 'general', 'support', 'partnership', 'sales'
  
  -- Status & Priority
  status text DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'in_progress', 'resolved', 'spam')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Assignment
  assigned_to uuid REFERENCES public.admin_users(id),
  assigned_at timestamptz,
  
  -- Response
  replied_by uuid REFERENCES public.admin_users(id),
  replied_at timestamptz,
  reply_message text,
  
  -- Admin Notes
  admin_notes text,
  tags text[], -- For categorization
  
  -- Source Tracking
  source text, -- Contact page, footer, etc.
  user_agent text, -- Browser info
  ip_address text, -- For spam detection
  referrer text,
  
  -- Engagement
  follow_up_required boolean DEFAULT false,
  follow_up_date date,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  resolved_at timestamptz
);

-- Indexes
CREATE INDEX idx_contact_email ON public.contact_submissions (email);
CREATE INDEX idx_contact_status ON public.contact_submissions (status);
CREATE INDEX idx_contact_priority ON public.contact_submissions (priority);
CREATE INDEX idx_contact_created_at ON public.contact_submissions (created_at DESC);
CREATE INDEX idx_contact_assigned_to ON public.contact_submissions (assigned_to);
CREATE INDEX idx_contact_inquiry_type ON public.contact_submissions (inquiry_type);

-- =====================================================
-- TRIGGER FUNCTIONS
-- =====================================================

-- Update category post count
CREATE OR REPLACE FUNCTION public.update_category_post_count() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'published' AND NEW.category_id IS NOT NULL THEN
    UPDATE public.blog_categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.category_id IS DISTINCT FROM NEW.category_id OR OLD.status IS DISTINCT FROM NEW.status THEN
      -- Decrement old category if published
      IF OLD.status = 'published' AND OLD.category_id IS NOT NULL THEN
        UPDATE public.blog_categories SET post_count = post_count - 1 WHERE id = OLD.category_id;
      END IF;
      -- Increment new category if published
      IF NEW.status = 'published' AND NEW.category_id IS NOT NULL THEN
        UPDATE public.blog_categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'published' AND OLD.category_id IS NOT NULL THEN
    UPDATE public.blog_categories SET post_count = post_count - 1 WHERE id = OLD.category_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_category_count
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_category_post_count();

-- Update tag post count
CREATE OR REPLACE FUNCTION public.update_tag_post_count() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.blog_tags SET post_count = post_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.blog_tags SET post_count = post_count - 1 WHERE id = OLD.tag_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_post_tags_count
  AFTER INSERT OR DELETE ON public.blog_post_tags
  FOR EACH ROW EXECUTE FUNCTION public.update_tag_post_count();

-- Update timestamps function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamps triggers
CREATE TRIGGER handle_updated_at_blog_categories 
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER handle_updated_at_blog_tags 
  BEFORE UPDATE ON public.blog_tags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER handle_updated_at_blog_posts 
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER handle_updated_at_early_access 
  BEFORE UPDATE ON public.early_access_signups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER handle_updated_at_newsletter 
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER handle_updated_at_contact 
  BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.early_access_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Blog Categories (Public read, admin write)
CREATE POLICY "Anyone can view active categories" ON public.blog_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.blog_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

-- Blog Tags (Public read, admin write)
CREATE POLICY "Anyone can view tags" ON public.blog_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tags" ON public.blog_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

-- Blog Posts (Public read published, admin full access)
CREATE POLICY "Anyone can view published posts" ON public.blog_posts
  FOR SELECT USING (status = 'published' AND published_at <= now());

CREATE POLICY "Admins can manage all posts" ON public.blog_posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

-- Blog Post Tags (Public read, admin write)
CREATE POLICY "Anyone can view post tags" ON public.blog_post_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage post tags" ON public.blog_post_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

-- Early Access (Public insert, admin full access)
CREATE POLICY "Anyone can sign up for early access" ON public.early_access_signups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view and manage early access" ON public.early_access_signups
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

-- Newsletter (Public insert/update own, admin full access)
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own subscription" ON public.newsletter_subscribers
  FOR UPDATE USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Admins can manage all subscribers" ON public.newsletter_subscribers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

-- Contact Submissions (Public insert, admin full access)
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view and manage contacts" ON public.contact_submissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Generate unique slug
CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_slug text, table_name text) 
RETURNS text AS $$
DECLARE
  new_slug text := base_slug;
  counter integer := 1;
  slug_exists boolean;
BEGIN
  LOOP
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1)', table_name)
    INTO slug_exists
    USING new_slug;
    
    EXIT WHEN NOT slug_exists;
    
    new_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default blog categories
INSERT INTO public.blog_categories (name, slug, description, color) VALUES
  ('Industry News', 'industry-news', 'Latest news and trends in the poultry industry', '#2B7A4B'),
  ('Best Practices', 'best-practices', 'Tips and guides for poultry professionals', '#3A9B60'),
  ('Technology', 'technology', 'Innovation and technology in poultry farming', '#E67E22'),
  ('Health & Nutrition', 'health-nutrition', 'Poultry health, disease prevention, and nutrition', '#E74C3C'),
  ('Success Stories', 'success-stories', 'Real stories from our community members', '#3498DB'),
  ('Events & Webinars', 'events-webinars', 'Upcoming events and webinar recordings', '#9B59B6')
ON CONFLICT (slug) DO NOTHING;

-- Insert common tags
INSERT INTO public.blog_tags (name, slug) VALUES
  ('Farming', 'farming'),
  ('Veterinary', 'veterinary'),
  ('Business', 'business'),
  ('Sustainability', 'sustainability'),
  ('Organic', 'organic'),
  ('Disease Prevention', 'disease-prevention'),
  ('Feed Management', 'feed-management'),
  ('Market Trends', 'market-trends'),
  ('Export', 'export'),
  ('Community', 'community')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- VIEWS FOR ADMIN DASHBOARD
-- =====================================================

-- Blog stats view
CREATE OR REPLACE VIEW public.blog_stats AS
SELECT
  (SELECT COUNT(*) FROM public.blog_posts WHERE status = 'published') as published_posts,
  (SELECT COUNT(*) FROM public.blog_posts WHERE status = 'draft') as draft_posts,
  (SELECT COUNT(*) FROM public.blog_posts WHERE status = 'scheduled') as scheduled_posts,
  (SELECT COUNT(*) FROM public.blog_categories WHERE is_active = true) as active_categories,
  (SELECT COUNT(*) FROM public.blog_tags) as total_tags,
  (SELECT SUM(view_count) FROM public.blog_posts) as total_views;

-- Marketing stats view
CREATE OR REPLACE VIEW public.marketing_stats AS
SELECT
  (SELECT COUNT(*) FROM public.early_access_signups WHERE status = 'pending') as pending_signups,
  (SELECT COUNT(*) FROM public.early_access_signups WHERE status = 'approved') as approved_signups,
  (SELECT COUNT(*) FROM public.newsletter_subscribers WHERE status = 'active') as active_subscribers,
  (SELECT COUNT(*) FROM public.contact_submissions WHERE status = 'new') as new_contacts,
  (SELECT COUNT(*) FROM public.contact_submissions WHERE status = 'in_progress') as in_progress_contacts;

-- =====================================================
-- COMPLETE
-- =====================================================
-- Migration 14: Marketing & CMS Schema Complete
-- Tables: 7 (blog_categories, blog_tags, blog_posts, blog_post_tags, early_access_signups, newsletter_subscribers, contact_submissions)
-- Triggers: 9
-- Functions: 6
-- Views: 2
-- =====================================================

