import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/v1';
    
    // Get token from cookie
    const token = request.cookies.get('admin_token')?.value;

    // Allow login page - always allow it to load
    if (request.nextUrl.pathname.startsWith('/login')) {
      // If already has token, try to verify and redirect to dashboard
      // But don't fail if verification fails - just show login page
      if (token) {
        try {
          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
          
          const response = await fetch(`${apiUrl}/admin/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
        } catch (error: unknown) {
          // Token invalid or API unavailable - silently allow login page
          // Don't log or throw - just continue to show login
        }
      }
      // Always return next for login page - never throw errors
      return NextResponse.next();
    }

    // Check authentication for protected routes
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify token for protected routes
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
      
      const response = await fetch(`${apiUrl}/admin/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Token invalid, redirect to login
        const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
        redirectResponse.cookies.delete('admin_token');
        return redirectResponse;
      }

      const data = await response.json();
      
      // Store user info in headers for use in pages
      const nextResponse = NextResponse.next();
      nextResponse.headers.set('x-admin-id', data.user.id);
      nextResponse.headers.set('x-admin-email', data.user.email);
      nextResponse.headers.set('x-admin-role', data.user.role.slug);
      
      return nextResponse;
    } catch (error: unknown) {
      // Error verifying token (API unavailable or timeout), redirect to login
      // Don't log errors - just redirect
      const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
      redirectResponse.cookies.delete('admin_token');
      return redirectResponse;
    }
  } catch (error: unknown) {
    // Catch any unexpected errors in middleware itself
    // For login page, always allow it
    if (request.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.next();
    }
    // For other pages, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
