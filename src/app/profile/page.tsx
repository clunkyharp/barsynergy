import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Профиль',
  description: 'Закрытый кабинет специалиста BARSYNERGY.'
});

export default async function ProfileDashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    include: {
      profile: {
        include: {
          city: true
        }
      }
    }
  });

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Кабинет специалиста"
        description="Здесь будут отклики, контакты и настройки профиля."
        title={`Привет, ${user.profile?.fullName || user.email}!`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Panel padding="lg" tone="elevated">
          <h2 className="text-lg font-semibold tracking-normal">Основная информация</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b border-[var(--line)] pb-2">
              <span className="text-[var(--muted)]">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--line)] pb-2">
              <span className="text-[var(--muted)]">Полное имя</span>
              <span className="font-medium">{user.profile?.fullName || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--line)] pb-2">
              <span className="text-[var(--muted)]">Профессия</span>
              <span className="font-medium">{user.profile?.profession || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--line)] pb-2">
              <span className="text-[var(--muted)]">Город</span>
              <span className="font-medium">{user.profile?.city?.name || '—'}</span>
            </div>
          </div>
        </Panel>

        <Panel padding="lg" tone="elevated">
          <h2 className="text-lg font-semibold tracking-normal">Контакты и описание</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b border-[var(--line)] pb-2">
              <span className="text-[var(--muted)]">Телефон</span>
              <span className="font-medium">{user.profile?.phone || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--line)] pb-2">
              <span className="text-[var(--muted)]">Telegram</span>
              <span className="font-medium">{user.profile?.telegram || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--line)] pb-2">
              <span className="text-[var(--muted)]">Компания</span>
              <span className="font-medium">{user.profile?.company || '—'}</span>
            </div>
          </div>
          <p className="mt-5 border-t border-[var(--line)] pt-4 text-sm leading-6 text-[var(--muted)]">
            {user.profile?.bio || 'Описание профиля пока не заполнено.'}
          </p>
        </Panel>
      </div>
    </div>
  );
}
