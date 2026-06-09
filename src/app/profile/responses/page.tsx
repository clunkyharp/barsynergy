import type { Metadata } from 'next';
import { Mail, Search } from 'lucide-react';
import { redirect } from 'next/navigation';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MetaChip } from '@/components/ui/meta-chip';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { UnreadBadge } from '@/components/messaging/unread-badge';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels,
  applicationTypeLabels
} from '@/modules/content/shared/labels';
import { firstParam } from '@/lib/admin/content-utils';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getUnreadMessageCounts } from '@/lib/messaging/get-conversation';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import {
  getUserResponses,
  ApplicationStatus,
  profileResponseStatusValues,
  profileResponseType
} from '@/modules/profile/queries';

const PAGE_SIZE = 20;

type ProfileResponsesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Мои отклики',
  description: 'История откликов на вакансии BARSYNERGY.'
});

export default async function ProfileResponsesPage({ searchParams }: ProfileResponsesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login?returnTo=/profile/responses');
  }

  const params = (await searchParams) ?? {};
  const statusFilter = firstParam(params.status);
  const q = firstParam(params.q);
  const sort = firstParam(params.sort) ?? 'desc';
  const page = Math.max(1, Number(firstParam(params.page)) || 1);

  const where: Record<string, unknown> = { userId: user.id,
    type: profileResponseType,
    status: { not: ApplicationStatus.DRAFT }
  };

  if (statusFilter && profileResponseStatusValues.includes(statusFilter as ApplicationStatus)) {
    where.status = statusFilter;
  }
  if (q) {
    where.OR = [
      { subject: { contains: q, mode: 'insensitive' } },
      { message: { contains: q, mode: 'insensitive' } }
    ];
  }

  const [responses, totalCount] = await getUserResponses(where, sort, page, PAGE_SIZE);

  const responseIds = responses.map((r) => r.id);
  const unreadCounts = await getUnreadMessageCounts(responseIds, 'user');

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function filterHref(overrides: Record<string, string | undefined>) {
    const url = new URL('/profile/responses', 'http://localhost');
    const merged: Record<string, string | undefined> = {};
    if (statusFilter) merged.status = statusFilter;
    if (q) merged.q = q;
    merged.sort = sort;
    Object.assign(merged, overrides);
    if (!merged.page) delete merged.page;
    Object.entries(merged).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    });
    return `${url.pathname}${url.search}`;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="История активности"
        description="История ваших откликов на вакансии."
        title="Мои отклики"
      />

      <form action="/profile/responses" className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <Input className="pl-9" defaultValue={q ?? ''} name="q" placeholder="Поиск по тексту..." />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select className="min-w-[140px]" defaultValue={statusFilter ?? ''} name="status">
            <option value="">Все статусы</option>
            {profileResponseStatusValues.map((s) => (
              <option key={s} value={s}>
                {applicationStatusLabels[s]}
              </option>
            ))}
          </Select>
          <Select className="min-w-[140px]" defaultValue={sort} name="sort">
            <option value="desc">Сначала новые</option>
            <option value="asc">Сначала старые</option>
          </Select>
          <Button type="submit" variant="secondary">Применить</Button>
        </div>
      </form>

      <div className="space-y-4">
        {responses.length === 0 ? (
          <Panel className="max-w-xl" padding="lg">
            <div className="flex flex-col items-start gap-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--accent-soft)] text-[var(--accent)]">
                <Mail aria-hidden="true" size={20} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="text-xl font-semibold leading-7 text-[var(--text)]">
                  {q || statusFilter ? 'Ничего не найдено' : 'Откликов пока нет'}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                  {q || statusFilter
                    ? 'Попробуйте изменить параметры поиска.'
                    : 'Найдите вакансию, войдите в аккаунт и откликнитесь — отклики появятся здесь. Отклики, отправленные без входа, могут не отображаться в истории.'}
                </p>
              </div>
              {q || statusFilter ? (
                <Button href="/profile/responses" variant="secondary">Сбросить фильтры</Button>
              ) : (
                <Button href="/vacancies">Смотреть вакансии →</Button>
              )}
            </div>
          </Panel>
        ) : (
          <>
            {responses.map((response) => (
              <Panel className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" key={response.id} padding="md" tone="elevated">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <MetaChip variant="filter">
                      {applicationTypeLabels[response.type]}
                    </MetaChip>
                    <span className="text-[var(--muted)]">•</span>
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(response.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <h3 className="mt-1 font-semibold truncate">
                    {response.vacancy ? (
                      <AppLink
                        className="hover:text-[var(--accent)] transition-colors duration-[var(--motion-duration-fast)]"
                        href={`/vacancies/${response.vacancy.slug}`}
                      >
                        {response.vacancy.title}
                      </AppLink>
                    ) : (
                      response.subject || 'Без темы'
                    )}
                  </h3>
                  {response.message && (
                    <p className="mt-1 text-sm text-[var(--muted)] line-clamp-1">{response.message}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <UnreadBadge count={unreadCounts.get(response.id) ?? 0} />
                  <StatusBadge variant={applicationStatusBadgeVariants[response.status]}>
                    {applicationStatusLabels[response.status]}
                  </StatusBadge>
                  <Button href={`/profile/responses/${response.id}`} size="sm" variant="secondary">
                    Подробнее
                  </Button>
                </div>
              </Panel>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 border-t border-[var(--line)] pt-4">
                <p className="text-sm text-[var(--muted)]">
                  Страница {page} из {totalPages}. Всего: {totalCount}.
                </p>
                <div className="flex gap-2">
                  <Button
                    disabled={page <= 1}
                    href={filterHref({ page: page > 1 ? String(page - 1) : undefined })}
                    variant="secondary"
                  >
                    Назад
                  </Button>
                  <Button
                    disabled={page >= totalPages}
                    href={filterHref({ page: page < totalPages ? String(page + 1) : undefined })}
                    variant="secondary"
                  >
                    Вперед
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
