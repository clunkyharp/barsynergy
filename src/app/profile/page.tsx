import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Профиль',
  description: 'Закрытый кабинет специалиста BARSYNERGY.'
});

const COMPLETENESS_FIELDS = ['fullName', 'cityId', 'profession', 'phone', 'telegram', 'bio', 'website'] as const;

function computeCompleteness(profile: {
  fullName: string | null;
  cityId: string | null;
  profession: string | null;
  phone: string | null;
  telegram: string | null;
  bio: string | null;
  website: string | null;
}): { filled: number; total: number; percent: number; isEmpty: boolean } {
  const filled = COMPLETENESS_FIELDS.filter((f) => {
    const value = profile[f];
    return value !== null && value !== '';
  }).length;
  const total = COMPLETENESS_FIELDS.length;
  const percent = Math.round((filled / total) * 100);
  return { filled, total, percent, isEmpty: filled === 0 };
}

const jobSearchStatusLabels: Record<string, string> = {
  ACTIVE: 'Активно ищу работу',
  OPEN: 'Рассматриваю предложения',
  NOT_LOOKING: 'Не ищу'
};

const employmentTypeLabels: Record<string, string> = {
  FULL_TIME: 'Полная',
  PART_TIME: 'Частичная',
  FREELANCE: 'Фриланс',
  REMOTE: 'Удалённо'
};

function formatSalary(value: number | null): string | null {
  if (value === null || value === undefined) return null;
  return value.toLocaleString('ru-RU');
}

