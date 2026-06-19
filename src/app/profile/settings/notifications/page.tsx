import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { NotificationSettings } from '@/components/profile/notification-settings';
import { getCurrentUser } from '@/lib/auth/current-user';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { getNotificationPreferences } from '@/lib/notifications/web-push/preferences';
import { getActiveSubscriptions } from '@/lib/notifications/web-push/subscriptions';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Уведомления — настройки',
  description: 'Браузерные уведомления по заявкам и сообщениям в BARSYNERGY.'
});

export default async function ProfileSettingsNotificationsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login?returnTo=/profile/settings/notifications');
  }

  const [notificationPreferences, activeSubs] = await Promise.all([
    getNotificationPreferences(currentUser.id),
    getActiveSubscriptions(currentUser.id)
  ]);

  return (
    <div className="space-y-6">
      <div className="inset-panel max-w-2xl scroll-mt-6 overflow-hidden bg-[var(--surface-elevated)] p-0 shadow-[var(--shadow-panel)]" id="notifications">
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold text-[var(--text)]">Уведомления</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Настройка браузерных уведомлений по заявкам и сообщениям.</p>
        </div>
        <div className="border-t border-[var(--line)] px-6 py-6">
          <NotificationSettings
            initialPreferences={notificationPreferences}
            subscriptionCount={activeSubs.length}
          />
        </div>
      </div>
    </div>
  );
}
