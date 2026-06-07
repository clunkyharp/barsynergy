import { prepareBusinessAccessAction } from '@/app/admin/applications/actions';
import { HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

type BusinessAccessFormProps = {
  application: {
    id: string;
    type: string;
    status: string;
    businessAccount: {
      id: string;
      companyName: string;
      status: string;
      owner: { id: string; email: string; status: string };
    } | null;
  };
  canPrepareInvite: boolean;
  isAccessActive: boolean;
  activationPreview: {
    activationUrl?: string;
    expiresAt?: string;
  } | null;
  currentPath: string;
};

export function BusinessAccessForm({ application, canPrepareInvite, isAccessActive, activationPreview, currentPath }: BusinessAccessFormProps) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold">Подготовка доступа</h2>
      <div className="mt-4 grid gap-3 text-sm">
        <p className="text-[var(--muted)]">
          После проверки подготовьте одноразовую ссылку, по которой владелец бизнеса сам задаст пароль и завершит активацию.
        </p>
        {application.businessAccount ? (
          <p className="text-[var(--muted)]">
            Связанный кабинет: {application.businessAccount.companyName} / {application.businessAccount.owner.email} /{' '}
            {isAccessActive ? 'доступ уже активирован' : 'доступ ожидает активации'}
          </p>
        ) : null}
        {!canPrepareInvite ? (
          <p className="text-[var(--muted)]">Подготовка ссылки недоступна для текущего статуса заявки.</p>
        ) : null}
      </div>

      <form action={prepareBusinessAccessAction} className="mt-4 grid gap-4">
        <HiddenRedirect value={currentPath} />
        <input name="applicationId" type="hidden" value={application.id} />
        <Button type="submit" variant="secondary" disabled={!canPrepareInvite}>
          {application.businessAccount ? 'Пересоздать ссылку активации' : 'Подготовить доступ и получить ссылку'}
        </Button>
      </form>

      {activationPreview?.activationUrl ? (
        <div className="mt-5 border-t border-[var(--line)] pt-5">
          <FormField htmlFor="activationUrl" label="Свежая ссылка активации">
            <Input id="activationUrl" name="activationUrl" readOnly value={activationPreview.activationUrl} />
          </FormField>
          <p className="mt-3 text-xs leading-6 text-[var(--muted)]">
            Передайте ссылку владельцу бизнеса безопасным каналом. Срок действия: {activationPreview.expiresAt ?? 'не указан'}.
          </p>
        </div>
      ) : null}
    </Card>
  );
}
