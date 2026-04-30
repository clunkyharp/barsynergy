import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { StatCard } from '@/components/ui/stat-card';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';

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
        description="Добро пожаловать в ваш личный кабинет. Здесь вы можете управлять своими откликами и настройками профиля."
        title={`Привет, ${user.profile?.fullName || user.email}!`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Email" value={user.email} valueClassName="text-base font-semibold tracking-[-0.02em]" />
        <StatCard label="Город" value={user.profile?.city?.name || '—'} valueClassName="text-base font-semibold tracking-[-0.02em]" />
        <StatCard label="Профессия" value={user.profile?.profession || '—'} valueClassName="text-base font-semibold tracking-[-0.02em]" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel padding="lg" tone="elevated">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Основная информация</h2>
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
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Контактные данные</h2>
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
        </Panel>
      </div>

      <Panel padding="lg" tone="elevated">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">Ваш профиль</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {user.profile?.bio || 'Вы еще не заполнили биографию. Это можно сделать в настройках.'}
        </p>
      </Panel>
    </div>
  );
}
