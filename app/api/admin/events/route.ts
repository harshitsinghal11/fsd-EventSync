import { NextResponse } from 'next/server';
import { requireAdminApiSession } from '@/lib/server/auth';
import { createSupabaseClient } from '@/lib/server/supabase';
import {
  getOptionalTrimmedString,
  getRequiredFieldsError,
  getTrimmedString,
} from '@/lib/server/validation';

type CoordinatorInput = {
  name?: unknown;
  phone?: unknown;
};

type EventCreatePayload = {
  title?: unknown;
  description?: unknown;
  date?: unknown;
  time?: unknown;
  venue?: unknown;
  duration?: unknown;
  category?: unknown;
  perks?: unknown;
  registration_link?: unknown;
  coordinators?: unknown;
};

/**
 * POST /api/admin/events
 */
export async function POST(request: Request) {
  try {
    const authResult = await requireAdminApiSession();

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    let payload: EventCreatePayload;

    try {
      payload = (await request.json()) as EventCreatePayload;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const title = getTrimmedString(payload.title);
    const date = getTrimmedString(payload.date);
    const requiredFieldsError = getRequiredFieldsError({ title, date });

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

    const perksText = Array.isArray(payload.perks)
      ? payload.perks.map((perk) => String(perk).trim()).filter(Boolean).join(', ')
      : getOptionalTrimmedString(payload.perks);

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert([
        {
          title,
          description: getOptionalTrimmedString(payload.description),
          date,
          time: getOptionalTrimmedString(payload.time),
          venue: getOptionalTrimmedString(payload.venue),
          duration: getOptionalTrimmedString(payload.duration),
          category: getOptionalTrimmedString(payload.category),
          perks: perksText || null,
          registration_link: getOptionalTrimmedString(payload.registration_link),
        },
      ])
      .select('id')
      .single();

    if (eventError) {
      console.error('[admin/events POST] event insert error:', eventError.message);
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    const eventId = event.id;

    const rawCoordinators = Array.isArray(payload.coordinators)
      ? (payload.coordinators as CoordinatorInput[])
      : [];

    const validCoordinators = rawCoordinators
      .map((coordinator) => ({
        name: typeof coordinator.name === 'string' ? coordinator.name.trim() : '',
        phone:
          typeof coordinator.phone === 'string' && coordinator.phone.trim().length > 0
            ? coordinator.phone.trim()
            : null,
      }))
      .filter((coordinator) => coordinator.name.length > 0);

    if (validCoordinators.length > 0) {
      const rows = validCoordinators.map((coordinator) => ({
        event_id: eventId,
        name: coordinator.name,
        phone: coordinator.phone,
      }));

      const { error: coordError } = await supabase
        .from('event_coordinators')
        .insert(rows);

      if (coordError) {
        console.error('[admin/events POST] coordinator insert error:', coordError.message);
        return NextResponse.json(
          {
            event: { id: eventId },
            warning: `Event created but coordinators failed to save: ${coordError.message}`,
          },
          { status: 201 }
        );
      }
    }

    return NextResponse.json(
      {
        event: { id: eventId },
        coordinatorsInserted: validCoordinators.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[admin/events POST] unexpected:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
