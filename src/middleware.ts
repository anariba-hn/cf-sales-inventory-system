import { NextRequest, NextResponse } from 'next/server';
import { verifySession, ROLE_HOME, Role } from '@/lib/session';

const ROUTE_ROLES: Record<string, Role[]> = {
  '/dashboard': ['admin'],
  '/inventory': ['admin', 'inventory_manager'],
  '/products': ['admin', 'inventory_manager', 'cashier'],
  '/sales': ['admin', 'cashier'],
  '/users': ['admin'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matchedBase = Object.keys(ROUTE_ROLES).find((r) => pathname.startsWith(r));
  if (!matchedBase) return NextResponse.next();

  const token = request.cookies.get('session')?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const allowed = ROUTE_ROLES[matchedBase];
  if (!allowed.includes(session.role)) {
    return NextResponse.redirect(new URL(ROLE_HOME[session.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/inventory/:path*',
    '/products/:path*',
    '/sales/:path*',
    '/users/:path*',
  ],
};
