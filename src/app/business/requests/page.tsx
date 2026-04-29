import { AdminActionAlert } from '@/components/admin/content-admin-controls';
import { BusinessRequestForm } from '@/components/business/business-request-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels,
  applicationTypeLabels
} from '@/lib/admin/application-utils';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { prisma } from '@/lib/db/prisma';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

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
        <section>
          <h2 className="text-xl font-semibold">История заявок</h2>
          <div className="mt-4 grid gap-3">
            {applications.length > 0 ? (
              applications.map((application) => (
                <Card className="p-4" key={application.id}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-[var(--muted)]">{applicationTypeLabels[application.type]}</p>
                      <h3 className="mt-1 font-semibold">{application.subject ?? applicationTypeLabels[application.type]}</h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">{dateFormatter.format(application.createdAt)}</p>
                      {application.businessNotes ? (
                        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{application.businessNotes}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <Badge variant={applicationStatusBadgeVariants[application.status]}>
                        {applicationStatusLabels[application.status]}
                      </Badge>
                      <Button href={`/business/requests/${application.id}`} variant="secondary">
                        Открыть
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-5 text-sm text-[var(--muted)]">У компании пока нет заявок.</Card>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
