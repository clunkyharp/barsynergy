import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConversationListTabs } from '@/components/messaging/conversation-list-tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { UnreadBadge } from '@/components/messaging/unread-badge';
import { AppLink } from '@/components/ui/app-link';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { firstParam } from '@/lib/admin/content-utils';
import { getUnreadMessageCounts } from '@/lib/messaging/get-conversation';
import { sortConversationsByUnread } from '@/lib/messaging/sort-conversations-by-unread';
import { parseConversationStatusGroup } from '@/lib/messaging/conversation-status-groups';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels
} from '@/lib/admin/application-utils';
import {
  getBusinessResponses
} from '@/modules/business/queries';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Отклики на вакансии',
  description: 'Отклики кандидатов на вакансии компании.'
});

type BusinessResponsesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BusinessResponsesPage({ searchParams }: BusinessResponsesPageProps) {
  const { businessAccount } = await requireBusinessAccountAccess();
  const params = (await searchParams) ?? {};
  const statusGroup = parseConversationStatusGroup(firstParam(params.statusGroup));

  const responses = await getBusinessResponses(businessAccount.id, statusGroup);

  const responseIds = responses.map((r) => r.id);
  const unreadCounts = await getUnreadMessageCounts(responseIds, 'business');
  const sortedResponses = sortConversationsByUnread(responses, unreadCounts);

  return (
    <div className="space-y-6">
      <PageHeader title="Отклики" />

      <ConversationListTabs value={statusGroup} />

      {responses.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={statusGroup === 'active' ? 'Откликов пока нет' : 'В этом разделе пусто'}
          description={statusGroup === 'active'
            ? 'Когда кандидаты начнут откликаться на ваши вакансии, отклики появятся здесь.'
            : 'Переключите вкладку или вернитесь к активным откликам.'}
          actions={[{
            label: statusGroup === 'active' ? 'К заявкам' : 'Активные отклики',
            href: statusGroup === 'active' ? '/business/cabinet/requests' : '/business/cabinet/responses'
          }]}
        />
      ) : (
        <div className="space-y-4">
          {sortedResponses.map((response) => (
            <Panel key={response.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" padding="md" tone="elevated">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge variant={applicationStatusBadgeVariants[response.status]}>
                    {applicationStatusLabels[response.status]}
                  </StatusBadge>
                  <span className="text-[var(--muted)]">•</span>
                  <span className="text-xs text-[var(--muted)]">
                    {new Date(response.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <h3 className="mt-1 font-semibold truncate">
                  {response.name || 'Без имени'}
                </h3>
                {response.vacancy && (
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    На вакансию:{' '}
                    <AppLink className="hover:text-[var(--accent)] transition-colors" href={`/vacancies/${response.vacancy.slug}`}>
                      {response.vacancy.title}
                    </AppLink>
                  </p>
                )}
                {response.message && (
                  <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">{response.message}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <UnreadBadge count={unreadCounts.get(response.id) ?? 0} />
                <Button href={`/business/cabinet/responses/${response.id}`} size="sm" variant="secondary">
                  Подробнее
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
