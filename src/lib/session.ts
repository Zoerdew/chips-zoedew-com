import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "./auth";

// Server-side helpers for reading the session in server components and routes.

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return await verifySessionToken(token);
}

// Use at the top of any protected server component. Redirects to login if no session.
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/portal/login");
  }
  return session;
}
