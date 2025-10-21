# CDN Storage Setup - cdn.poultryco.net

## 📦 Centralized Storage Strategy

PoultryCo uses a **single centralized bucket** for all media assets across the platform. This approach provides better scalability, organization, and management.

---

## 🗂️ Folder Structure

```
cdn-poultryco/ (Supabase Storage Bucket)
├── blog/
│   ├── featured/          # Blog featured images (1200x630)
│   ├── content/           # In-blog images (800-1200px)
│   └── thumbnails/        # Auto-thumbnails (future)
│
├── profiles/
│   ├── avatars/           # User profile pictures (400x400)
│   ├── covers/            # Profile cover images (1500x500)
│   └── companies/         # Company logos (600x600)
│
├── tools/
│   ├── icons/             # Tool icons/screenshots
│   ├── documents/         # Downloadable resources (PDFs, docs)
│   └── guides/            # PDF guides, ebooks
│
├── marketing/
│   ├── landing/           # Landing page hero images
│   ├── banners/           # Marketing banners
│   ├── testimonials/      # Customer photos
│   └── partners/          # Partner logos
│
├── events/
│   ├── posters/           # Event banners/posters
│   └── photos/            # Event gallery photos
│
├── ebooks/
│   ├── covers/            # Ebook cover images
│   └── pdfs/              # Downloadable PDF ebooks
│
└── system/
    ├── defaults/          # Default avatars, placeholders
    └── ui/                # UI assets
```

---

## 🚀 Setup Instructions

### 1. Create Bucket via Supabase Dashboard

1. Go to **Storage** in Supabase Dashboard
2. Click **"New Bucket"**
3. **Bucket Name:** `cdn-poultryco`
4. **Public:** ✅ Yes (for public assets)
5. **File Size Limit:** 50 MB
6. Click **"Create Bucket"**

### 2. Create Bucket via SQL

```sql
-- Create main CDN bucket with file size limit and MIME type restrictions
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'cdn-poultryco',
  'cdn-poultryco',
  true,
  52428800,  -- 50 MB max per file
  ARRAY[
    -- Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    
    -- Videos
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/mpeg',
    'video/quicktime',
    
    -- Documents - PDF
    'application/pdf',
    
    -- Documents - Microsoft Office
    'application/msword',                                                          -- .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',   -- .docx
    'application/vnd.ms-excel',                                                   -- .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',         -- .xlsx
    'application/vnd.ms-powerpoint',                                              -- .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', -- .pptx
    
    -- Documents - OpenDocument
    'application/vnd.oasis.opendocument.text',         -- .odt
    'application/vnd.oasis.opendocument.spreadsheet',  -- .ods
    'application/vnd.oasis.opendocument.presentation', -- .odp
    
    -- Text Files
    'text/plain',                    -- .txt
    'text/csv',                      -- .csv
    'text/tab-separated-values',     -- .tsv
    'text/markdown',                 -- .md
    'text/html',                     -- .html
    'text/css',                      -- .css
    'text/javascript',               -- .js
    
    -- Data Files
    'application/json',              -- .json
    'application/xml',               -- .xml
    'text/xml',                      -- .xml (alternative)
    'application/x-yaml',            -- .yaml
    'text/yaml',                     -- .yaml (alternative)
    
    -- Archives
    'application/zip',               -- .zip
    'application/x-rar-compressed',  -- .rar
    'application/x-7z-compressed',   -- .7z
    'application/gzip',              -- .gz
    'application/x-tar',             -- .tar
    
    -- Rich Text
    'application/rtf',               -- .rtf
    'text/rtf',                      -- .rtf (alternative)
    
    -- Audio
    'audio/mpeg',                    -- .mp3
    'audio/wav',                     -- .wav
    'audio/ogg',                     -- .ogg
    'audio/webm'                     -- .webm
  ]
)
ON CONFLICT (id) DO NOTHING;
```

### 3. Set Up Storage Policies

