import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/host', '/account', '/admin'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!needsAuth) {
    return NextResponse.next();
  }

  const token = req.cookies.get('wana_token')?.value;
  if (!token) {
    const login = new URL('/auth/login', req.url);
    login.searchParams.set('redirect', pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/host/:path*', '/account/:path*', '/admin/:path*'],
};
