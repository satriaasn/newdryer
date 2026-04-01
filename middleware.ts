import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Define public paths that don't require authentication
  const isAuthPage = req.nextUrl.pathname.startsWith('/signin')
  const isApiAuth = req.nextUrl.pathname.startsWith('/api/auth')
  const isStaticAsset = req.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js)$/)

  if (!session && !isAuthPage && !isApiAuth && !isStaticAsset) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/signin'
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from signin
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
