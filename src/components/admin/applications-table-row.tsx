'use client';

import { ApplicationStatus, ApplicationType } from '@prisma/client';
import { HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { ConfirmSubmitButton } from '@/components/ui/confirm-submit-button';
import {
  DataTableActionsCell,
  DataTableActionRow,
  DataTableCell,
  DataTableClamp,
  DataTableRow
} from '@/components/ui/data-table';
import { AdminStatusChip } from '@/components/ui/status-badge';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels,
  applicationTypeLabels
} from '@/lib/admin/application-utils';
import {
  dateTimeFormatter,
  applicationActionLabel,
  applicationPublicationTarget,
  applicationPersonOrCompany
} from '@/lib/admin/application-page-helpers';

export type ApplicationRowApp = {
  id: string;
  type: ApplicationType;
  status: ApplicationStatus;
  subject: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  telegram: string | null;
  resumeFileId: string | null;
  consentAcceptedAt: Date | null;
  createdAt: Date;
  city: { name: string } | null;
  businessAccount: { companyName: string } | null;
  payload: unknown;
  vacancy: { title: string; slug: string } | null;
  supplier: { title: string; slug: string } | null;
  partner: { title: string; slug: string } | null;
  master: { title: string; slug: string } | null;
};

export function ApplicationTableRow({
  application,
  currentPath,
  publishContentFromApplication
}: {
  application: ApplicationRowApp;
  currentPath: string;
  publishContentFromApplication: (formData: FormData) => Promise<void>;
}) {
  const actionLabel = applicationActionLabel(application);
  const identity = applicationPersonOrCompany(application);
  const publicationTarget = applicationPublicationTarget(application);

  return (
    <DataTableRow key={application.id}>
      <DataTableCell className="max-w-[240px]" label="Тип заявки">
        <DataTableClamp className="font-semibold">{applicationTypeLabels[application.type]}</DataTableClamp>
        {application.subject ? <DataTableClamp className="mt-1 text-xs text-[var(--muted)]">{application.subject}</DataTableClamp> : null}
      </DataTableCell>
      <DataTableCell className="max-w-[300px]" label="Имя / компания">
        <DataTableClamp className="font-semibold">{identity.primary}</DataTableClamp>
        {identity.secondary ? <DataTableClamp className="mt-1 text-xs text-[var(--muted)]">{identity.secondary}</DataTableClamp> : null}
      </DataTableCell>
      <DataTableCell className="text-[var(--muted)]" label="Город">
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
        {application.master ? (
          <div className="mt-1 text-xs">
            <DataTableClamp>Мастер: {application.master.title}</DataTableClamp>
            <DataTableClamp className="mt-1 text-[var(--muted)]">/{application.master.slug}</DataTableClamp>
          </div>
        ) : null}
      </DataTableCell>
      <DataTableCell label="Статус">
        <AdminStatusChip variant={applicationStatusBadgeVariants[application.status]}>
          {applicationStatusLabels[application.status]}
        </AdminStatusChip>
      </DataTableCell>
      <DataTableCell label="Файлы / согласия">
        <div className="flex flex-wrap gap-1.5">
          {application.resumeFileId ? <AdminStatusChip variant="neutral">Резюме</AdminStatusChip> : null}
          {application.consentAcceptedAt ? <AdminStatusChip variant="success">Согласие</AdminStatusChip> : null}
          {application.email || application.phone || application.telegram ? <AdminStatusChip variant="neutral">Контакты</AdminStatusChip> : null}
          {!application.resumeFileId && !application.consentAcceptedAt && !application.email && !application.phone && !application.telegram ? (
            <span className="text-sm text-[var(--muted)]">Нет</span>
          ) : null}
        </div>
      </DataTableCell>
      <DataTableCell className="text-[var(--muted)]" label="Создана">
        {dateTimeFormatter.format(application.createdAt)}
      </DataTableCell>
      <DataTableCell className="max-w-[260px]" label="Следующий шаг">
        <DataTableClamp className={actionLabel === 'Контроль не требуется' ? 'text-[var(--muted)]' : 'font-medium'}>
          {actionLabel}
        </DataTableClamp>
      </DataTableCell>
      <DataTableActionsCell>
        <DataTableActionRow className="justify-end">
          {publicationTarget ? (
            <form action={publishContentFromApplication}>
              <HiddenRedirect value={currentPath} />
              <input name="applicationId" type="hidden" value={application.id} />
              <input name="target" type="hidden" value={publicationTarget} />
              <ConfirmSubmitButton
                className="min-h-9 px-3 py-1.5 text-xs"
                confirmActionLabel="Опубликовать"
                confirmText="Запись станет доступна на публичной странице."
                confirmTitle="Опубликовать на сайте?"
                type="submit"
              >
                Опубликовать
              </ConfirmSubmitButton>
            </form>
          ) : null}
          <Button className="min-h-9 px-3 py-1.5 text-xs" href={`/admin/applications/${application.id}`} variant="secondary">
            Открыть
          </Button>
        </DataTableActionRow>
      </DataTableActionsCell>
    </DataTableRow>
  );
}
