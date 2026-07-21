import { NextRequest, NextResponse } from 'next/server';
import { verifyWebJwt } from '@/lib/verify-jwt';

const PROTECTED_PREFIXES = ['/host', '/account', '/admin'];
const ADMIN_PREFIX = '/admin';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!needsAuth) {
    return NextResponse.next();
  }

  const rawToken = req.cookies.get('wana_token')?.value;
  if (!rawToken) {
    const login = new URL('/auth/login', req.url);
    login.searchParams.set('redirect', pathname);
    return NextResponse.redirect(login);
  }

  let payload = await verifyWebJwt(rawToken);
  if (!payload && rawToken.includes('%')) {
    try {
      payload = await verifyWebJwt(decodeURIComponent(rawToken));
    } catch {
      payload = null;
    }
  }
  if (!payload) {
    const login = new URL('/auth/login', req.url);
    login.searchParams.set('redirect', pathname);
    const res = NextResponse.redirect(login);
    res.cookies.set('wana_token', '', { path: '/', maxAge: 0 });
    return res;
  }

  if (pathname.startsWith(ADMIN_PREFIX) && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/account', req.url));
  }

  if (pathname.startsWith('/host') && payload.role !== 'host' && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/become-host', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/host/:path*', '/account/:path*', '/admin/:path*'],
};
