import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/server/supabase';

/**
 * GET /api/opportunities
 * Fetches all rows from the `opportunities` table in Supabase.
 * Ordered by deadline ascending.
 */
export async function GET() {
  try {
    const supabase = createSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase credentials are not configured.' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('deadline', { ascending: true });

    if (error) {
      console.error('[/api/opportunities] Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('[/api/opportunities] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities', message: String(error) },
      { status: 500 }
    );
  }
}
