import { ApplicationType } from '@/modules/admin/queries';
import { publishContentFromApplication } from '@/app/admin/applications/actions';
import { AdminActionAlert, AdminFilterBar, AdminPagination, AdminStatusTabs } from '@/components/admin/content-admin-controls';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { Button } from '@/components/ui/button';
import { ApplicationTableRow } from '@/components/admin/applications-table-row';
import {
  DataTable,
  DataTableActionRow,
  DataTableActionsHeaderCell,
  DataTableBody,
  DataTableFrame,
  DataTableHead,
  DataTableHeaderCell,
  DataTableStateRow
} from '@/components/ui/data-table';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
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
import { listAdminApplications } from '@/modules/admin/applications/queries';
import {
  ADMIN_APPLICATIONS_PATH,
  quickStatusFilters
} from '@/lib/admin/application-page-helpers';

export const dynamic = 'force-dynamic';

type AdminApplicationsPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminApplicationsPage({ searchParams }: AdminApplicationsPageProps) {
  await requireAdminSectionAccess('applications');

  const params = (await searchParams) ?? {};
  const page = getAdminPage(params);
  const search = firstParam(params.search)?.trim() ?? '';
  const selectedType = parseApplicationType(firstParam(params.type));
  const selectedStatus = parseApplicationStatus(firstParam(params.status));
  const { applications, total } = await listAdminApplications({
    page,
    search,
    type: selectedType,
    status: selectedStatus
  });
  const totalPages = getAdminTotalPages(total);
  const hasActiveFilters = Boolean(search || selectedType || selectedStatus);

  function hrefWithoutType(type: ApplicationType | '') {
    const sp = new URLSearchParams();
    if (type) sp.set('type', type);
    const q = sp.toString();
    return `${ADMIN_APPLICATIONS_PATH}${q ? `?${q}` : ''}`;
  }

  const currentParams = new URLSearchParams();
  if (search) currentParams.set('search', search);
  if (selectedType) currentParams.set('type', selectedType);
  if (selectedStatus) currentParams.set('status', selectedStatus);
  if (page > 1) currentParams.set('page', String(page));
  const currentPath = `${ADMIN_APPLICATIONS_PATH}${currentParams.toString() ? `?${currentParams.toString()}` : ''}`;

  return (
    <div className="space-y-8">
      <AdminPageIntro
        description="Очередь входящих форм, фильтрация по типу и контроль приватных полей до открытия записи."
        eyebrow="Админка / Заявки"
        title="Заявки"
      />
      <AdminActionAlert params={params} />

      <AdminStatusTabs
        items={[
          { current: !selectedType, href: hrefWithoutType(''), label: 'Все' },
          { current: selectedType === ApplicationType.VACANCY_RESPONSE, href: hrefWithoutType(ApplicationType.VACANCY_RESPONSE), label: 'Отклики' },
          { current: selectedType === ApplicationType.VACANCY_SUBMISSION, href: hrefWithoutType(ApplicationType.VACANCY_SUBMISSION), label: 'Размещения вакансий' },
          { current: selectedType === ApplicationType.CERTIFICATE_ORDER, href: hrefWithoutType(ApplicationType.CERTIFICATE_ORDER), label: 'Заказы' },
          { current: selectedType === ApplicationType.SUPPLIER_SUBMISSION, href: hrefWithoutType(ApplicationType.SUPPLIER_SUBMISSION), label: 'Заявки поставщиков' },
          { current: selectedType === ApplicationType.MASTER_INQUIRY, href: hrefWithoutType(ApplicationType.MASTER_INQUIRY), label: 'Запросы мастерам' },
          { current: selectedType === ApplicationType.MASTER_SUBMISSION, href: hrefWithoutType(ApplicationType.MASTER_SUBMISSION), label: 'Анкеты мастеров' },
          { current: selectedType === ApplicationType.PARTNER_APPLICATION, href: hrefWithoutType(ApplicationType.PARTNER_APPLICATION), label: 'Партнёры' },
          { current: selectedType === ApplicationType.BUSINESS_ACCOUNT_REQUEST, href: hrefWithoutType(ApplicationType.BUSINESS_ACCOUNT_REQUEST), label: 'Бизнес-доступ' },
          { current: selectedType === ApplicationType.CONTACT_MESSAGE, href: hrefWithoutType(ApplicationType.CONTACT_MESSAGE), label: 'Контакты' }
        ]}
        label="Типы заявок"
      />

      <AdminFilterBar action={ADMIN_APPLICATIONS_PATH}>
        {selectedType ? <input name="type" type="hidden" value={selectedType} /> : null}
        <FormField htmlFor="search" label="Поиск">
          <Input id="search" name="search" defaultValue={search} placeholder="Поиск по заявке" />
        </FormField>
        <FormField htmlFor="status-filter" label="Статус">
          <Select defaultValue={selectedStatus ?? ''} id="status-filter" name="status">
            <option value="">Все статусы</option>
            {quickStatusFilters.map((item) => (
              <option key={item.status} value={item.status}>{item.label}</option>
            ))}
          </Select>
        </FormField>
        <DataTableActionRow className="justify-start xl:col-span-full">
          <Button type="submit" variant="secondary">Применить</Button>
          <Button href={ADMIN_APPLICATIONS_PATH} type="button" variant="ghost">Сбросить</Button>
        </DataTableActionRow>
      </AdminFilterBar>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Очередь заявок</h2>
            <p className="text-sm text-[var(--muted)]">Всего записей: {total}.</p>
          </div>
        </div>

        <DataTableFrame>
          <DataTable minWidth={1040}>
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
              {applications.length === 0 ? (
                <DataTableStateRow
                  colSpan={8}
                  description={hasActiveFilters ? 'По текущим фильтрам заявок нет.' : 'Когда пользователи отправят формы, заявки появятся в этой очереди.'}
                  state={hasActiveFilters ? 'no-results' : 'empty'}
                  title={hasActiveFilters ? 'Заявки не найдены' : 'Заявок пока нет'}
                />
              ) : (
                applications.map((application) => (
                  <ApplicationTableRow
                    application={application}
                    currentPath={currentPath}
                    key={application.id}
                    publishContentFromApplication={publishContentFromApplication}
                  />
                ))
              )}
            </DataTableBody>
          </DataTable>
        </DataTableFrame>

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
