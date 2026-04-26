import { NextResponse } from 'next/server';
import { requireAdminApiSession } from '@/lib/server/auth';
import { createSupabaseClient } from '@/lib/server/supabase';
import {
  getOptionalTrimmedString,
  getRequiredFieldsError,
  getTrimmedString,
} from '@/lib/server/validation';

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
 * PUT /api/admin/opportunities/:id
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

    const title = getTrimmedString(payload.title);
    const contactInfo = getTrimmedString(payload.contact_info);
    const requiredFieldsError = getRequiredFieldsError({
      title,
      'contact info': contactInfo,
    });

    if (requiredFieldsError) {
      return NextResponse.json({ error: requiredFieldsError }, { status: 400 });
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
        description: getOptionalTrimmedString(payload.description),
        organization: getOptionalTrimmedString(payload.organization),
        deadline: getOptionalTrimmedString(payload.deadline),
        contact_info: contactInfo,
        type: getOptionalTrimmedString(payload.type),
        eligibility: getOptionalTrimmedString(payload.eligibility),
        registration_link: getOptionalTrimmedString(payload.registration_link),
      })
      .eq('id', id);

    if (error) {
      console.error('[admin/opportunities PUT] Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[admin/opportunities PUT] unexpected:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/opportunities/:id
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
      console.error('[admin/opportunities DELETE] Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
