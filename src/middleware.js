import { NextResponse } from 'next/server';

/**
 * Middleware de Next.js para interceptar peticiones del lado del servidor.
 * Protege estrictamente todas las rutas de /dashboard frente a accesos no autenticados,
 * redirigiendo inmediatamente a /login antes de emitir cualquier contenido HTML.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Interceptar todas las rutas de /dashboard y sus subrutas
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    // 1. Verificar existencia de token en cookies
    const tokenCookie =
      request.cookies.get('token')?.value ||
      request.cookies.get('porcitech_token')?.value;

    // 2. Verificar existencia de token en cabeceras de autorización HTTP
    const authHeader =
      request.headers.get('authorization') ||
      request.headers.get('Authorization');
    const hasBearer =
      authHeader &&
      authHeader.startsWith('Bearer ') &&
      authHeader.split(' ')[1]?.trim();

    const isAuthenticated = Boolean(tokenCookie && tokenCookie.trim() !== '') || Boolean(hasBearer);

    // Si no está autenticado, redirigir instantáneamente a /login
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
};
