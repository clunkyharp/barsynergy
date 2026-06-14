import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ArrowRight, BookOpen, BriefcaseBusiness, PartyPopper, Settings } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import { ProfileProgressRing } from '@/components/profile/profile-progress-ring';
import { ProfileVisibilityAlert } from '@/components/profile/profile-visibility-alert';
import { getCurrentUser } from '@/lib/auth/current-user';
import { openProfileVisibilityAction } from '@/lib/profile/job-search-actions';
import { getFullUser, getProfileDashboardStats } from '@/modules/profile/queries';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { displayFont } from '@/lib/fonts';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Профиль',
  description: 'Закрытый кабинет специалиста BARSYNERGY.'
});

const COMPLETENESS_FIELDS = ['fullName', 'cityId', 'profession', 'phone', 'telegram', 'bio'] as const;

const COMPLETENESS_FIELD_LABELS: Record<typeof COMPLETENESS_FIELDS[number], string> = {
  fullName: 'имя',
  cityId: 'город',
  profession: 'профессию',
  phone: 'телефон',
  telegram: 'Telegram',
  bio: 'описание'
};

function computeCompleteness(profile: {
  fullName: string | null;
  cityId: string | null;
  profession: string | null;
  phone: string | null;
  telegram: string | null;
  bio: string | null;
}): { filled: number; total: number; percent: number; isEmpty: boolean; missingFields: string[] } {
  const missingFields = COMPLETENESS_FIELDS.filter((f) => {
    const value = profile[f];
    return value === null || value === '';
  });
  const filled = COMPLETENESS_FIELDS.length - missingFields.length;
  const total = COMPLETENESS_FIELDS.length;
  const percent = Math.round((filled / total) * 100);
  return { filled, total, percent, isEmpty: filled === 0, missingFields: missingFields.map((f) => COMPLETENESS_FIELD_LABELS[f]) };
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

function formatMissingFields(fields: string[]) {
  if (fields.length === 0) return '';
  return `Добавьте ещё: ${fields.slice(0, 3).join(', ')}`;
}

type ProfileDashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfileDashboardPage({ searchParams }: ProfileDashboardPageProps) {
  const params = (await searchParams) ?? {};
  const isWelcome = (Array.isArray(params.welcome) ? params.welcome[0] : params.welcome) === '1';
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login?returnTo=/profile');
  }

  const [user, dashboardStats] = await Promise.all([
    getFullUser(currentUser.id),
    getProfileDashboardStats(currentUser.id)
  ]);

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
    bio: profile?.bio ?? null
  });

  return (
    <div className="space-y-6" data-ux-metric="profile_completion_viewed" data-ux-value={completeness.percent}>
      {isWelcome ? (
        <Panel padding="lg" tone="elevated">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)]">
              <PartyPopper aria-hidden className="text-[var(--accent)]" size={22} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className={`${displayFont.className} text-[1.25rem] font-semibold leading-tight text-[var(--text)]`}>
                Добро пожаловать в BARSYNERGY!
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Аккаунт активирован. Заполните профиль, чтобы работодатели могли найти вас, и исследуйте платформу.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  { href: '/profile/settings', icon: Settings, label: 'Заполнить профиль', description: 'Имя, город, профессия, контакты' },
                  { href: '/vacancies', icon: BriefcaseBusiness, label: 'Найти вакансии', description: 'Открытые позиции в СКФО' },
                  { href: '/education', icon: BookOpen, label: 'Найти обучение', description: 'Интенсивы и курсы' },
                ].map((item) => (
                  <a
                    className="group flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-wash)] px-3 py-2.5 transition-colors hover:border-[var(--accent)]/35 hover:bg-[var(--accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                    href={item.href}
                    key={item.href}
                  >
                    <item.icon aria-hidden className="shrink-0 text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]" size={18} strokeWidth={1.5} />
                    <span>
                      <span className="block text-[13px] font-semibold text-[var(--text)]">{item.label}</span>
                      <span className="block text-[11px] leading-4 text-[var(--muted)]">{item.description}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      ) : null}
      <Panel padding="lg" tone="elevated">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="min-w-0 self-center">
            <h1 className="text-[22px] font-bold leading-[1.20] text-balance tracking-normal text-[var(--text)] md:text-[26px]">
              {profile?.fullName || user.email}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--muted)]">
              {profile?.profession ? <span>{profile.profession}</span> : null}
              {profile?.city?.name ? <span>{profile.city.name}</span> : null}
            </div>
            {profile?.jobSearchStatus ? (
              <MetaChip variant="filter" className="mt-2">
                {jobSearchStatusLabels[profile.jobSearchStatus]}
              </MetaChip>
            ) : null}
          </div>
          <Button className="shrink-0 rounded-[var(--radius-md)] self-start" href="/profile/settings" size="md" variant="primary">
            Редактировать
            <ArrowRight aria-hidden size={15} strokeWidth={1.8} />
          </Button>
        </div>
      </Panel>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          {
            href: '/profile/responses',
            label: 'Активные отклики',
            value: dashboardStats.activeResponseCount,
            detail: 'На проверке или в работе'
          },
          {
            href: '/profile/responses',
            label: 'Непрочитанные',
            value: dashboardStats.unreadMessageCount,
            detail: 'Сообщения по диалогам'
          },
          {
            href: '/profile/saved-vacancies',
            label: 'Сохранённые вакансии',
            value: dashboardStats.savedVacancyCount,
            detail: 'Быстрый возврат к позициям'
          }
        ].map((item) => (
          <AppLink
            className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-elevated)] p-5 transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--surface-wash)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            href={item.href}
            key={item.href + item.label}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--text)]">{item.value}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.detail}</p>
          </AppLink>
        ))}
      </div>

      {profile && !profile.isPublic && profile.jobSearchStatus && profile.jobSearchStatus !== 'NOT_LOOKING' ? (
        <ProfileVisibilityAlert action={openProfileVisibilityAction} />
      ) : null}

      {completeness.isEmpty ? (
        <Panel padding="lg" tone="elevated">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-normal text-[var(--text)]">Профиль не заполнен</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Добавьте имя, профессию, город и контакты — так работодателям будет проще вас найти, а отклики будут заполняться автоматически.
              </p>
            </div>
            <Button className="shrink-0 rounded-[var(--radius-md)]" href="/profile/settings" size="md" variant="secondary">
              Заполнить профиль
            </Button>
          </div>
        </Panel>
      ) : completeness.percent < 100 ? (
        <Panel padding="lg" tone="elevated">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <ProfileProgressRing percent={completeness.percent} />
            <div className="min-w-0">
              <h2 className="text-base font-semibold tracking-normal text-[var(--text)]">
                Профиль заполнен на {completeness.percent}%
              </h2>
              {completeness.missingFields.length > 0 ? (
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  {formatMissingFields(completeness.missingFields)}
                </p>
              ) : (
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Добавьте недостающие поля, чтобы повысить шансы найти работу.
                </p>
              )}
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                Полный профиль чаще попадает в подборки работодателей.
              </p>
              <Button className="mt-3 rounded-[var(--radius-md)]" href="/profile/settings" size="md" variant="secondary">
                Дозаполнить профиль
              </Button>
            </div>
          </div>
        </Panel>
      ) : null}

      {profile?.jobSearchStatus && profile.jobSearchStatus !== 'NOT_LOOKING' && (
        (profile.desiredSalary !== null && profile.desiredSalary !== undefined)
        || profile.employmentTypes.length > 0
      ) ? (
        <Panel padding="lg" tone="elevated">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Условия поиска</p>
          <dl className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm leading-7 text-[var(--text)]">
            {profile.desiredSalary !== null && profile.desiredSalary !== undefined ? (
              <div className="flex items-baseline gap-2">
                <dt className="text-[var(--muted)]">Желаемая зарплата:</dt>
                <dd className="font-semibold">
                  {profile.desiredSalaryMax !== null && profile.desiredSalaryMax !== undefined
                    ? `${formatSalary(profile.desiredSalary)} — ${formatSalary(profile.desiredSalaryMax)} ₽`
                    : `от ${formatSalary(profile.desiredSalary)} ₽`}
                </dd>
              </div>
            ) : null}
            {profile.employmentTypes.length > 0 ? (
              <div className="flex items-baseline gap-2">
                <dt className="text-[var(--muted)]">Формат:</dt>
                <dd className="font-semibold">
                  {profile.employmentTypes.map((et) => employmentTypeLabels[et]).join(', ')}
                </dd>
              </div>
            ) : null}
          </dl>
        </Panel>
      ) : null}

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

        {profile?.phone || profile?.telegram || profile?.company ? (
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
                  <a
                    className="font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
                    href={`https://t.me/${profile.telegram.replace('@', '')}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {profile.telegram.startsWith('@') ? profile.telegram : `@${profile.telegram}`}
                  </a>
                </div>
              )}
              {profile?.company && (
                <div className="flex justify-between border-b border-[var(--line)] pb-2">
                  <span className="text-[var(--muted)]">Компания</span>
                  <span className="font-medium">{profile.company}</span>
                </div>
              )}
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
