import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'super_secret_key_123_please_change_in_production';
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define protected routes
  const isProtectedAdminRoute = path.startsWith('/admin');
  // guest and member roles can access member routes
  const isProtectedMemberRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/announcements') ||
    path.startsWith('/payments') ||
    path.startsWith('/service-requests');
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register');

  const token = request.cookies.get('auth_token')?.value;
  let decodedToken: any = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
      decodedToken = payload;
    } catch {
      decodedToken = null;
    }
  }

  // Redirect unauthenticated users to login
  if (!decodedToken && (isProtectedAdminRoute || isProtectedMemberRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect already-authenticated users away from login/register
  if (decodedToken && isAuthRoute) {
    if (decodedToken.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Role-based access control
  if (decodedToken) {
    // Admin trying to access member routes → redirect to admin
    if (decodedToken.role === 'admin' && isProtectedMemberRoute) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Non-guest member trying to access admin routes → redirect to dashboard
    if ((decodedToken.role === 'member' || decodedToken.role === 'guest') && isProtectedAdminRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Guest trying to access premium pages → redirect to dashboard
    // (Guests can access /dashboard and /payments)
    if (
      decodedToken.role === 'guest' &&
      (path.startsWith('/service-requests') || path.startsWith('/announcements'))
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Specify the paths where middleware will run
export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/announcements/:path*',
    '/payments/:path*',
    '/service-requests/:path*',
    '/login',
    '/register',
  ],
};
