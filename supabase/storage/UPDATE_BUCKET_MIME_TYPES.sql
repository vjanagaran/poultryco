-- =====================================================
-- Update CDN Bucket MIME Types
-- =====================================================
-- Add support for documents, PDFs, and data files

-- Update bucket to allow all necessary file types
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
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
  
  -- Audio (bonus)
  'audio/mpeg',                    -- .mp3
  'audio/wav',                     -- .wav
  'audio/ogg',                     -- .ogg
  'audio/webm'                     -- .webm
]
WHERE id = 'cdn-poultryco';

-- Verify the update
SELECT 
  id,
  name,
  public,
  file_size_limit,
  array_length(allowed_mime_types, 1) as mime_type_count
FROM storage.buckets
WHERE id = 'cdn-poultryco';

-- List all allowed MIME types (for verification)
SELECT unnest(allowed_mime_types) as allowed_mime_type
FROM storage.buckets
WHERE id = 'cdn-poultryco'
ORDER BY allowed_mime_type;

-- =====================================================
-- COMPLETE
-- =====================================================
-- Now supports 54 different file types including:
-- - Images (8 types)
-- - Videos (5 types)
-- - Documents (PDFs, Office, OpenDocument)
-- - Text files (TXT, CSV, Markdown, HTML, etc.)
-- - Data files (JSON, XML, YAML)
-- - Archives (ZIP, RAR, 7Z, etc.)
-- - Audio files (4 types)
-- =====================================================
