import { NextResponse, type NextRequest } from 'next/server'
import { verifySession } from './lib/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes, static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  const session = await verifySession()

  // Redirect to dashboard if already logged in and trying to access auth pages
  if (session && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect dashboard and admin routes - redirect to login if not authenticated
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Allow access to waiting room and account disabled pages for authenticated users
  if (pathname === '/waiting-room' || pathname === '/account-disabled') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Disable middleware temporarily for debugging
    // '/((?!api/|_next/static|_next/image|favicon.ico).*)',
  ],
}
