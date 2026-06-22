import type { Metadata } from 'next';
import { Mail, Search } from 'lucide-react';
import { redirect } from 'next/navigation';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { ConversationListTabs } from '@/components/messaging/conversation-list-tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { UnreadBadge } from '@/components/messaging/unread-badge';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels
} from '@/modules/content/shared/labels';
import { firstParam } from '@/lib/admin/content-ui';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getUnreadMessageCounts } from '@/lib/messaging/get-conversation';
import { sortConversationsByUnread } from '@/lib/messaging/sort-conversations-by-unread';
import { parseConversationStatusGroup } from '@/lib/messaging/conversation-status-groups';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { listUserResponses } from '@/modules/profile/queries';

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
  const statusGroup = parseConversationStatusGroup(firstParam(params.statusGroup));
  const q = firstParam(params.q);
  const sort = firstParam(params.sort) ?? 'desc';
  const page = Math.max(1, Number(firstParam(params.page)) || 1);

  const [responses, totalCount] = await listUserResponses({
    userId: user.id,
    statusGroup,
    q,
    sort,
    page,
    pageSize: PAGE_SIZE
  });

  const responseIds = responses.map((r) => r.id);
  const unreadCounts = await getUnreadMessageCounts(responseIds, 'user');
  const sortedResponses = sortConversationsByUnread(responses, unreadCounts);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function filterHref(overrides: Record<string, string | undefined>) {
    const url = new URL('/profile/responses', 'http://localhost');
    const merged: Record<string, string | undefined> = {};
    if (statusGroup !== 'active') merged.statusGroup = statusGroup;
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
      <PageHeader title="Мои отклики" />

      <ConversationListTabs value={statusGroup} />

      <form action="/profile/responses" className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
        {statusGroup !== 'active' ? <input name="statusGroup" type="hidden" value={statusGroup} /> : null}
        <input name="sort" type="hidden" value={sort} />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <Input className="pl-9" defaultValue={q ?? ''} name="q" placeholder="Поиск по тексту..." />
        </div>
        <Button href={filterHref({ sort: sort === 'asc' ? 'desc' : 'asc', page: undefined })} variant="secondary">
          {sort === 'asc' ? 'Сначала старые ↑' : 'Сначала новые ↓'}
        </Button>
      </form>

      <div className="space-y-4">
        {responses.length === 0 ? (
          <EmptyState
            icon={Mail}
            title={q || statusGroup !== 'active' ? 'Ничего не найдено' : 'Откликов пока нет'}
            description={q || statusGroup !== 'active'
              ? 'Попробуйте изменить параметры поиска.'
              : 'Отклики на вакансии появятся здесь после отправки из аккаунта.'}
            actions={[{
              label: q || statusGroup !== 'active' ? 'Сбросить фильтры' : 'Смотреть вакансии →',
              href: q || statusGroup !== 'active' ? '/profile/responses' : '/vacancies'
            }]}
          />
        ) : (
          <>
            {sortedResponses.map((response) => (
              <Panel className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" key={response.id} padding="md" tone="elevated">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
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
