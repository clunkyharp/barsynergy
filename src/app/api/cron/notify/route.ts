import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/validation/env';
import { processEmailNotificationQueue } from '@/lib/notifications/email-subscription/outbox';
import { processApplicationNotificationQueue } from '@/lib/notifications/application-notification-outbox';
import { processContentNotificationQueue } from '@/lib/notifications/web-push/outbox';

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

  const logger = {
    error: (message: unknown, ...args: unknown[]) => console.error(message, ...args)
  };

  const [emailContent, application, webPushContent] = await Promise.allSettled([
    processEmailNotificationQueue({ limit: 50, logger }),
    processApplicationNotificationQueue({ limit: 50, logger }),
    processContentNotificationQueue({ limit: 50, logger })
  ]);

  const result = {
    emailContent: resultValue(emailContent),
    application: resultValue(application),
    webPushContent: resultValue(webPushContent)
  };

  const hasFailure =
    emailContent.status === 'rejected' ||
    application.status === 'rejected' ||
    webPushContent.status === 'rejected';

  return NextResponse.json({ ok: !hasFailure, ...result }, { status: hasFailure ? 500 : 200 });
}

function resultValue<T>(promise: PromiseSettledResult<T>): T | { error: string } {
  if (promise.status === 'fulfilled') return promise.value;
  return { error: promise.reason instanceof Error ? promise.reason.message : String(promise.reason) };
}
