import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ArrowRight, FileText, Heart, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import { ProfileProgressRing } from '@/components/profile/profile-progress-ring';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getFullUser } from '@/modules/profile/queries';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Профиль',
  description: 'Закрытый кабинет специалиста BARSYNERGY.'
});

const COMPLETENESS_FIELDS = ['fullName', 'cityId', 'profession', 'phone', 'telegram', 'bio', 'website'] as const;

const COMPLETENESS_FIELD_LABELS: Record<typeof COMPLETENESS_FIELDS[number], string> = {
  fullName: 'имя',
  cityId: 'город',
  profession: 'профессию',
  phone: 'телефон',
  telegram: 'Telegram',
  bio: 'описание',
  website: 'сайт'
};

function computeCompleteness(profile: {
  fullName: string | null;
  cityId: string | null;
  profession: string | null;
  phone: string | null;
  telegram: string | null;
  bio: string | null;
  website: string | null;
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

export default async function ProfileDashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login?returnTo=/profile');
  }

  const user = await getFullUser(currentUser.id);

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

  const initials = (profile?.fullName || user.email).slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <Panel padding="lg" tone="elevated">
        <div className="grid grid-cols-[4rem_1fr_auto] items-start gap-4">
          <span className="grid size-16 place-items-center rounded-full bg-[var(--accent-soft)] text-xl font-bold text-[var(--accent)]">
            {initials}
          </span>
          <div className="min-w-0 self-center">
            <h1 className="text-[22px] font-bold leading-[1.15] tracking-normal text-[var(--text)] md:text-[26px]">
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
          <Button className="shrink-0 rounded-[var(--radius-md)] self-start" href="/profile/settings" size="sm" variant="primary">
            Редактировать
            <ArrowRight aria-hidden size={15} strokeWidth={1.8} />
          </Button>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center gap-3">
        <Button className="rounded-[var(--radius-md)]" href="/profile/responses" size="sm" variant="secondary">
          <FileText size={15} strokeWidth={1.8} />
          Мои отклики
        </Button>
        <Button className="rounded-[var(--radius-md)]" href="/profile/saved-vacancies" size="sm" variant="secondary">
          <Heart size={15} strokeWidth={1.8} />
          Сохранённые
        </Button>
        <Button className="rounded-[var(--radius-md)]" href="/profile/settings" size="sm" variant="secondary">
          <Settings size={15} strokeWidth={1.8} />
          Настройки
        </Button>
        <Button className="rounded-[var(--radius-md)]" href="/vacancies" size="sm" variant="ghost">
          <Search size={15} strokeWidth={1.8} />
          Найти вакансии
        </Button>
      </div>

      {profile && !profile.isPublic && profile.jobSearchStatus && profile.jobSearchStatus !== 'NOT_LOOKING' ? (
        <InlineAlert tone="warning">
          Профиль скрыт от работодателей. Чтобы вас могли найти, откройте профиль в{' '}
          <a className="font-semibold underline underline-offset-2 hover:text-[var(--warning-strong)]" href="/profile/settings">
            настройках
          </a>
          .
        </InlineAlert>
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
            <Button className="shrink-0 rounded-[var(--radius-md)]" href="/profile/settings" size="sm" variant="secondary">
              Заполнить профиль
            </Button>
          </div>
        </Panel>
      ) : completeness.percent < 100 ? (
        <Panel padding="lg" tone="elevated">
          <div className="flex items-center gap-4">
            <ProfileProgressRing percent={completeness.percent} />
            <div className="min-w-0">
              <h2 className="text-base font-semibold tracking-normal text-[var(--text)]">
                Профиль заполнен на {completeness.percent}%
              </h2>
              {completeness.missingFields.length > 0 ? (
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Не хватает: {completeness.missingFields.slice(0, 3).join(', ')}.
                </p>
              ) : (
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Добавьте недостающие поля, чтобы повысить шансы найти работу.
                </p>
              )}
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                Заполненный профиль помогает работодателям быстрее понять ваш опыт и принять решение.
              </p>
              <Button className="mt-2 rounded-[var(--radius-md)]" href="/profile/settings" size="sm" variant="secondary">
                Дозаполнить профиль
              </Button>
            </div>
          </div>
        </Panel>
      ) : null}

      {profile?.jobSearchStatus && profile.jobSearchStatus !== 'NOT_LOOKING' && (
        (profile.desiredSalary !== null && profile.desiredSalary !== undefined)
        || profile.employmentTypes.length > 0
        || profile.isPublic
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
            {profile.isPublic ? (
              <div className="flex items-baseline gap-2">
                <dt className="text-[var(--muted)]">Видимость:</dt>
                <dd className="font-semibold text-[var(--accent)]">Профиль открыт</dd>
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
