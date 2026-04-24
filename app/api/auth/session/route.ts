import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/server/auth';

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: 'No active admin session.' }, { status: 401 });
  }

  return NextResponse.json({ session });
}
