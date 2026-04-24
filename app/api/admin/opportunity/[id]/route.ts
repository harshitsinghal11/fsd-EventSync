import { NextResponse } from 'next/server';
import { requireAdminApiSession } from '@/lib/server/auth';
import { createSupabaseClient } from '@/lib/server/supabase';

type RouteContext = {
  params: Promise<{ id: string }>;
};

type OpportunityUpdatePayload = {
  title?: unknown;
  description?: unknown;
  organization?: unknown;
  deadline?: unknown;
  contact_info?: unknown;
  type?: unknown;
  eligibility?: unknown;
  registration_link?: unknown;
};

/**
 * PUT /api/admin/opportunity/:id
 */
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const authResult = await requireAdminApiSession();

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Missing opportunity id.' }, { status: 400 });
    }

    let payload: OpportunityUpdatePayload;

    try {
      payload = (await request.json()) as OpportunityUpdatePayload;
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

    const { error } = await supabase
      .from('opportunities')
      .update({
        title,
        description: payload.description ?? null,
        organization: payload.organization ?? null,
        deadline: payload.deadline ?? null,
        contact_info: payload.contact_info ?? null,
        type: payload.type ?? null,
        eligibility: payload.eligibility ?? null,
        registration_link: payload.registration_link ?? null,
      })
      .eq('id', id);

    if (error) {
      console.error('[admin/opportunity PUT] Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[admin/opportunity PUT] unexpected:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/opportunity/:id
 */
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const authResult = await requireAdminApiSession();

    if (authResult instanceof NextResponse) {
      return authResult;
    }

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

    const { error } = await supabase.from('opportunities').delete().eq('id', id);

    if (error) {
      console.error('[admin/opportunity DELETE] Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
