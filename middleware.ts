// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Get hostname (e.g., subdomain.watari.sites, watari.sites, or custom domain)
  const hostname = req.headers.get('host') || '';
  
  // Remove port for localhost
  const currentHost = hostname.replace(':3001', '');
  
  // Handle localhost testing
  if (currentHost.includes('localhost')) {
    // For local testing, you can use URLs like: subdomain.localhost:3001
    const subdomain = currentHost.split('.')[0];
    if (subdomain && subdomain !== 'localhost') {
      // Rewrite to dynamic route
      return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
    }
    // Root localhost - show landing page
    return NextResponse.next();
  }
  
  // Production handling for watari.sites
  if (currentHost.endsWith('watari.sites')) {
    const subdomain = currentHost.replace('.watari.sites', '');
    
    // Skip www and root domain
    if (subdomain && subdomain !== 'www' && subdomain !== 'watari') {
      // Rewrite to dynamic subdomain route
      return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
    }
    
    // Root domain or www - show landing page or redirect
    return NextResponse.next();
  }
  
  // Handle custom domains - treat the entire hostname as a custom domain
  // This would need database lookup in production to find the corresponding website
  return NextResponse.rewrite(new URL(`/custom-domain/${currentHost}${url.pathname}`, req.url));
}