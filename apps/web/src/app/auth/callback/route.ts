import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function generateSlug(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error('Session exchange error:', sessionError);
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }

    if (session?.user) {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();

      // If no profile exists, create one (fallback for OAuth users)
      if (!existingProfile) {
        try {
          const fullName = session.user.user_metadata?.full_name ||
                          session.user.user_metadata?.name ||
                          session.user.email?.split('@')[0] ||
                          'User';
          
          const baseSlug = generateSlug(fullName);
          let slug = baseSlug;
          let counter = 1;

          // Make slug unique
          while (true) {
            const { data: existing } = await supabase
              .from('profiles')
              .select('profile_slug')
              .eq('profile_slug', slug)
              .single();

            if (!existing) break;
            
            slug = `${baseSlug}-${counter}`;
            counter++;
          }

          // Create profile using RPC function
          const { data: result } = await supabase
            .rpc('create_profile_for_user', {
              p_user_id: session.user.id,
              p_full_name: fullName,
              p_email: session.user.email,
              p_slug: slug,
            });

          if (!result || result.success === false) {
            console.error('Profile creation failed:', result);
            // Continue anyway - profile might have been created by trigger
          }
        } catch (error) {
          console.error('Error creating profile for OAuth user:', error);
          // Continue anyway - user might still be able to use the platform
        }
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}

