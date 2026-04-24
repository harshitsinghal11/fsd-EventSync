import { NextResponse } from 'next/server';
import { buildAdminSession, hasAdminAccess, setAdminSessionCookie } from '@/lib/server/auth';
import { createSupabaseClient } from '@/lib/server/supabase';

type LoginPayload = {
  email?: unknown;
  password?: unknown;
};

/**
 * POST /api/auth/login
 * Body: { email: string; password: string }
 */
export async function POST(request: Request) {
  try {
    let payload: LoginPayload;

    try {
      payload = (await request.json()) as LoginPayload;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const email =
      typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    const password = typeof payload.password === 'string' ? payload.password : '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase credentials are not configured.' },
        { status: 500 }
      );
    }

    const { data: userRowRaw, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) {
      console.error(
        '[login] Supabase error code:',
        fetchError.code,
        '| message:',
        fetchError.message
      );
      return NextResponse.json(
        {
          error: 'Database error. Check server logs.',
          supabaseCode: fetchError.code,
          supabaseMessage: fetchError.message,
        },
        { status: 500 }
      );
    }

    const userRow = userRowRaw as Record<string, unknown> | null;

    if (!userRow) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const storedPassword =
      userRow.password ??
      userRow.password_hash ??
      userRow.passwd ??
      null;

    if (storedPassword === null) {
      return NextResponse.json(
        {
          error: 'Password column not found in users table.',
          availableColumns: Object.keys(userRow),
        },
        { status: 500 }
      );
    }

    const passwordMatch = String(storedPassword) === password;

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const role = typeof userRow.role === 'string' ? userRow.role : '';

    if (!hasAdminAccess(role)) {
      return NextResponse.json(
        { error: 'This account does not have admin access.' },
        { status: 403 }
      );
    }

    const session = buildAdminSession({
      id: String(userRow.id ?? ''),
      email: String(userRow.email ?? email),
      name:
        typeof userRow.name === 'string'
          ? userRow.name
          : typeof userRow.full_name === 'string'
            ? userRow.full_name
            : typeof userRow.username === 'string'
              ? userRow.username
              : null,
      role,
    });

    const response = NextResponse.json({ session });
    setAdminSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error('[login] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.', detail: String(error) },
      { status: 500 }
    );
  }
}
