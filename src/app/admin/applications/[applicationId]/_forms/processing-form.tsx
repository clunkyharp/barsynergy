import type { ApplicationStatus as AppStatus, ApplicationType as AppType } from '@prisma/client';
import { deleteApplication, updateApplicationProcessing, createVacancyDraftFromApplication, publishContentFromApplication } from '@/app/admin/applications/actions';
import { HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { ConfirmSubmitButton } from '@/components/ui/confirm-submit-button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { applicationStatusLabels } from '@/lib/admin/application-utils';
import { canUpdateApplicationBusinessNotes } from '@/lib/admin/application-transitions';

type ProcessingFormProps = {
  application: {
    id: string;
    type: AppType;
    status: AppStatus;
    businessNotes: string | null;
    internalNotes: string | null;
    businessAccountId: string | null;
    vacancyId: string | null;
    supplierId: string | null;
    partnerId: string | null;
    masterId: string | null;
    vacancy?: { id: string; title: string } | null;
    supplier?: { id: string; title: string } | null;
    partner?: { id: string; title: string } | null;
    master?: { id: string; title: string } | null;
    consentAcceptedAt: Date | null;
  };
  availableStatuses: AppStatus[];
  canPublish: boolean;
  forwardedInfo: string | null;
  currentPath: string;
};

const quickStatusActions: { status: AppStatus; label: string }[] = [
  { status: 'NEW', label: 'Новая' },
  { status: 'IN_REVIEW', label: 'На проверку' },
  { status: 'APPROVED', label: 'Одобрить' },
  { status: 'REJECTED', label: 'Отклонить' },
  { status: 'ARCHIVED', label: 'В архив' },
  { status: 'COMPLETED', label: 'Завершить' },
];

function PublishedEntityBadge({ href, label }: { href: string; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-4 py-3 text-sm">
      <span className="text-[var(--text)]">{label}</span>
      <Button className="shrink-0" href={href} size="sm" variant="secondary">Открыть</Button>
    </div>
  );
}

function PublicationSection({ application, canPublish, currentPath }: { application: ProcessingFormProps['application']; canPublish: boolean; currentPath: string }) {
  const target = getPublicationTarget(application);
  const publishLabel = target ? typePublicationLabel[target] : null;

  return (
    <div className="border-t border-[var(--line)] pt-5">
      <h3 className="text-sm font-semibold">Публикация</h3>

      {application.vacancyId ? (
        <div className="mt-3">
          <PublishedEntityBadge href={`/admin/vacancies/${application.vacancy!.id}`} label={application.vacancy!.title ?? 'Вакансия'} />
        </div>
      ) : application.supplierId ? (
        <div className="mt-3">
          <PublishedEntityBadge href={`/admin/suppliers/${application.supplier!.id}`} label={application.supplier!.title ?? 'Поставщик'} />
        </div>
      ) : application.partnerId ? (
        <div className="mt-3">
          <PublishedEntityBadge href={`/admin/partners/${application.partner!.id}`} label={application.partner!.title ?? 'Партнёр'} />
        </div>
      ) : application.masterId ? (
        <div className="mt-3">
          <PublishedEntityBadge href={`/admin/masters/${application.master!.id}`} label={application.master!.title ?? 'Мастер'} />
        </div>
      ) : target ? (
        <div className="mt-3 grid gap-3">
          {!canPublish ? <p className="text-sm text-[var(--muted)]">Для быстрой публикации нужен рабочий статус заявки и зафиксированное согласие.</p> : null}
          <form action={publishContentFromApplication}>
            <HiddenRedirect value={currentPath} />
            <input name="applicationId" type="hidden" value={application.id} />
            <input name="target" type="hidden" value={target} />
            <ConfirmSubmitButton
              className="w-full"
              confirmActionLabel="Опубликовать"
              confirmText={`${publishLabel} станет доступен на публичной странице.`}
              confirmTitle={`Опубликовать ${publishLabel?.toLocaleLowerCase('ru')} на сайте?`}
              disabled={!canPublish}
              type="submit"
            >
              Опубликовать {publishLabel?.toLocaleLowerCase('ru')}
            </ConfirmSubmitButton>
          </form>
          {target === 'vacancy' ? (
            <form action={createVacancyDraftFromApplication}>
              <HiddenRedirect value={currentPath} />
              <input name="applicationId" type="hidden" value={application.id} />
              <ConfirmSubmitButton
                className="w-full"
                confirmActionLabel="Создать"
                confirmText="Черновик появится в списке вакансий."
                confirmTitle="Создать черновик вакансии?"
                type="submit"
                variant="secondary"
              >
                Создать черновик вакансии
              </ConfirmSubmitButton>
            </form>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-sm text-[var(--muted)]">Публикация для этого типа заявки не предусмотрена.</p>
      )}
    </div>
  );
}

function getPublicationTarget(application: { type: AppType; consentAcceptedAt: Date | null; status: AppStatus; vacancyId: string | null; supplierId: string | null; partnerId: string | null; masterId: string | null }): 'vacancy' | 'supplier' | 'partner' | 'master' | null {
  if (application.status !== 'APPROVED' || !application.consentAcceptedAt) return null;
  if (application.type === 'VACANCY_SUBMISSION' && !application.vacancyId) return 'vacancy';
  if (application.type === 'SUPPLIER_SUBMISSION' && !application.supplierId) return 'supplier';
  if (application.type === 'PARTNER_APPLICATION' && !application.partnerId) return 'partner';
  if (application.type === 'MASTER_SUBMISSION' && !application.masterId) return 'master';
  return null;
}

const typePublicationLabel: Record<string, string> = {
  vacancy: 'Вакансию',
  supplier: 'Поставщика',
  partner: 'Партнёра',
  master: 'Мастера'
};

export function ProcessingForm({ application, availableStatuses, canPublish, forwardedInfo, currentPath }: ProcessingFormProps) {
  const canEditBusinessNotes = canUpdateApplicationBusinessNotes(application);
  const eligibleQuickActions = quickStatusActions.filter(
    (a) => availableStatuses.includes(a.status)
  );

  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold">Обработка</h2>

      <form action={updateApplicationProcessing} className="mt-5 grid gap-4">
        <HiddenRedirect value={currentPath} />
        <input name="applicationId" type="hidden" value={application.id} />

        <FormField htmlFor="status" label="Статус">
          <Select id="status" name="status" defaultValue={application.status}>
            {availableStatuses.map((status) => (
              <option key={status} value={status}>{applicationStatusLabels[status]}</option>
            ))}
          </Select>
        </FormField>

        {eligibleQuickActions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {eligibleQuickActions.map((action) => (
              <label
                className="cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] transition-colors has-[:checked]:border-[var(--accent)] has-[:checked]:bg-[var(--accent-soft)] has-[:checked]:text-[var(--accent)] hover:border-[var(--accent)]/30"
                key={action.status}
              >
                <input className="sr-only" name="status" type="radio" value={action.status} />
                {action.label}
              </label>
            ))}
          </div>
        ) : null}

        {forwardedInfo ? <p className="text-sm text-[var(--muted)]">Передача отмечена: {forwardedInfo}</p> : null}
        {canEditBusinessNotes ? (
          <FormField htmlFor="businessNotes" label="Видимый комментарий">
            <Textarea className="min-h-32" defaultValue={application.businessNotes ?? ''} id="businessNotes" maxLength={2000} name="businessNotes" />
          </FormField>
        ) : null}
        <FormField htmlFor="internalNotes" label="Внутренняя заметка">
          <Textarea className="min-h-40" defaultValue={application.internalNotes ?? ''} id="internalNotes" maxLength={4000} name="internalNotes" />
        </FormField>
        <ConfirmSubmitButton
          confirmActionLabel="Сохранить"
          confirmText="Статус и заметки будут обновлены. Некоторые изменения статуса необратимы."
          confirmTitle="Сохранить обработку?"
          type="submit"
        >
          Сохранить обработку
        </ConfirmSubmitButton>
      </form>

      <PublicationSection application={application} canPublish={canPublish} currentPath={currentPath} />

      <div className="mt-8 border-t border-[var(--danger-border)] pt-5">
        <h3 className="text-sm font-semibold text-[var(--danger-text)]">Опасная зона</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">Удаление заявки безвозвратно. Связанные сообщения и уведомления также будут удалены.</p>
        <form action={deleteApplication} className="mt-4">
          <HiddenRedirect value={currentPath} />
          <input name="applicationId" type="hidden" value={application.id} />
          <ConfirmSubmitButton
            className="border-[var(--danger-border)] text-[var(--danger-text)] hover:bg-[var(--danger)] hover:text-white"
            confirmActionLabel="Удалить"
            confirmText="Заявка, сообщения и уведомления будут удалены безвозвратно."
            confirmTitle="Удалить заявку?"
            type="submit"
            variant="secondary"
          >
            Удалить заявку
          </ConfirmSubmitButton>
        </form>
      </div>
    </Card>
  );
}
