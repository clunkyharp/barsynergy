import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { SettingsNavTabs } from '@/components/profile/settings-nav-tabs';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Настройки профиля',
  description: 'Редактирование профиля, уведомления и смена пароля в BARSYNERGY.'
});

export default function ProfileSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Настройки" />
      <SettingsNavTabs />
      {children}
    </div>
  );
}
