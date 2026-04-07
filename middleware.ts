import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 1. Allow public access to /, /dashboard (except /dashboard/users), and static assets
  const pathname = req.nextUrl.pathname
  const isLandingPage = pathname === '/'
  const isGapoktanDetail = pathname.startsWith('/gapoktan/')
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signin')
  const isApiAuth = pathname.startsWith('/api/auth')
  const isStaticAsset = pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js)$/)

  if (!session && !isLandingPage && !isGapoktanDetail && !isAuthPage && !isApiAuth && !isStaticAsset) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from login/signin
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