export default async function ProfileDashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login?returnTo=/profile');
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    include: {
      profile: {
        include: {
          city: true,
          avatarFile: { select: { fileKey: true, bucket: true, storageDriver: true } },
          workExperiences: { orderBy: { sortOrder: 'asc' } },
          profileSkills: { include: { skill: { select: { name: true, slug: true } } } }
        }
      }
    }
  });

  if (!user) {
    redirect('/auth/login?returnTo=/profile');
  }

  const profile = user.profile;
  const completeness = computeCompleteness({
    fullName: profile?.fullName ?? null,
    cityId: profile?.cityId ?? null,
    profession: profile?.profession ?? null,
    phone: profile?.phone ?? null,
    telegram: profile?.telegram ?? null,
    bio: profile?.bio ?? null,
    website: profile?.website ?? null
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[28px] font-bold leading-[1.18] tracking-normal text-[var(--text)]">
            {profile?.fullName || user.email}
          </h1>
          {profile?.jobSearchStatus && (
            <MetaChip variant="filter" className="mt-1">
              {jobSearchStatusLabels[profile.jobSearchStatus]}
            </MetaChip>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button className="shrink-0 rounded-[var(--radius-md)]" href="/profile/settings" size="sm" variant="primary">
            Редактировать профиль
            <ArrowRight aria-hidden size={15} strokeWidth={1.8} />
          </Button>
          <Button className="rounded-[var(--radius-md)]" href="/vacancies" size="sm" variant="secondary">
            <Search size={15} strokeWidth={1.8} />
            Найти вакансии
          </Button>
        </div>
      </div>

      {completeness.isEmpty ? (
        <Panel padding="lg" tone="elevated">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-normal text-[var(--text)]">Профиль не заполнен</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Добавьте имя, профессию, город и контакты — так работодателям будет проще вас найти, а отклики будут заполняться автоматически.
              </p>
            </div>
            <Button className="shrink-0 rounded-[var(--radius-md)]" href="/profile/settings" size="sm" variant="secondary">
              Заполнить профиль
            </Button>
          </div>
        </Panel>
      ) : completeness.percent < 100 ? (
        <Panel padding="lg" tone="elevated">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
              <svg aria-hidden="true" className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="none" r="15.5" stroke="var(--line)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  fill="none"
                  r="15.5"
                  stroke="var(--accent)"
                  strokeDasharray={`${completeness.percent * 0.979} 97.9`}
                  strokeLinecap="round"
                  strokeWidth="3"
                />
              </svg>
              <span className="text-sm font-bold text-[var(--accent)]">{completeness.percent}%</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold tracking-normal text-[var(--text)]">
                Профиль заполнен на {completeness.percent}%
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Добавьте недостающие поля, чтобы повысить шансы найти работу.
              </p>
              <Button className="mt-2 rounded-[var(--radius-md)]" href="/profile/settings" size="sm" variant="secondary">
                Дозаполнить профиль
              </Button>
            </div>
          </div>
        </Panel>
      ) : null}

      {profile?.jobSearchStatus && profile.jobSearchStatus !== 'NOT_LOOKING' && (
        <div className="grid gap-6 md:grid-cols-3">
          {profile.desiredSalary !== null && profile.desiredSalary !== undefined && (
            <Panel padding="md" tone="elevated">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Желаемая зарплата</p>
              <p className="mt-1 text-xl font-bold">
                {formatSalary(profile.desiredSalary)} ₽
                {profile.desiredSalaryMax !== null && profile.desiredSalaryMax !== undefined
                  ? ` — ${formatSalary(profile.desiredSalaryMax)} ₽`
                  : ''}
              </p>
            </Panel>
          )}
          {profile.employmentTypes.length > 0 && (
            <Panel padding="md" tone="elevated">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Формат работы</p>
              <p className="mt-1 text-sm">
                {profile.employmentTypes.map((et) => employmentTypeLabels[et]).join(', ')}
              </p>
            </Panel>
          )}
          {profile.isPublic && (
            <Panel padding="md" tone="elevated">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Профиль</p>
              <p className="mt-1 text-sm text-[var(--accent)]">Виден работодателям</p>
            </Panel>
          )}
        </div>
      )}

      {profile?.profileSkills && profile.profileSkills.length > 0 && (
        <Panel padding="lg" tone="elevated">
          <h2 className="text-lg font-semibold tracking-normal">Навыки</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.profileSkills.map((ps) => (
              <MetaChip key={ps.skill.slug} variant="filter">
                {ps.skill.name}
              </MetaChip>
            ))}
          </div>
        </Panel>
      )}

      {profile?.workExperiences && profile.workExperiences.length > 0 && (
        <Panel padding="lg" tone="elevated">
          <h2 className="text-lg font-semibold tracking-normal">Опыт работы</h2>
          <div className="mt-4 space-y-4">
            {profile.workExperiences.map((exp) => (
              <div key={exp.id} className="border-b border-[var(--line)] pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{exp.position}</p>
                    <p className="text-sm text-[var(--muted)]">{exp.companyName}</p>
                  </div>
                  <p className="shrink-0 text-xs text-[var(--muted)]">
                    {new Date(exp.startDate).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })}
                    {' — '}
                    {exp.endDate
                      ? new Date(exp.endDate).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })
                      : 'настоящее время'}
                  </p>
                </div>
                {exp.description && (
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {profile?.bio ? (
        <Panel padding="lg" tone="elevated">
          <h2 className="text-lg font-semibold tracking-normal">О себе</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--text)]">{profile.bio}</p>
        </Panel>
      ) : null}

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
              <span className="font-medium">{profile?.fullName || '—'}</span>
            </div>
            {profile?.profession && (
              <div className="flex justify-between border-b border-[var(--line)] pb-2">
                <span className="text-[var(--muted)]">Профессия</span>
                <span className="font-medium">{profile.profession}</span>
              </div>
            )}
            {profile?.city?.name && (
              <div className="flex justify-between border-b border-[var(--line)] pb-2">
                <span className="text-[var(--muted)]">Город</span>
                <span className="font-medium">{profile.city.name}</span>
              </div>
            )}
          </div>
        </Panel>

        <Panel padding="lg" tone="elevated">
          <h2 className="text-lg font-semibold tracking-normal">Контакты</h2>
          <div className="mt-4 space-y-3 text-sm">
            {profile?.phone && (
              <div className="flex justify-between border-b border-[var(--line)] pb-2">
                <span className="text-[var(--muted)]">Телефон</span>
                <span className="font-medium">{profile.phone}</span>
              </div>
            )}
            {profile?.telegram && (
              <div className="flex justify-between border-b border-[var(--line)] pb-2">
                <span className="text-[var(--muted)]">Telegram</span>
                <span className="font-medium">{profile.telegram}</span>
              </div>
            )}
            {profile?.company && (
              <div className="flex justify-between border-b border-[var(--line)] pb-2">
                <span className="text-[var(--muted)]">Компания</span>
                <span className="font-medium">{profile.company}</span>
              </div>
            )}
            {profile?.website && (
              <div className="flex justify-between border-b border-[var(--line)] pb-2">
                <span className="text-[var(--muted)]">Сайт</span>
                <span className="font-medium">{profile.website}</span>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
