import { NextResponse } from 'next/server';

// OAuth callback - Cognito is not used, redirect to login
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  // Cognito OAuth is not available - redirect to login
  return NextResponse.redirect(new URL(`/login?error=oauth_not_available`, requestUrl.origin));
}
