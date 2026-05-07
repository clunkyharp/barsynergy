import { AdminActionAlert } from '@/components/admin/content-admin-controls';
import { RequestLedger } from '@/components/business/business-cabinet';
import { BusinessRequestForm } from '@/components/business/business-request-form';
import { PageHeader } from '@/components/ui/page-header';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { prisma } from '@/lib/db/prisma';

type BusinessRequestsPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function BusinessRequestsPage({ searchParams }: BusinessRequestsPageProps) {
  const { businessAccount } = await requireBusinessAccountAccess();
  const params = (await searchParams) ?? {};
  const [cities, applications] = await Promise.all([
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    }),
    prisma.application.findMany({
      where: { businessAccountId: businessAccount.id },
      orderBy: [{ createdAt: 'desc' }],
      take: 50,
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

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Бизнес-заявки" title="Заявки компании" />
      <AdminActionAlert params={params} />
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <BusinessRequestForm cities={cities} defaultCityId={businessAccount.cityId} />
        <RequestLedger
          applications={applications}
          className="h-fit"
          description="Все заявки компании, последние изменения и комментарии команды."
          emptyDescription="Заявок пока нет. Создайте первую запись в форме слева."
          title="Журнал компании"
        />
      </section>
    </div>
  );
}
