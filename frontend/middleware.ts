import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const protectedPaths = ['/dashboard', '/create-blog', '/my-blogs', '/edit-blog', '/admin'];
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (!token && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/create-blog/:path*', '/my-blogs/:path*', '/edit-blog/:path*', '/admin/:path*']
};
