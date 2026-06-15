'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { subscribeUserToPush, unsubscribeUserFromPush } from '@/lib/notifications/web-push/subscription-actions';
import { Switch } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { updateNotificationPreferences } from '@/lib/notifications/web-push/preference-actions';
import { useToast } from '@/components/ui/toast';

type TopicDef = {
  topic: string;
  label: string;
  description: string;
};

const TOPICS: TopicDef[] = [
  { topic: 'EVENTS', label: 'Афиши', description: 'Новые события и мероприятия' },
  { topic: 'ARTICLES', label: 'Материалы', description: 'Новые статьи и публикации' },
  { topic: 'VACANCIES', label: 'Вакансии', description: 'Новые предложения работы' },
  { topic: 'COURSES', label: 'Курсы', description: 'Новые образовательные программы' },
  { topic: 'SUPPLIERS', label: 'Поставщики', description: 'Новые поставщики и партнёры' },
  { topic: 'MASTERS', label: 'Мастера', description: 'Новые мастера и сервисные услуги' },
];

const PUBLIC_KEY = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY ?? '')
  : '';

type NotificationSettingsProps = {
  initialPreferences: Array<{ topic: string; enabled: boolean }>;
  subscriptionCount: number;
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function NotificationSettings({ initialPreferences, subscriptionCount }: NotificationSettingsProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [swReady, setSwReady] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const p of initialPreferences) {
      map[p.topic] = p.enabled;
    }
    for (const t of TOPICS) {
      if (!(t.topic in map)) map[t.topic] = true;
    }
    return map;
  });
  const { showToast } = useToast();
  const [localSubCount, setLocalSubCount] = useState(subscriptionCount);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);
    setNotificationPermission(Notification.permission);

    navigator.serviceWorker.register('/sw.js').then((reg) => {
      setSwReady(true);
      return reg.pushManager.getSubscription().then((sub) => {
        setSubscribed(Boolean(sub));
      });
    }).catch(() => {
      setSwReady(false);
    });
  }, []);

  const handleSubscribe = useCallback(async () => {
    if (!swReady || !PUBLIC_KEY) return;
    setSubscribing(true);

    try {
      const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission !== 'granted') {
        showToast({ id: 'push-sub', title: 'Браузер не разрешил уведомления', tone: 'error' });
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let sub = await registration.pushManager.getSubscription();

      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY).buffer as BufferSource,
        });
      }

      const p256 = sub.getKey('p256dh');
      const authVal = sub.getKey('auth');
      if (!p256 || !authVal) throw new Error('Ключи подписки недоступны');

      const formData = new FormData();
      formData.set('endpoint', sub.endpoint);
      formData.set('p256dh', btoa(String.fromCharCode(...new Uint8Array(p256))));
      formData.set('auth', btoa(String.fromCharCode(...new Uint8Array(authVal))));
      formData.set('userAgent', navigator.userAgent);

      const result = await subscribeUserToPush(formData);

      if (result.type === 'success') {
        if (mountedRef.current) {
          setSubscribed(true);
          setLocalSubCount((c) => c + 1);
        }
        showToast({ id: 'push-sub', title: result.message, tone: 'success' });
      } else {
        showToast({ id: 'push-sub', title: result.message, tone: 'error' });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось подписаться на уведомления';
      showToast({ id: 'push-sub', title: msg, tone: 'error' });
    } finally {
      setSubscribing(false);
    }
  }, [swReady, showToast]);

  const handleUnsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (!sub) {
        setSubscribed(false);
        return;
      }

      const formData = new FormData();
      formData.set('endpoint', sub.endpoint);

      const result = await unsubscribeUserFromPush(formData);

      if (result.type === 'error') {
        showToast({ id: 'push-unsub', title: result.message, tone: 'error' });
        return;
      }

      await sub.unsubscribe();

      if (mountedRef.current) {
        setSubscribed(false);
        setLocalSubCount((c) => Math.max(0, c - 1));
      }
      showToast({ id: 'push-unsub', title: result.message, tone: 'success' });
    } catch {
      showToast({ id: 'push-unsub', title: 'Не удалось отписаться', tone: 'error' });
    }
  }, [showToast]);

  const handlePrefChange = useCallback((topic: string, enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, [topic]: enabled }));
  }, []);

  const handleSavePreferences = useCallback(async () => {
    const formData = new FormData();
    for (const [topic, enabled] of Object.entries(preferences)) {
      formData.append('topic', topic);
      formData.append('enabled', String(enabled));
    }

    const result = await updateNotificationPreferences(formData);

    if (result.type === 'success') {
      showToast({ id: 'pref-save', title: result.message, tone: 'success' });
    } else {
      showToast({ id: 'pref-save', title: result.message, tone: 'error' });
    }
  }, [preferences, showToast]);

  if (!isSupported) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Ваш браузер не поддерживает push-уведомления.
      </p>
    );
  }

  if (!PUBLIC_KEY) {
    return (
      <p className="text-sm text-[var(--warning)]">
        Push-уведомления временно недоступны.
      </p>
    );
  }

  const notificationsBlocked = notificationPermission === 'denied';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--text)]">Браузерные уведомления</p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
            {subscribed
              ? `Подписка активна. Устройств: ${localSubCount}.`
              : notificationsBlocked
                ? 'Браузер заблокировал уведомления для сайта. Разрешите уведомления в настройках браузера, затем вернитесь к подключению.'
              : 'Получайте уведомления о новых вакансиях, обучении, событиях и материалах в браузере — даже когда сайт закрыт. Подписка работает только в этом браузере; отключить можно в любой момент.'}
          </p>
        </div>
        {subscribed ? (
            <Button variant="destructive" size="md" onClick={handleUnsubscribe}>
            Отключить
          </Button>
        ) : (
          <Button disabled={notificationsBlocked} size="md" onClick={handleSubscribe} loading={subscribing || !swReady} loadingText="Подключаем…">
            {notificationsBlocked ? 'Разрешение заблокировано' : 'Включить уведомления'}
          </Button>
        )}
      </div>

      {!subscribed ? (
        <div className="border-t border-[var(--line)] pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            {notificationsBlocked ? 'Что будет доступно после разрешения' : 'О чём будем уведомлять'}
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {TOPICS.map((t) => (
              <li key={t.topic} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-wash)] px-3 py-2">
                <p className="text-sm font-semibold text-[var(--text)]">{t.label}</p>
                <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">{t.description}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
            {notificationsBlocked
              ? 'Настройки тем можно менять после того, как браузер снова разрешит уведомления.'
              : 'После подписки можно отключить отдельные темы.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 border-t border-[var(--line)] pt-4">
          <p className="text-sm font-semibold text-[var(--text)]">Темы уведомлений</p>
          <p className="text-xs leading-5 text-[var(--muted)]">Отключите ненужные темы — остальные продолжат приходить.</p>
          {TOPICS.map((t) => (
            <Switch
              key={t.topic}
              checked={preferences[t.topic]}
              label={t.label}
              description={t.description}
              onCheckedChange={(checked) => handlePrefChange(t.topic, checked)}
            />
          ))}
          <div className="flex justify-end pt-2">
            <Button size="md" onClick={handleSavePreferences}>
              Сохранить настройки
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
