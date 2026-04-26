import { NextResponse } from 'next/server';
import { requireAdminApiSession } from '@/lib/server/auth';
import { createSupabaseClient } from '@/lib/server/supabase';
import {
  getOptionalTrimmedString,
  getRequiredFieldsError,
  getTrimmedString,
} from '@/lib/server/validation';

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
 * POST /api/admin/opportunities
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

    const { data, error } = await supabase
      .from('opportunities')
      .insert([
        {
          title,
          description: getOptionalTrimmedString(payload.description),
          organization: getOptionalTrimmedString(payload.organization),
          deadline: getOptionalTrimmedString(payload.deadline),
          type: getOptionalTrimmedString(payload.type),
          contact_info: contactInfo,
          eligibility: getOptionalTrimmedString(payload.eligibility),
          registration_link: getOptionalTrimmedString(payload.registration_link),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[admin/opportunities POST] Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ opportunity: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
