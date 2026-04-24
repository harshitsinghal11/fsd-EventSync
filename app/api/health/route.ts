import { NextResponse } from 'next/server';
import { createSupabaseClient, readSupabaseCredentials } from '@/lib/server/supabase';

export async function GET() {
  const credentials = readSupabaseCredentials();
  if (!credentials) {
    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        supabase: 'not_configured',
      },
      { status: 503 }
    );
  }

  const supabase = createSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        supabase: 'unavailable',
      },
      { status: 503 }
    );
  }

  const { error } = await supabase
    .from('events')
    .select('id', { head: true, count: 'exact' })
    .limit(1);

  if (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        supabase: 'unreachable',
        message: error.message,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase: 'connected',
  });
}
