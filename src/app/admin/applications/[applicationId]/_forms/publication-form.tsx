import type { ApplicationType as AppType } from '@prisma/client';
import { createVacancyDraftFromApplication, publishContentFromApplication } from '@/app/admin/applications/actions';
import { HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { ConfirmSubmitButton } from '@/components/ui/confirm-submit-button';
import { Card } from '@/components/ui/card';

type PublicationFormProps = {
  application: {
    id: string;
    type: AppType;
    vacancyId: string | null;
    supplierId: string | null;
    partnerId: string | null;
    vacancy?: { id: string; title: string } | null;
    supplier?: { id: string; title: string } | null;
    partner?: { id: string; title: string } | null;
  };
  canPublish: boolean;
  currentPath: string;
};

export function VacancyPublicationForm({ application, canPublish, currentPath }: PublicationFormProps) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold">Вакансия из заявки</h2>
      {application.vacancyId ? (
        <div className="mt-4 grid gap-4 text-sm">
          <p className="text-[var(--muted)]">Вакансия уже связана с заявкой: {application.vacancy?.title ?? application.vacancyId}.</p>
          <Button href="/admin/vacancies" variant="secondary">Открыть вакансии</Button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4">
          {!canPublish ? <p className="text-sm text-[var(--muted)]">Для быстрой публикации нужен рабочий статус заявки и зафиксированное согласие.</p> : null}
          <form action={publishContentFromApplication} className="grid gap-4">
            <HiddenRedirect value={currentPath} />
            <input name="applicationId" type="hidden" value={application.id} />
            <input name="target" type="hidden" value="vacancy" />
            <ConfirmSubmitButton
              confirmActionLabel="Опубликовать"
              confirmText="Вакансия станет доступна на публичной странице."
              confirmTitle="Опубликовать вакансию на сайте?"
              disabled={!canPublish}
              type="submit"
            >
              Опубликовать вакансию
            </ConfirmSubmitButton>
          </form>
          <form action={createVacancyDraftFromApplication} className="grid gap-4">
            <HiddenRedirect value={currentPath} />
            <input name="applicationId" type="hidden" value={application.id} />
            <ConfirmSubmitButton
              confirmActionLabel="Создать"
              confirmText="Черновик появится в списке вакансий."
              confirmTitle="Создать черновик вакансии?"
              type="submit"
              variant="secondary"
            >
              Создать черновик вакансии
            </ConfirmSubmitButton>
          </form>
        </div>
      )}
    </Card>
  );
}

export function SupplierPublicationForm({ application, canPublish, currentPath }: PublicationFormProps) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold">Поставщик из заявки</h2>
      {application.supplierId ? (
        <div className="mt-4 grid gap-4 text-sm">
          <p className="text-[var(--muted)]">Поставщик уже связан с заявкой: {application.supplier?.title ?? application.supplierId}.</p>
          <Button href="/admin/suppliers" variant="secondary">Открыть поставщиков</Button>
        </div>
      ) : (
        <form action={publishContentFromApplication} className="mt-4 grid gap-4">
          {!canPublish ? <p className="text-sm text-[var(--muted)]">Для публикации нужен рабочий статус заявки и зафиксированное согласие.</p> : null}
          <HiddenRedirect value={currentPath} />
          <input name="applicationId" type="hidden" value={application.id} />
          <input name="target" type="hidden" value="supplier" />
          <ConfirmSubmitButton
            confirmActionLabel="Опубликовать"
            confirmText="Поставщик станет доступен на публичной странице."
            confirmTitle="Опубликовать поставщика на сайте?"
            disabled={!canPublish}
            type="submit"
          >
            Опубликовать поставщика
          </ConfirmSubmitButton>
        </form>
      )}
    </Card>
  );
}

export function PartnerPublicationForm({ application, canPublish, currentPath }: PublicationFormProps) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold">Партнёр из заявки</h2>
      {application.partnerId ? (
        <div className="mt-4 grid gap-4 text-sm">
          <p className="text-[var(--muted)]">Партнёр уже связан с заявкой: {application.partner?.title ?? application.partnerId}.</p>
          <Button href="/admin/partners" variant="secondary">Открыть партнёров</Button>
        </div>
      ) : (
        <form action={publishContentFromApplication} className="mt-4 grid gap-4">
          {!canPublish ? <p className="text-sm text-[var(--muted)]">Для публикации нужен рабочий статус заявки и зафиксированное согласие.</p> : null}
          <HiddenRedirect value={currentPath} />
          <input name="applicationId" type="hidden" value={application.id} />
          <input name="target" type="hidden" value="partner" />
          <ConfirmSubmitButton
            confirmActionLabel="Опубликовать"
            confirmText="Партнёр станет доступен на публичной странице."
            confirmTitle="Опубликовать партнёра на сайте?"
            disabled={!canPublish}
            type="submit"
          >
            Опубликовать партнёра
          </ConfirmSubmitButton>
        </form>
      )}
    </Card>
  );
}
