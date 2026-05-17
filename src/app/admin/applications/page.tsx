import { ApplicationStatus, ApplicationType, type Prisma } from '@prisma/client';
import { AdminFilterBar, AdminPagination } from '@/components/admin/content-admin-controls';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { Button } from '@/components/ui/button';
import {
  DataTable,
  DataTableActionRow,
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
import { AdminStatusChip } from '@/components/ui/status-badge';
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

const activeQuickFilterStyle = {
  background: 'var(--admin-filter-active-bg)',
  borderColor: 'var(--admin-filter-active-border)',
  color: 'var(--admin-filter-active-text)'
};

type AdminApplicationsPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

function applicationActionLabel(application: {
  type: ApplicationType;
  status: ApplicationStatus;
  vacancy: { title: string; slug: string } | null;
  supplier: { title: string; slug: string } | null;
  partner: { title: string; slug: string } | null;
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
    return 'Опубликовать вакансию';
  }

  if (application.type === ApplicationType.SUPPLIER_SUBMISSION && application.status === ApplicationStatus.APPROVED && !application.supplier) {
    return 'Опубликовать поставщика';
  }

  if (application.type === ApplicationType.PARTNER_APPLICATION && application.status === ApplicationStatus.APPROVED && !application.partner) {
    return 'Опубликовать партнёра';
  }

  if (!application.consentAcceptedAt && application.type !== ApplicationType.CONTACT_MESSAGE) {
    return 'Проверить согласие';
  }

  return 'Контроль не требуется';
}

function getPayloadText(payload: Prisma.JsonValue | null, keys: string[]) {
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
    return null;
  }

  for (const key of keys) {
    const value = (payload as Record<string, Prisma.JsonValue>)[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function applicationPersonOrCompany(application: {
  businessAccount: { companyName: string } | null;
  email: string | null;
  name: string | null;
  payload: Prisma.JsonValue | null;
  phone: string | null;
  subject: string | null;
  telegram: string | null;
}) {
  const companyName = application.businessAccount?.companyName ?? getPayloadText(application.payload, ['companyName', 'employerCompanyName']);
  const primary = companyName ?? application.name?.trim() ?? application.subject?.trim() ?? application.email ?? 'Не указано';
  const secondary = [application.name && companyName ? application.name : null, application.email, application.phone, application.telegram]
    .filter(Boolean)
    .join(' / ');

  return { primary, secondary };
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
        payload: true,
        resumeFileId: true,
        consentAcceptedAt: true,
        createdAt: true,
        city: { select: { name: true } },
        vacancy: { select: { title: true, slug: true } },
        supplier: { select: { title: true, slug: true } },
        partner: { select: { title: true, slug: true } },
        businessAccount: { select: { companyName: true } }
      }
    })
  ]);
  const totalPages = getAdminTotalPages(total);
  const hasActiveFilters = Boolean(search || selectedType || selectedStatus);

  return (
    <div className="space-y-8">
      <AdminPageIntro
        description="Очередь входящих форм, фильтрация по типу и контроль приватных полей до открытия записи."
        eyebrow="Админка / Заявки"
        title="Заявки"
      />

      <AdminFilterBar
        action={ADMIN_APPLICATIONS_PATH}
        summary="Поиск по входящим заявкам, типам и рабочим статусам."
      >
        <FormField htmlFor="search" label="Поиск">
          <Input id="search" name="search" defaultValue={search} placeholder="Поиск по заявке" />
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
        <DataTableActionRow className="justify-start xl:col-span-full">
          <Button type="submit" variant="secondary">
            Применить
          </Button>
          <Button href={ADMIN_APPLICATIONS_PATH} type="button" variant="ghost">
            Сбросить
          </Button>
        </DataTableActionRow>
      </AdminFilterBar>

      <DataTableActionRow className="justify-start">
        <Button
          className={!selectedStatus ? 'admin-filter-active' : undefined}
          href={ADMIN_APPLICATIONS_PATH}
          size="sm"
          style={!selectedStatus ? activeQuickFilterStyle : undefined}
          variant="secondary"
        >
          Все
        </Button>
        {quickStatusFilters.map((item) => (
          <Button
            href={`${ADMIN_APPLICATIONS_PATH}?status=${encodeURIComponent(item.status)}`}
            key={item.status}
            size="sm"
            className={selectedStatus === item.status ? 'admin-filter-active' : undefined}
            style={selectedStatus === item.status ? activeQuickFilterStyle : undefined}
            variant="secondary"
          >
            {item.label}
          </Button>
        ))}
      </DataTableActionRow>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Очередь заявок</h2>
            <p className="text-sm text-[var(--muted)]">Всего записей: {total}.</p>
          </div>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            actionHref={hasActiveFilters ? ADMIN_APPLICATIONS_PATH : undefined}
            actionLabel={hasActiveFilters ? 'Сбросить фильтры' : undefined}
            description={hasActiveFilters ? 'По текущим фильтрам заявок нет.' : 'Когда пользователи отправят формы, заявки появятся в этой очереди.'}
            title={hasActiveFilters ? 'Заявки не найдены' : 'Заявок пока нет'}
          />
        ) : (
          <DataTableFrame>
            <DataTable minWidth={1320}>
              <DataTableHead>
                <tr>
                  <DataTableHeaderCell>Тип заявки</DataTableHeaderCell>
                  <DataTableHeaderCell>Имя / компания</DataTableHeaderCell>
                  <DataTableHeaderCell>Город</DataTableHeaderCell>
                  <DataTableHeaderCell>Статус</DataTableHeaderCell>
                  <DataTableHeaderCell>Файлы / согласия</DataTableHeaderCell>
                  <DataTableHeaderCell>Создана</DataTableHeaderCell>
                  <DataTableHeaderCell>Следующий шаг</DataTableHeaderCell>
                  <DataTableActionsHeaderCell>Действия</DataTableActionsHeaderCell>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {applications.map((application) => {
                  const actionLabel = applicationActionLabel(application);
                  const identity = applicationPersonOrCompany(application);

                  return (
                    <DataTableRow key={application.id}>
                      <DataTableCell className="max-w-[240px]">
                        <DataTableClamp className="font-semibold">{applicationTypeLabels[application.type]}</DataTableClamp>
                        {application.subject ? <DataTableClamp className="mt-1 text-xs text-[var(--muted)]">{application.subject}</DataTableClamp> : null}
                      </DataTableCell>
                      <DataTableCell className="max-w-[300px]">
                        <DataTableClamp className="font-semibold">{identity.primary}</DataTableClamp>
                        {identity.secondary ? <DataTableClamp className="mt-1 text-xs text-[var(--muted)]">{identity.secondary}</DataTableClamp> : null}
                      </DataTableCell>
                      <DataTableCell className="text-[var(--muted)]">
                        <div>{application.city?.name ?? 'Город не указан'}</div>
                        {application.vacancy ? (
                          <div className="mt-1 text-xs">
                            <DataTableClamp>Вакансия: {application.vacancy.title}</DataTableClamp>
                            <DataTableClamp className="mt-1 text-[var(--muted)]">/{application.vacancy.slug}</DataTableClamp>
                          </div>
                        ) : null}
                        {application.supplier ? (
                          <div className="mt-1 text-xs">
                            <DataTableClamp>Поставщик: {application.supplier.title}</DataTableClamp>
                            <DataTableClamp className="mt-1 text-[var(--muted)]">/{application.supplier.slug}</DataTableClamp>
                          </div>
                        ) : null}
                        {application.partner ? (
                          <div className="mt-1 text-xs">
                            <DataTableClamp>Партнёр: {application.partner.title}</DataTableClamp>
                            <DataTableClamp className="mt-1 text-[var(--muted)]">/{application.partner.slug}</DataTableClamp>
                          </div>
                        ) : null}
                      </DataTableCell>
                      <DataTableCell>
                        <AdminStatusChip variant={applicationStatusBadgeVariants[application.status]}>
                          {applicationStatusLabels[application.status]}
                        </AdminStatusChip>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {application.resumeFileId ? <AdminStatusChip variant="neutral">Резюме</AdminStatusChip> : null}
                          {application.consentAcceptedAt ? <AdminStatusChip variant="success">Согласие</AdminStatusChip> : null}
                          {application.email || application.phone || application.telegram ? <AdminStatusChip variant="neutral">Контакты</AdminStatusChip> : null}
                          {!application.resumeFileId && !application.consentAcceptedAt && !application.email && !application.phone && !application.telegram ? (
                            <span className="text-sm text-[var(--muted)]">Нет</span>
                          ) : null}
                        </div>
                      </DataTableCell>
                      <DataTableCell className="text-[var(--muted)]">
                        {dateTimeFormatter.format(application.createdAt)}
                      </DataTableCell>
                      <DataTableCell className="max-w-[260px]">
                        <DataTableClamp className={actionLabel === 'Контроль не требуется' ? 'text-[var(--muted)]' : 'font-medium'}>
                          {actionLabel}
                        </DataTableClamp>
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
