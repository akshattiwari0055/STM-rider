import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // ── Protect Dashboard & Booking routes (require user login) ────────────
  if (path.startsWith('/dashboard') || path.startsWith('/book')) {
    const token = request.cookies.get('user_token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
  }
  if (path === '/login' || path === '/signup') {
    const token = request.cookies.get('user_token')?.value;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        // User is already authenticated → send to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch {
        // Invalid token, allow access to login/signup
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/book/:path*', '/login', '/signup'],
};
