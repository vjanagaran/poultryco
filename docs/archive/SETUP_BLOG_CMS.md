# 🚀 Blog CMS Setup Guide

Quick setup guide to get the enhanced Blog CMS running.

---

## ✅ Prerequisites

- Supabase project already set up
- Admin portal already installed (`apps/admin`)
- Admin user already created

---

## 📋 Setup Steps

### Step 1: Run Database Migration

Go to your **Supabase SQL Editor** and run:

```sql
-- Located at: /supabase/schema/14_marketing_cms.sql
-- This creates 7 tables:
-- - blog_categories
-- - blog_tags
-- - blog_posts
-- - blog_post_tags
-- - early_access_signups
-- - newsletter_subscribers
-- - contact_submissions
```

Copy and paste the entire contents of `/supabase/schema/14_marketing_cms.sql` into the SQL Editor and execute.

### Step 2: Create Supabase Storage Bucket

**Option A - Via Dashboard:**
1. Go to **Storage** in Supabase Dashboard
2. Click **"New Bucket"**
3. Name: `blog-images`
4. Set as **Public** ✅
5. Click **"Create"**

**Option B - Via SQL:**
```sql
-- Create blog-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Admin upload access
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
);

-- Admin update access
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images' AND
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
);

-- Admin delete access
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images' AND
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
);
```

### Step 3: Start the Admin Portal

```bash
cd apps/admin
npm run dev
```

Admin portal will be available at: `http://localhost:3001`

---

## 🎯 Usage

### Creating Your First Category

1. Navigate to **Admin Portal** → **Categories**
2. Click **"+ New Category"**
3. Fill in:
   - **Name**: e.g., "Industry News"
   - **Slug**: Auto-generated (or customize)
   - **Description**: Brief description
   - **Color**: Pick a brand color
   - **Icon**: Add an emoji like 📰
4. Click **"Create Category"**

### Creating Your First Blog Post

1. Navigate to **Admin Portal** → **Blog Posts**
2. Click **"+ New Post"**
3. **Write your post:**
   - Enter a compelling title
   - Write content using the rich text editor
   - Format text (bold, italic, headings)
   - Add images by clicking the 🖼️ button
   - Add links by clicking the 🔗 button
4. **Add details:**
   - Upload a featured image
   - Write an excerpt
   - Select a category
   - Add tags (type to search or create new)
5. **Optimize:**
   - Add SEO meta title & description
   - Review word count & reading time
6. **Publish:**
   - **Save Draft** - Save for later
   - **Schedule** - Set future date/time
   - **Publish Now** - Go live immediately

---

## 📝 Features Overview

### ✅ Rich Text Editor
- **Formatting**: Bold, italic, strikethrough
- **Structure**: Headings (H1-H3), lists, quotes
- **Media**: Upload images directly
- **Links**: Add custom URLs
- **Actions**: Undo/redo

### ✅ Categories
- Create unlimited categories
- Assign colors for visual organization
- Add icons (emojis or text)
- Track post count per category

### ✅ Tags
- Autocomplete from existing tags
- Create new tags on-the-fly
- Multiple tags per post
- Keyboard shortcuts

### ✅ Images
- **Featured Image**: Main post image
- **Content Images**: Upload via editor
- **Storage**: Supabase Storage
- **Validation**: Max 5MB, image formats only

### ✅ Scheduling
- **Draft**: Work in progress
- **Scheduled**: Publish at specific time
- **Published**: Live immediately

> **Note:** Auto-publishing scheduled posts requires a cron job/Edge Function (not yet implemented).

### ✅ SEO
- Meta title & description
- Auto-generated slugs
- Word count & reading time
- Full-text search indexing

---

## 🔧 Troubleshooting

### Images not uploading?
- ✅ Verify `blog-images` bucket exists
- ✅ Check bucket is set to **Public**
- ✅ Verify storage policies are created
- ✅ Check browser console for errors

### Can't see blog posts?
- ✅ Run the migration script
- ✅ Check database has all tables
- ✅ Verify you're logged in as admin
- ✅ Check browser console for errors

### Categories not showing?
- ✅ Create at least one category first
- ✅ Verify category is marked as "Active"
- ✅ Check the categories table in database

### Rich text editor not loading?
- ✅ Ensure `@tiptap/*` packages are installed
- ✅ Run `npm install` from admin folder
- ✅ Restart dev server
- ✅ Clear browser cache

---

## 📚 Documentation

- **Full Feature Guide**: `/BLOG_CMS_ENHANCED.md`
- **Storage Setup**: `/supabase/storage/README.md`
- **Database Schema**: `/supabase/schema/14_marketing_cms.sql`
- **Current Status**: `/docs/CURRENT_STATUS.md`

---

## 🎉 You're Ready!

Your Blog CMS is now fully set up and ready to use!

**Next Steps:**
1. Create 2-3 categories for content organization
2. Create your first blog post
3. Test the rich text editor features
4. Upload some images
5. Publish or schedule your first post

**Admin Portal**: `http://localhost:3001`

---

**Need Help?** Check the documentation or review the component source code in `/apps/admin/src/components/`

