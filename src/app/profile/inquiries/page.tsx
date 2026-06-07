import type { Metadata } from 'next';
import { MessageSquare } from 'lucide-react';
import { redirect } from 'next/navigation';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { UnreadBadge } from '@/components/messaging/unread-badge';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels
} from '@/lib/admin/application-utils';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getUnreadMessageCounts } from '@/lib/messaging/get-conversation';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import {
  getUserInquiries,
  inquiryResponseStatusValues,
  ApplicationStatus
} from '@/modules/profile/queries';

const PAGE_SIZE = 20;

type ProfileInquiriesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Мои запросы поставщикам',
  description: 'История запросов поставщикам BARSYNERGY.'
});

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProfileInquiriesPage({ searchParams }: ProfileInquiriesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login?returnTo=/profile/inquiries');
  }

  const params = (await searchParams) ?? {};
  const statusFilter = firstParam(params.status);
  const sort = firstParam(params.sort) ?? 'desc';
  const page = Math.max(1, Number(firstParam(params.page)) || 1);

  if (statusFilter && !inquiryResponseStatusValues.includes(statusFilter as ApplicationStatus)) {
    redirect('/profile/inquiries');
  }

  const [inquiries, totalCount] = await getUserInquiries(user.id, sort, page, PAGE_SIZE);
  const inquiryIds = inquiries.map((i) => i.id);
  const unreadCounts = await getUnreadMessageCounts(inquiryIds, 'user');
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function filterHref(overrides: Record<string, string | undefined>) {
    const url = new URL('/profile/inquiries', 'http://localhost');
    const merged: Record<string, string | undefined> = {};
    if (statusFilter) merged.status = statusFilter;
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
        eyebrow="История запросов"
        description="Запросы к поставщикам и переписка с платформой."
        title="Запросы поставщикам"
      />

      <form action="/profile/inquiries" className="flex flex-wrap gap-2">
        <Select className="min-w-[140px]" defaultValue={statusFilter ?? ''} name="status">
          <option value="">Все статусы</option>
          {inquiryResponseStatusValues.map((s) => (
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
      </form>

      <div className="space-y-4">
        {inquiries.length === 0 ? (
          <Panel className="max-w-xl" padding="lg">
            <div className="flex flex-col items-start gap-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--accent-soft)] text-[var(--accent)]">
                <MessageSquare aria-hidden="true" size={20} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="text-xl font-semibold leading-7 text-[var(--text)]">
                  Запросов пока нет
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                  Найдите поставщика в каталоге и отправьте запрос — переписка появится здесь.
                </p>
              </div>
              <Button href="/suppliers">Смотреть поставщиков</Button>
            </div>
          </Panel>
        ) : (
          <>
            {inquiries.map((inquiry) => (
              <Panel className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" key={inquiry.id} padding="md" tone="elevated">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(inquiry.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <h3 className="mt-1 font-semibold truncate">
                    {inquiry.supplier ? (
                      <AppLink
                        className="hover:text-[var(--accent)] transition-colors duration-[var(--motion-duration-fast)]"
                        href={`/suppliers/${inquiry.supplier.slug}`}
                      >
                        {inquiry.supplier.title}
                      </AppLink>
                    ) : (
                      inquiry.subject || 'Запрос поставщику'
                    )}
                  </h3>
                  {inquiry.message && (
                    <p className="mt-1 text-sm text-[var(--muted)] line-clamp-1">{inquiry.message}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <UnreadBadge count={unreadCounts.get(inquiry.id) ?? 0} />
                  <StatusBadge variant={applicationStatusBadgeVariants[inquiry.status]}>
                    {applicationStatusLabels[inquiry.status]}
                  </StatusBadge>
                  <Button href={`/profile/inquiries/${inquiry.id}`} size="sm" variant="secondary">
                    Открыть
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
