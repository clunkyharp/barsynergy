import type { ApplicationStatus as AppStatus, ApplicationType as AppType } from '@prisma/client';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { applicationStatusBadgeVariants, applicationStatusLabels, applicationTypeLabels, formatApplicationPayloadValue, getApplicationPayloadFieldLabel } from '@/lib/admin/application-utils';

type ApplicationInfoProps = {
  application: {
    id: string;
    subject: string | null;
    type: AppType;
    status: AppStatus;
    name: string | null;
    email: string | null;
    phone: string | null;
    telegram: string | null;
    message: string | null;
    city: { name: string } | null;
    consentAcceptedAt: Date | null;
    payload: unknown;
    createdAt: Date;
    vacancy: { id: string; title: string; slug: string; companyName: string } | null;
    supplier: { id: string; title: string; slug: string; companyName: string } | null;
    partner: { id: string; title: string; slug: string; companyName: string } | null;
    resumeFile: { originalName: string; mimeType: string; size: number } | null;
    businessAccount: {
      id: string; companyName: string; status: string;
      owner: { id: string; email: string; status: string };
    } | null;
    forwardedAt: Date | null;
    forwardedBy: { email: string } | null;
  };
};

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

const businessStatusLabels: Record<string, string> = {
  PENDING: 'Ожидает активации', ACTIVE: 'Активен', BLOCKED: 'Заблокирован', ARCHIVED: 'Архив'
};

const userStatusLabels: Record<string, string> = {
  ACTIVE: 'Активен', BLOCKED: 'Заблокирован', PENDING: 'Ожидает'
};

function payloadEntries(payload: unknown) {
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') return [];
  return Object.entries(payload).filter(([, value]) => value !== null && value !== undefined && value !== '');
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} байт`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

export function ApplicationInfo({ application }: ApplicationInfoProps) {
  const entries = payloadEntries(application.payload);
  const messageTitle = application.type === 'BUSINESS_SOLUTION' ? 'Комментарий'
    : application.type === 'CONSULTING_REQUEST' ? 'Описание задачи' : 'Сообщение';
  return (
    <>
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Заявки</p>
        <h1 className="mt-2 text-3xl font-semibold">{application.subject || applicationTypeLabels[application.type]}</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          {applicationTypeLabels[application.type]} / создана {dateTimeFormatter.format(application.createdAt)}
        </p>
      </header>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Данные заявки</h2>
          <StatusBadge variant={applicationStatusBadgeVariants[application.status]}>
            {applicationStatusLabels[application.status]}
          </StatusBadge>
        </div>

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="font-semibold">Имя</dt><dd className="mt-1 text-[var(--muted)]">{application.name ?? '-'}</dd></div>
          <div><dt className="font-semibold">Город</dt><dd className="mt-1 text-[var(--muted)]">{application.city?.name ?? '-'}</dd></div>
          <div><dt className="font-semibold">Email</dt><dd className="mt-1 text-[var(--muted)]">{application.email ?? '-'}</dd></div>
          <div><dt className="font-semibold">Телефон</dt><dd className="mt-1 text-[var(--muted)]">{application.phone ?? '-'}</dd></div>
          <div><dt className="font-semibold">Telegram</dt><dd className="mt-1 text-[var(--muted)]">{application.telegram ?? '-'}</dd></div>
          <div><dt className="font-semibold">Согласие</dt><dd className="mt-1 text-[var(--muted)]">{application.consentAcceptedAt ? dateTimeFormatter.format(application.consentAcceptedAt) : 'Не зафиксировано'}</dd></div>
        </dl>

        {application.message ? (
          <div className="mt-5 border-t border-[var(--line)] pt-5 text-sm">
            <h3 className="font-semibold">{messageTitle}</h3>
            <p className="mt-2 whitespace-pre-wrap leading-7 text-[var(--muted)]">{application.message}</p>
          </div>
        ) : null}

        {entries.length > 0 ? (
          <div className="mt-5 border-t border-[var(--line)] pt-5 text-sm">
            <h3 className="font-semibold">Дополнительные поля</h3>
            <dl className="mt-3 grid gap-3">
              {entries.map(([key, value]) => (
                <div className="grid gap-1 sm:grid-cols-[180px_1fr]" key={key}>
                  <dt className="font-semibold">{getApplicationPayloadFieldLabel(key)}</dt>
                  <dd className="text-[var(--muted)]">{formatApplicationPayloadValue(key, value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Связанная запись</h2>
        {application.vacancy ? (
          <div className="mt-4 grid gap-3 text-sm">
            <p className="font-medium text-[var(--text)]">{application.vacancy.title}</p>
            <p className="text-[var(--muted)]">{application.vacancy.companyName} / {application.vacancy.slug}</p>
            <Button className="w-fit" href={`/admin/vacancies/${application.vacancy.id}`} size="sm" variant="secondary">Открыть вакансию</Button>
          </div>
        ) : application.supplier ? (
          <div className="mt-4 grid gap-3 text-sm">
            <p className="font-medium text-[var(--text)]">{application.supplier.title}</p>
            <p className="text-[var(--muted)]">{application.supplier.companyName} / {application.supplier.slug}</p>
            <Button className="w-fit" href={`/admin/suppliers/${application.supplier.id}`} size="sm" variant="secondary">Открыть поставщика</Button>
          </div>
        ) : application.partner ? (
          <div className="mt-4 grid gap-3 text-sm">
            <p className="font-medium text-[var(--text)]">{application.partner.title}</p>
            <p className="text-[var(--muted)]">{application.partner.companyName} / {application.partner.slug}</p>
            <Button className="w-fit" href={`/admin/partners/${application.partner.id}`} size="sm" variant="secondary">Открыть партнёра</Button>
          </div>
        ) : application.businessAccount ? (
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="font-semibold">Компания</dt><dd className="mt-1 text-[var(--muted)]">{application.businessAccount.companyName}</dd></div>
            <div><dt className="font-semibold">Статус доступа</dt><dd className="mt-1 text-[var(--muted)]">{businessStatusLabels[application.businessAccount.status]}</dd></div>
            <div><dt className="font-semibold">Владелец</dt><dd className="mt-1 text-[var(--muted)]">{application.businessAccount.owner.email}</dd></div>
            <div><dt className="font-semibold">Статус аккаунта</dt><dd className="mt-1 text-[var(--muted)]">{userStatusLabels[application.businessAccount.owner.status]}</dd></div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted)]">Связанная вакансия, поставщик, партнёр, компания или кабинет не найдены.</p>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Файл резюме</h2>
        {application.resumeFile ? (
          <div className="mt-4 grid gap-3 text-sm">
            <p className="font-medium text-[var(--text)]">{application.resumeFile.originalName}</p>
            <p className="text-[var(--muted)]">{application.resumeFile.mimeType} / {formatFileSize(application.resumeFile.size)}</p>
            <Button className="w-fit" href={`/admin/applications/${application.id}/resume`} variant="secondary">Скачать резюме</Button>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted)]">Файл не приложен.</p>
        )}
      </Card>
    </>
  );
}
