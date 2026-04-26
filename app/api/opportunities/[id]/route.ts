import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/server/supabase';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/opportunities/:id
 * Fetches a single opportunity by id from the `opportunities` table.
 */
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Missing opportunity id.' }, { status: 400 });
    }

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
      .eq('id', id)
      .single();

    if (error) {
      const status = error.code === 'PGRST116' ? 404 : 500;
      console.error('[/api/opportunities/:id] Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ opportunity: data });
  } catch (error) {
    console.error('[/api/opportunities/:id] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunity', message: String(error) },
      { status: 500 }
    );
  }
}
