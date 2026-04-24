import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { AdminSession } from '@/lib/session';

const SESSION_COOKIE_NAME = 'eventsync_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 8;
const ADMIN_ROLES = new Set(['admin', 'superadmin']);

type SessionPayload = AdminSession;

function readSessionSecret(): string | null {
  const value =
    process.env.SESSION_SECRET?.trim() ||
    process.env.EVENTSYNC_SESSION_SECRET?.trim() ||
    process.env.AUTH_SESSION_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim() ||
    null;

  return value && value.length > 0 ? value : null;
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signValue(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function getSignedToken(session: SessionPayload, secret: string) {
  const payload = encodeBase64Url(JSON.stringify(session));
  const signature = signValue(payload, secret);
  return `${payload}.${signature}`;
}

function verifySignedToken(token: string, secret: string): SessionPayload | null {
  const [payload, signature] = token.split('.');

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signValue(payload, secret);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as SessionPayload;

    if (
      !parsed ||
      (typeof parsed.id !== 'string' && typeof parsed.id !== 'number') ||
      typeof parsed.email !== 'string' ||
      typeof parsed.role !== 'string' ||
      typeof parsed.loginAt !== 'string' ||
      typeof parsed.expiresAt !== 'string'
    ) {
      return null;
    }

    if (Date.parse(parsed.expiresAt) <= Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function isAdminRole(role: string | null | undefined) {
  return typeof role === 'string' && ADMIN_ROLES.has(role.toLowerCase());
}

export function buildAdminSession(user: {
  id: string | number;
  email: string;
  name?: string | null;
  role: string;
}): AdminSession {
  const loginAt = new Date();
  const expiresAt = new Date(loginAt.getTime() + SESSION_DURATION_SECONDS * 1000);

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    role: user.role,
    loginAt: loginAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export function hasAdminAccess(role: string | null | undefined) {
  return isAdminRole(role);
}

export function setAdminSessionCookie(response: NextResponse, session: AdminSession) {
  const secret = readSessionSecret();

  if (!secret) {
    throw new Error('SESSION_SECRET is not configured.');
  }

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: getSignedToken(session, secret),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export async function getAdminSession() {
  const secret = readSessionSecret();

  if (!secret) {
    return null;
  }

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawToken) {
    return null;
  }

  const session = verifySignedToken(rawToken, secret);

  if (!session || !isAdminRole(session.role)) {
    return null;
  }

  return session;
}

export async function requireAdminApiSession() {
  const secret = readSessionSecret();

  if (!secret) {
    return NextResponse.json(
      { error: 'SESSION_SECRET is not configured on the server.' },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawToken) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const session = verifySignedToken(rawToken, secret);

  if (!session) {
    return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
  }

  if (!isAdminRole(session.role)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  return session;
}
