import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

// Gate /portal/* behind a valid session.
// Public exceptions: the login page and the verify route (which sets the cookie).

const PUBLIC_PORTAL_PATHS = ["/portal/login", "/portal/verify"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PORTAL_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const loginUrl = new URL("/portal/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on every /portal route. API routes under /api/auth are public by design.
  matcher: ["/portal/:path*"],
};
