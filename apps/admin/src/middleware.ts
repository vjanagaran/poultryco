import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if user is authenticated
  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated, check if user is admin
  if (session && !request.nextUrl.pathname.startsWith('/login')) {
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('role, permissions, is_active')
      .eq('user_id', session.user.id)
      .single()

    // If user is not an admin, deny access
    if (error || !adminUser || !adminUser.is_active) {
      // Clear session and redirect to login with error
      await supabase.auth.signOut()
      return NextResponse.redirect(
        new URL('/login?error=unauthorized', request.url)
      )
    }

    // Store admin role in headers for use in pages
    response.headers.set('x-user-role', adminUser.role)
    response.headers.set('x-user-permissions', JSON.stringify(adminUser.permissions))
  }

  // Redirect to dashboard if already logged in
  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

