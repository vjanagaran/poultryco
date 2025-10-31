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
          // Extract user data from OAuth metadata
          const metadata = session.user.user_metadata;
          
          // Get full name (Google: name, LinkedIn: full_name)
          const fullName = metadata?.full_name ||
                          metadata?.name ||
                          session.user.email?.split('@')[0] ||
                          'User';
          
          // Get profile photo (Google: picture, LinkedIn: picture or avatar_url)
          const profilePhoto = metadata?.picture || 
                              metadata?.avatar_url || 
                              null;
          
          // Get phone if available
          const phone = session.user.phone || 
                       metadata?.phone || 
                       '';
          
          const phoneVerified = session.user.phone_confirmed_at ? true : false;
          
          // Generate unique slug
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

          // Create profile using RPC function with all available data
          const { data: result, error: rpcError } = await supabase
            .rpc('create_profile_for_user', {
              p_user_id: session.user.id,
              p_full_name: fullName,
              p_email: session.user.email || '',
              p_slug: slug,
              p_profile_photo_url: profilePhoto,
              p_phone: phone,
              p_phone_verified: phoneVerified,
            });

          if (rpcError) {
            console.error('RPC Error creating profile:', rpcError);
          }

          if (!result || result.success === false) {
            console.error('Profile creation failed:', result);
            // Continue anyway - user might still be able to use the platform
          } else {
            console.log('Profile created successfully for OAuth user:', result);
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