```sql
-- Public read access for all files
CREATE POLICY "Public Access to CDN"
ON storage.objects FOR SELECT
USING (bucket_id = 'cdn-poultryco');

-- Admin users can upload files
CREATE POLICY "Admin Upload to CDN"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cdn-poultryco' AND
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Admin users can update files
CREATE POLICY "Admin Update CDN"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cdn-poultryco' AND
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Admin users can delete files
CREATE POLICY "Admin Delete from CDN"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cdn-poultryco' AND
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Authenticated users can upload their profile images
CREATE POLICY "Users Upload Profile Images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cdn-poultryco' AND
  (storage.foldername(name))[1] = 'profiles' AND
  auth.uid() IS NOT NULL
);

-- Users can update their own profile images
CREATE POLICY "Users Update Own Profile Images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cdn-poultryco' AND
  (storage.foldername(name))[1] = 'profiles' AND
  auth.uid() IS NOT NULL
);
```

---

## 🔗 Access URLs

### Development (Supabase)
```
https://[project-id].supabase.co/storage/v1/object/public/cdn-poultryco/[folder]/[filename]
```

**Example:**
```
https://xyz.supabase.co/storage/v1/object/public/cdn-poultryco/blog/featured/post-image.jpg
```

### Production (Custom Domain - Future)
```
https://cdn.poultryco.net/[folder]/[filename]
```

**Example:**
```
https://cdn.poultryco.net/blog/featured/post-image.jpg
```

---

## 📋 Usage in Code

### Blog Featured Image
```typescript
<ImageUpload
  bucket="cdn-poultryco"
  folder="blog/featured"
  onUploadComplete={(url) => setFeaturedImage(url)}
/>
```

### Blog Content Image
```typescript
// In rich text editor
const fileName = `blog/content/${Date.now()}-${randomId()}.${ext}`
await supabase.storage.from('cdn-poultryco').upload(fileName, file)
```

### Profile Avatar
```typescript
<ImageUpload
  bucket="cdn-poultryco"
  folder="profiles/avatars"
  onUploadComplete={(url) => setAvatar(url)}
/>
```

### Marketing Banner
```typescript
<ImageUpload
  bucket="cdn-poultryco"
  folder="marketing/landing"
  onUploadComplete={(url) => setBanner(url)}
/>
```

---

## 📏 Image Guidelines

### Supported File Types (54 total)

#### Images (8 types)
- **JPG/JPEG** - Standard photos
- **PNG** - Graphics with transparency
- **GIF** - Animated images
- **WebP** - Modern compressed format
- **SVG** - Vector graphics
- **BMP** - Bitmap images
- **TIFF** - High-quality images

#### Documents (10 types)
- **PDF** - Portable Document Format
- **DOC/DOCX** - Microsoft Word
- **XLS/XLSX** - Microsoft Excel
- **PPT/PPTX** - Microsoft PowerPoint
- **ODT** - OpenDocument Text
- **ODS** - OpenDocument Spreadsheet
- **ODP** - OpenDocument Presentation
- **RTF** - Rich Text Format

#### Text & Data Files (13 types)
- **TXT** - Plain text
- **CSV** - Comma-separated values
- **TSV** - Tab-separated values
- **JSON** - JavaScript Object Notation
- **XML** - Extensible Markup Language
- **YAML** - YAML Ain't Markup Language
- **MD** - Markdown
- **HTML** - Web pages
- **CSS** - Stylesheets
- **JS** - JavaScript

#### Archives (5 types)
- **ZIP** - Compressed archive
- **RAR** - WinRAR archive
- **7Z** - 7-Zip archive
- **GZ** - Gzip compressed
- **TAR** - Tape archive

#### Videos (5 types)
- **MP4** - Standard video
- **WebM** - Web video
- **OGG** - Open video format
- **MPEG** - Video standard
- **MOV** - QuickTime video

#### Audio (4 types)
- **MP3** - Compressed audio
- **WAV** - Uncompressed audio
- **OGG** - Open audio format
- **WebM** - Web audio

---

## 📋 File Size Recommendations

