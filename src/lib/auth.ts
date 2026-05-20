import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";

// Two token types, both signed with SESSION_SECRET:
//   - magic link token: short-lived (30 min), embedded in the email URL
//   - session token: long-lived (9 days), stored in an httpOnly cookie

const secret = new TextEncoder().encode(env.sessionSecret);

const MAGIC_LINK_TTL = "30m";
const SESSION_TTL = "9d";

export const SESSION_COOKIE = "chips_session";

export type SessionPayload = {
  participantId: string;
  email: string;
  firstName: string;
};

// ---- Magic link token ----

export async function createMagicToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload, kind: "magic" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(MAGIC_LINK_TTL)
    .sign(secret);
}

export async function verifyMagicToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.kind !== "magic") return null;
    return {
      participantId: String(payload.participantId),
      email: String(payload.email),
      firstName: String(payload.firstName),
    };
  } catch {
    return null;
  }
}

// ---- Session token ----

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload, kind: "session" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(secret);
}

export async function verifySessionToken(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.kind !== "session") return null;
    return {
      participantId: String(payload.participantId),
      email: String(payload.email),
      firstName: String(payload.firstName),
    };
  } catch {
    return null;
  }
}

// 9 days in seconds, for the cookie maxAge
export const SESSION_MAX_AGE = 9 * 24 * 60 * 60;
