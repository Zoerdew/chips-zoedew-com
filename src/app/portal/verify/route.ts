import { NextResponse } from "next/server";
import {
  createSessionToken,
  verifyMagicToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth";

export const runtime = "nodejs";

// The magic link in the email points here. Verify the token, set the session
// cookie, redirect into the portal.
//
// Redirects are built relative to the request's own origin, so this works on
// localhost and production without depending on NEXT_PUBLIC_SITE_URL.

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${origin}/portal/login?error=missing`);
  }

  const payload = await verifyMagicToken(token);
  if (!payload) {
    return NextResponse.redirect(`${origin}/portal/login?error=expired`);
  }

  const sessionToken = await createSessionToken(payload);

  const res = NextResponse.redirect(`${origin}/portal`);
  res.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
