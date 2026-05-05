import { ApplicationStatus, ApplicationType, type Prisma } from '@prisma/client';
import { AdminPagination } from '@/components/admin/content-admin-controls';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DataTable,
  DataTableActionsCell,
  DataTableActionsHeaderCell,
  DataTableBody,
  DataTableCell,
  DataTableClamp,
  DataTableFrame,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow
} from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
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

const quickStatusFilters = [
  { label: 'Новые', status: ApplicationStatus.NEW },
  { label: 'На проверке', status: ApplicationStatus.IN_REVIEW },
  { label: 'Одобрены', status: ApplicationStatus.APPROVED },
  { label: 'Завершены', status: ApplicationStatus.COMPLETED }
] as const;

type AdminApplicationsPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

function applicationActionLabel(application: {
  type: ApplicationType;
  status: ApplicationStatus;
  vacancy: { title: string; slug: string } | null;
  resumeFileId: string | null;
  consentAcceptedAt: Date | null;
}) {
  if (application.status === ApplicationStatus.NEW && application.type === ApplicationType.BUSINESS_ACCOUNT_REQUEST) {
    return 'Проверить бизнес-заявку';
  }

  if (application.status === ApplicationStatus.NEW && application.type === ApplicationType.VACANCY_RESPONSE && application.resumeFileId) {
    return 'Проверить отклик';
  }

  if (application.status === ApplicationStatus.NEW) {
    return 'Назначить следующий статус';
  }

  if (application.status === ApplicationStatus.IN_REVIEW) {
    return 'Завершить проверку';
  }

  if (application.status === ApplicationStatus.PAYMENT_PENDING) {
    return 'Проверить оплату';
  }

  if (application.type === ApplicationType.VACANCY_SUBMISSION && application.status === ApplicationStatus.APPROVED && !application.vacancy) {
    return 'Создать черновик вакансии';
  }

  if (!application.consentAcceptedAt && application.type !== ApplicationType.CONTACT_MESSAGE) {
    return 'Проверить согласие';
  }

  return 'Контроль не требуется';
}

export default async function AdminApplicationsPage({ searchParams }: AdminApplicationsPageProps) {
  await requireAdminSectionAccess('applications');

  const params = (await searchParams) ?? {};
  const page = getAdminPage(params);
  const search = firstParam(params.search)?.trim() ?? '';
  const selectedType = parseApplicationType(firstParam(params.type));
  const selectedStatus = parseApplicationStatus(firstParam(params.status));
  const searchWhere: Prisma.ApplicationWhereInput = search
    ? {
        OR: [
          { subject: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { telegram: { contains: search, mode: 'insensitive' } }
        ]
      }
    : {};
  const where: Prisma.ApplicationWhereInput = {
    ...searchWhere,
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
        name: true,
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
        <form className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr_auto]" method="get">
          <FormField htmlFor="search" label="Поиск">
            <Input id="search" name="search" defaultValue={search} placeholder="Имя, компания, email, Telegram" />
          </FormField>
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

      <div className="flex flex-wrap gap-2">
        <Button href={ADMIN_APPLICATIONS_PATH} size="sm" variant={!selectedStatus ? 'primary' : 'secondary'}>
          Все
        </Button>
        {quickStatusFilters.map((item) => (
          <Button
            href={`${ADMIN_APPLICATIONS_PATH}?status=${encodeURIComponent(item.status)}`}
            key={item.status}
            size="sm"
            variant={selectedStatus === item.status ? 'primary' : 'secondary'}
          >
            {item.label}
          </Button>
        ))}
      </div>

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
            <DataTable minWidth={980}>
              <DataTableHead>
                <tr>
                  <DataTableHeaderCell>Заявка</DataTableHeaderCell>
                  <DataTableHeaderCell>Статус</DataTableHeaderCell>
                  <DataTableHeaderCell>Город</DataTableHeaderCell>
                  <DataTableHeaderCell>Файлы</DataTableHeaderCell>
                  <DataTableHeaderCell>Требует действия</DataTableHeaderCell>
                  <DataTableHeaderCell>Создана</DataTableHeaderCell>
                  <DataTableActionsHeaderCell>Действия</DataTableActionsHeaderCell>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {applications.map((application) => {
                  const actionLabel = applicationActionLabel(application);

                  return (
                    <DataTableRow key={application.id}>
                      <DataTableCell className="max-w-[320px]">
                        <DataTableClamp className="font-semibold">
                          {application.subject?.trim() || application.name?.trim() || applicationTypeLabels[application.type]}
                        </DataTableClamp>
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
                          <DataTableClamp className="mt-1 text-xs">
                            Вакансия: {application.vacancy.title} /{application.vacancy.slug}
                          </DataTableClamp>
                        ) : null}
                      </DataTableCell>
                      <DataTableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {application.resumeFileId ? <StatusBadge variant="neutral">Резюме</StatusBadge> : null}
                          {application.consentAcceptedAt ? <StatusBadge variant="success">Согласие</StatusBadge> : null}
                          {application.email || application.phone || application.telegram ? <StatusBadge variant="neutral">Контакты</StatusBadge> : null}
                          {!application.resumeFileId && !application.consentAcceptedAt && !application.email && !application.phone && !application.telegram ? (
                            <span className="text-sm text-[var(--muted)]">Нет</span>
                          ) : null}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <DataTableClamp className={actionLabel === 'Контроль не требуется' ? 'text-[var(--muted)]' : 'font-medium'}>
                          {actionLabel}
                        </DataTableClamp>
                      </DataTableCell>
                      <DataTableCell className="text-[var(--muted)]">
                        {dateTimeFormatter.format(application.createdAt)}
                      </DataTableCell>
                      <DataTableActionsCell>
                        <Button className="min-h-9 px-3 py-1.5 text-xs" href={`/admin/applications/${application.id}`} variant="secondary">
                          Открыть
                        </Button>
                      </DataTableActionsCell>
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
