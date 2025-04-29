import { NextRequest, NextResponse } from 'next/server'
import { getServerSideURL } from './utilities/getURL'

// Paths that require authentication
const PROTECTED_PATHS = ['/admin']

// Paths that are always allowed
const PUBLIC_PATHS = ['/login', '/subscribe', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('Middleware processing path:', pathname)

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    console.log('Public path accessed:', pathname)
    return NextResponse.next()
  }

  // Check if path requires protection
  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname.startsWith(path))
  if (!isProtectedPath) {
    console.log('Non-protected path:', pathname)
    return NextResponse.next()
  }

  // Get auth cookie
  const authCookie = request.cookies.get('payload-token')
  console.log('Auth cookie present:', !!authCookie?.value)

  if (!authCookie?.value) {
    console.log('No auth cookie found, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check subscription status for admin routes
  const subscriptionCookie = request.cookies.get('rc-subscription')
  if (pathname.startsWith('/admin') && !subscriptionCookie?.value) {
    console.log('No subscription found, redirecting to subscribe')
    return NextResponse.redirect(new URL('/subscribe', request.url))
  }

  // If authenticated and path is protected (like /admin), allow access.
  // The page itself will handle subscription checks.
  console.log('User authenticated, allowing access to protected path:', pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 