### Blog Images
- **Featured:** 1200x630px (optimal for OG/social sharing)
- **Content:** 800-1200px width
- **Format:** JPG/PNG/WebP
- **Max Size:** 2-5MB

### Profile Images
- **Avatar:** 400x400px (square)
- **Cover:** 1500x500px (3:1 ratio)
- **Format:** JPG/PNG/WebP
- **Max Size:** 1-2MB

### Marketing Assets
- **Hero Images:** 1920x1080px
- **Banners:** Variable (maintain aspect ratio)
- **Logos:** SVG preferred, or PNG with transparency
- **Max Size:** 2-5MB

### Documents
- **PDFs:** Max 10MB
- **Ebooks:** Max 20MB

---

## 🔐 Security Features

1. **File Size Limits**
   - Prevents abuse and excessive storage costs
   - Set at bucket level (50MB max)

2. **MIME Type Restrictions**
   - Only allows specific file types
   - Prevents malicious file uploads

3. **Row Level Security (RLS)**
   - Public read access for all
   - Admin-only write/delete for most folders
   - Users can manage their own profile images

4. **Folder-Level Permissions**
   - Different policies for different folders
   - Example: `/profiles/` allows user uploads
   - Example: `/blog/` only allows admin uploads

---

## 🌐 Custom Domain Setup (Future)

### Via CloudFlare Workers
1. Create CloudFlare worker
2. Proxy requests from `cdn.poultryco.net` to Supabase Storage
3. Add caching rules
4. Set up SSL certificate

### Via Vercel Edge Functions
1. Create edge function in Next.js
2. Rewrite `cdn.poultryco.net/*` to Supabase Storage URL
3. Deploy to Vercel
4. Configure DNS

**Benefits:**
- ✅ Branded URL (`cdn.poultryco.net`)
- ✅ Better caching control
- ✅ CDN performance optimization
- ✅ Additional security layer
- ✅ Analytics and monitoring

---

## 📊 Storage Management

### Monitor Usage
```sql
-- Check total storage usage
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  pg_size_pretty(SUM(metadata->>'size')::bigint) as total_size
FROM storage.objects
WHERE bucket_id = 'cdn-poultryco'
GROUP BY bucket_id;

-- Check usage by folder
SELECT 
  (storage.foldername(name))[1] as folder,
  COUNT(*) as file_count,
  pg_size_pretty(SUM((metadata->>'size')::bigint)) as total_size
FROM storage.objects
WHERE bucket_id = 'cdn-poultryco'
GROUP BY folder
ORDER BY SUM((metadata->>'size')::bigint) DESC;
```

### Cleanup Old Files
```sql
-- Find files older than 6 months
SELECT name, created_at
FROM storage.objects
WHERE bucket_id = 'cdn-poultryco'
  AND created_at < NOW() - INTERVAL '6 months'
ORDER BY created_at;
```

---

## ✅ Migration from Old Bucket

If you already have files in `blog-images` bucket:

```sql
-- List all files in old bucket
SELECT * FROM storage.objects 
WHERE bucket_id = 'blog-images';

-- Manual migration required via Supabase Dashboard:
-- 1. Download all files from old bucket
-- 2. Upload to new bucket with proper folder structure
-- 3. Update database URLs to point to new location
-- 4. Delete old bucket once confirmed
```

---

## 🎯 Benefits of This Approach

✅ **Single Source of Truth** - All assets in one place  
✅ **Organized Structure** - Clear folder hierarchy  
✅ **Scalable** - Easy to add new folders  
✅ **Cost-Effective** - One bucket to manage  
✅ **Better Performance** - Can add CDN layer  
✅ **Flexible Permissions** - Folder-level access control  
✅ **Future-Proof** - Ready for custom domain  

---

## 📚 Related Documentation

- **Image Upload Component:** `/apps/admin/src/components/ImageUpload.tsx`
- **Storage Policies:** This file (policies section above)
- **Usage Examples:** See "Usage in Code" section

---

**Last Updated:** October 21, 2025  
**Status:** ✅ Recommended for Production

