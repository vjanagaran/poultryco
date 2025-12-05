import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Add Content Security Policy headers
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  
  // Extract origin from API URL (CSP connect-src only accepts origins, not full URLs with paths)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
  let apiOrigin = 'http://localhost:3002';
  try {
    apiOrigin = new URL(apiUrl).origin;
  } catch {
    // Fallback if URL parsing fails
    apiOrigin = 'http://localhost:3002';
  }
  
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://www.google-analytics.com https://www.googletagmanager.com;
    font-src 'self' data:;
    connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com ${apiOrigin} https://*.amazonaws.com;
    frame-ancestors 'self';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s{2,}/g, ' ').trim()

  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Check for JWT token in cookies or localStorage (handled client-side)
  // For server-side, we'll validate on API calls
  const token = request.cookies.get('app_token')?.value

  // Redirect authenticated users from homepage to /home
  if (request.nextUrl.pathname === '/' && token) {
    // Token exists, redirect to home (actual validation happens client-side)
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
