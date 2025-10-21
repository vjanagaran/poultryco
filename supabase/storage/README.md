# Supabase Storage Setup for Blog Images

## Required Storage Bucket

The blog CMS requires a Supabase Storage bucket named `blog-images` for storing:
- Featured images for blog posts
- In-content images uploaded via the rich text editor

## Setup Instructions

### Via Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"Create a new bucket"**
4. Enter bucket name: `blog-images`
5. Set as **Public bucket** (for public blog post images)
6. Click **"Create bucket"**

### Via SQL:

Run this SQL in your Supabase SQL Editor:

```sql
-- Create blog-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for blog-images bucket
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Allow authenticated admins to upload
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
);

-- Allow authenticated admins to update
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images' AND
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
);

-- Allow authenticated admins to delete
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images' AND
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
);
```

## Folder Structure

The blog CMS automatically organizes images into folders:

```
blog-images/
├── featured/          # Featured images for posts
└── content/           # Images uploaded in post content
```

## Image Guidelines

- **Maximum file size:** 5MB
- **Supported formats:** JPG, PNG, GIF, WebP
- **Recommended dimensions:**
  - Featured images: 1200x630px (OG image size)
  - Content images: 800-1200px width

## Access URLs

Images are served via Supabase's public CDN:

```
https://[project-id].supabase.co/storage/v1/object/public/blog-images/[path]
```

## Security Notes

- The bucket is public for read access (blog posts are public)
- Only authenticated admin users can upload/modify images
- File size and type validation is done on the client side
- Additional server-side validation can be added via Storage Rules if needed

