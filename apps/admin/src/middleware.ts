import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/v1';
  
  // Get token from cookie
  const token = request.cookies.get('admin_token')?.value;

  // Allow login page
  if (request.nextUrl.pathname.startsWith('/login')) {
    // If already has token, verify and redirect to dashboard
    if (token) {
      try {
        const response = await fetch(`${apiUrl}/admin/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch {
        // Token invalid, allow login
      }
    }
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token
  try {
    const response = await fetch(`${apiUrl}/admin/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

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
  } catch (_error) {
    // Error verifying token, redirect to login
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
    redirectResponse.cookies.delete('admin_token');
    return redirectResponse;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
