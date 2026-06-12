import { getWebPushVapidKeys } from './vapid-keys';

type PushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

type SendOptions = {
  subscription: PushSubscription;
  title: string;
  body?: string;
  url?: string;
};

export async function sendPushNotification(options: SendOptions) {
  const keys = getWebPushVapidKeys();

  if (!keys.publicKey || !keys.privateKey) {
    throw new Error('Web Push VAPID keys are not configured');
  }

  const payload = JSON.stringify({
    title: options.title,
    body: options.body ?? '',
    url: options.url ?? '/',
    tag: 'barsynergy',
  });

  const { setVapidDetails, sendNotification } = await import('web-push');

  setVapidDetails(
    keys.subject ?? 'mailto:admin@barsynergy.ru',
    keys.publicKey,
    keys.privateKey
  );

  await sendNotification(
    {
      endpoint: options.subscription.endpoint,
      keys: {
        p256dh: options.subscription.keys.p256dh,
        auth: options.subscription.keys.auth,
      },
    },
    payload
  );
}
