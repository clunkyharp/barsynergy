import { AdminPagination } from '@/components/admin/content-admin-controls';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableFrame,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow
} from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { FormField } from '@/components/ui/form-field';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels,
  applicationStatusValues,
  applicationTypeLabels,
  applicationTypeValues,
  parseApplicationStatus,
  parseApplicationType
} from '@/lib/admin/application-utils';
import {
  ADMIN_CONTENT_PAGE_SIZE,
  firstParam,
  getAdminPage,
  getAdminTotalPages,
  type AdminContentSearchParams
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_APPLICATIONS_PATH = '/admin/applications';

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

type AdminApplicationsPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminApplicationsPage({ searchParams }: AdminApplicationsPageProps) {
  await requireAdminSectionAccess('applications');

  const params = (await searchParams) ?? {};
  const page = getAdminPage(params);
  const selectedType = parseApplicationType(firstParam(params.type));
  const selectedStatus = parseApplicationStatus(firstParam(params.status));
  const where = {
    ...(selectedType ? { type: selectedType } : {}),
    ...(selectedStatus ? { status: selectedStatus } : {})
  };

  const [total, applications] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      skip: (page - 1) * ADMIN_CONTENT_PAGE_SIZE,
      take: ADMIN_CONTENT_PAGE_SIZE,
      select: {
        id: true,
        type: true,
        status: true,
        subject: true,
        email: true,
        phone: true,
        telegram: true,
        resumeFileId: true,
        consentAcceptedAt: true,
        createdAt: true,
        city: { select: { name: true } },
        vacancy: { select: { title: true, slug: true } }
      }
    })
  ]);
  const totalPages = getAdminTotalPages(total);

  return (
    <div className="space-y-8">
      <AdminPageIntro
        description="Очередь входящих форм, фильтрация по типу и контроль приватных полей до открытия записи."
        eyebrow="Админка / Заявки"
        title="Заявки"
      />

      <Card className="p-5">
        <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto]" method="get">
          <FormField htmlFor="type" label="Тип">
            <Select id="type" name="type" defaultValue={selectedType ?? ''}>
              <option value="">Все типы</option>
              {applicationTypeValues.map((type) => (
                <option key={type} value={type}>
                  {applicationTypeLabels[type]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="status" label="Статус">
            <Select id="status" name="status" defaultValue={selectedStatus ?? ''}>
              <option value="">Все статусы</option>
              {applicationStatusValues.map((status) => (
                <option key={status} value={status}>
                  {applicationStatusLabels[status]}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="flex items-end gap-3">
            <Button type="submit">Фильтр</Button>
            <Button href={ADMIN_APPLICATIONS_PATH} type="button" variant="secondary">
              Сбросить
            </Button>
          </div>
        </form>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Очередь заявок</h2>
            <p className="text-sm text-[var(--muted)]">Всего записей: {total}.</p>
          </div>
        </div>

        {applications.length === 0 ? (
          <EmptyState title="Заявок пока нет" />
        ) : (
          <DataTableFrame>
            <DataTable minWidth={1000}>
              <DataTableHead>
                <tr>
                  <DataTableHeaderCell>Заявка</DataTableHeaderCell>
                  <DataTableHeaderCell>Статус</DataTableHeaderCell>
                  <DataTableHeaderCell>Связи</DataTableHeaderCell>
                  <DataTableHeaderCell>Приватные поля</DataTableHeaderCell>
                  <DataTableHeaderCell>Создана</DataTableHeaderCell>
                  <DataTableHeaderCell>Действия</DataTableHeaderCell>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {applications.map((application) => {
                  const privateFlags = [
                    application.email ? 'email' : null,
                    application.phone ? 'телефон' : null,
                    application.telegram ? 'telegram' : null,
                    application.resumeFileId ? 'резюме' : null,
                    application.consentAcceptedAt ? 'согласие' : null
                  ].filter(Boolean);

                  return (
                    <DataTableRow key={application.id}>
                      <DataTableCell className="max-w-[320px]">
                        <div className="font-semibold">
                          {application.subject?.trim() || applicationTypeLabels[application.type]}
                        </div>
                        <div className="mt-1 text-xs text-[var(--muted)]">{applicationTypeLabels[application.type]}</div>
                      </DataTableCell>
                      <DataTableCell>
                        <StatusBadge variant={applicationStatusBadgeVariants[application.status]}>
                          {applicationStatusLabels[application.status]}
                        </StatusBadge>
                      </DataTableCell>
                      <DataTableCell className="text-[var(--muted)]">
                        <div>{application.city?.name ?? 'Город не указан'}</div>
                        {application.vacancy ? (
                          <div className="mt-1 text-xs">
                            Вакансия: {application.vacancy.title} /{application.vacancy.slug}
                          </div>
                        ) : null}
                      </DataTableCell>
                      <DataTableCell className="text-[var(--muted)]">
                        {privateFlags.length > 0 ? privateFlags.join(', ') : 'Не зафиксированы'}
                      </DataTableCell>
                      <DataTableCell className="text-[var(--muted)]">
                        {dateTimeFormatter.format(application.createdAt)}
                      </DataTableCell>
                      <DataTableCell>
                        <Button className="min-h-9 px-3 py-1.5 text-xs" href={`/admin/applications/${application.id}`} variant="secondary">
                          Открыть
                        </Button>
                      </DataTableCell>
                    </DataTableRow>
                  );
                })}
              </DataTableBody>
            </DataTable>
          </DataTableFrame>
        )}

        <AdminPagination
          basePath={ADMIN_APPLICATIONS_PATH}
          page={page}
          pageSize={ADMIN_CONTENT_PAGE_SIZE}
          params={params}
          total={total}
          totalPages={totalPages}
        />
      </section>
    </div>
  );
}
