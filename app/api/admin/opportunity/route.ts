import { NextResponse } from 'next/server';
import { requireAdminApiSession } from '@/lib/server/auth';
import { createSupabaseClient } from '@/lib/server/supabase';

type OpportunityCreatePayload = {
  title?: unknown;
  description?: unknown;
  organization?: unknown;
  deadline?: unknown;
  type?: unknown;
  contact_info?: unknown;
  eligibility?: unknown;
  registration_link?: unknown;
};

/**
 * POST /api/admin/opportunity
 */
export async function POST(request: Request) {
  try {
    const authResult = await requireAdminApiSession();

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    let payload: OpportunityCreatePayload;

    try {
      payload = (await request.json()) as OpportunityCreatePayload;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const title = typeof payload.title === 'string' ? payload.title.trim() : '';

    if (!title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
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
      .insert([
        {
          title,
          description: payload.description ?? null,
          organization: payload.organization ?? null,
          deadline: payload.deadline ?? null,
          type: payload.type ?? null,
          contact_info: payload.contact_info ?? null,
          eligibility: payload.eligibility ?? null,
          registration_link: payload.registration_link ?? null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[admin/opportunity POST] Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ opportunity: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
