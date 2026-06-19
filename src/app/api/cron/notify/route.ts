import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/validation/env';
import { processEmailNotificationQueue } from '@/lib/notifications/email-subscription/outbox';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const env = getEnv();

  if (!env.CRON_SECRET) {
    return NextResponse.json({ error: 'Cron not configured' }, { status: 503 });
  }

  const auth = request.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const processed = await processEmailNotificationQueue({ limit: 50 });

  return NextResponse.json({ ok: true, processed });
}
