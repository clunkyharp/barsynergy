import type { ApplicationStatus as AppStatus } from '@prisma/client';
import { updateApplicationProcessing } from '@/app/admin/applications/actions';
import { HiddenRedirect } from '@/components/admin/content-admin-controls';
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
    status: AppStatus;
    businessNotes: string | null;
    internalNotes: string | null;
    businessAccountId: string | null;
  };
  availableStatuses: AppStatus[];
  forwardedInfo: string | null;
  currentPath: string;
};

export function ProcessingForm({ application, availableStatuses, forwardedInfo, currentPath }: ProcessingFormProps) {
  const canEditBusinessNotes = canUpdateApplicationBusinessNotes(application);

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
    </Card>
  );
}
