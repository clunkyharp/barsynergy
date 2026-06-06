import type { Metadata } from 'next';
import { AdminActionAlert } from '@/components/admin/content-admin-controls';
import { RequestLedger } from '@/components/business/business-cabinet';
import { BusinessRequestForm } from '@/components/business/business-request-form';
import { PageHeader } from '@/components/ui/page-header';
import { firstParam } from '@/lib/admin/content-utils';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { prisma } from '@/lib/db/prisma';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';

const PAGE_SIZE = 10;

type BusinessRequestsPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Заявки компании',
  description: 'Закрытый раздел BARSYNERGY для создания и отслеживания заявок компании.'
});

export default async function BusinessRequestsPage({ searchParams }: BusinessRequestsPageProps) {
  const { businessAccount } = await requireBusinessAccountAccess();
  const params = (await searchParams) ?? {};
  const page = Math.max(1, Number(firstParam(params.page) ?? '1'));
  const skip = (page - 1) * PAGE_SIZE;

  const [cities, totalCount, applications] = await Promise.all([
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    }),
    prisma.application.count({
      where: { businessAccountId: businessAccount.id }
    }),
    prisma.application.findMany({
      where: { businessAccountId: businessAccount.id },
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        type: true,
        status: true,
        subject: true,
        businessNotes: true,
        createdAt: true
      }
    })
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Бизнес-заявки" title="Заявки компании" />
      <AdminActionAlert params={params} />
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <BusinessRequestForm cities={cities} defaultCityId={businessAccount.cityId} />
        <div className="space-y-4">
          <RequestLedger
            applications={applications}
            className="h-fit"
            description="Все заявки компании, последние изменения и комментарии команды."
            emptyDescription="Заявок пока нет. Создайте первую запись в форме слева."
            title="Журнал компании"
          />
          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
              <p>
                Страница {page} из {totalPages} (всего {totalCount})
              </p>
              <div className="flex gap-2">
                {page > 1 ? (
                  <a
                    className="inline-flex min-h-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-muted)]"
                    href={page === 2 ? '/business/cabinet/requests' : `/business/cabinet/requests?page=${page - 1}`}
                  >
                    Назад
                  </a>
                ) : null}
                {page < totalPages ? (
                  <a
                    className="inline-flex min-h-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-muted)]"
                    href={`/business/cabinet/requests?page=${page + 1}`}
                  >
                    Вперед
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
