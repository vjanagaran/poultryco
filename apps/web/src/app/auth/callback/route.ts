import { NextResponse } from 'next/server';
import { getCurrentSession, getCurrentUser } from '@/lib/auth/cognito';
import { apiClient } from '@/lib/api/client';

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
    try {
      // Exchange authorization code for tokens
      // Cognito handles this automatically via the redirect
      // We just need to validate the session
      const session = await getCurrentSession();
      
      if (session && session.isValid()) {
        const idToken = session.getIdToken().getJwtToken();
        
        // Validate token with API and get app JWT
        try {
          const result = await apiClient.post<{
            accessToken: string;
            user: {
              id: string;
              email: string;
              profile?: any;
            };
          }>('/auth/cognito/validate', {
            token: idToken,
          });

          // Store app token
          apiClient.setToken(result.accessToken);

          // If profile doesn't exist, it will be created by the API
          // The API's validateCognitoToken method handles profile creation
          
          return NextResponse.redirect(new URL(next, request.url));
        } catch (error: any) {
          console.error('Token validation error:', error);
          return NextResponse.redirect(new URL(`/login?error=auth_failed`, request.url));
        }
      } else {
        // No valid session, redirect to login
        return NextResponse.redirect(new URL('/login?error=no_session', request.url));
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }
  }

  // No code parameter, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}
