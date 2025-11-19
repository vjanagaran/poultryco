import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL='https://ceknyafzwqlchzxipsqx.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNla255YWZ6d3FsY2h6eGlwc3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzA3MTksImV4cCI6MjA3NTk0NjcxOX0.YMDVN0ilaFuu5mru-UgvY7lINyOQH_fx5YuYPB1-SgQ',
  )
}

