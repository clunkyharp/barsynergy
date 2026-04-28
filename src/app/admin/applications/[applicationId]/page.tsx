import { notFound } from 'next/navigation';
import { ApplicationStatus, ApplicationType } from '@prisma/client';
import {
  createVacancyDraftFromApplication,
  updateApplicationBusinessNotes,
  updateApplicationInternalNotes,
  updateApplicationStatus
} from '@/app/admin/applications/actions';
import { AdminActionAlert, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels,
  applicationStatusValues,
  applicationTypeLabels
} from '@/lib/admin/application-utils';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

const ADMIN_APPLICATIONS_PATH = '/admin/applications';

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

type AdminApplicationDetailPageProps = {
  params: Promise<{ applicationId: string }>;
  searchParams?: Promise<AdminContentSearchParams>;
};

function payloadEntries(payload: unknown) {
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
    return [];
  }

  return Object.entries(payload).filter(([, value]) => value !== null && value !== undefined && value !== '');
}

function formatPayloadValue(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value);
}

export default async function AdminApplicationDetailPage({ params, searchParams }: AdminApplicationDetailPageProps) {
  await requireAdminSectionAccess('applications');

  const { applicationId } = await params;
  const query = (await searchParams) ?? {};
  const currentPath = `${ADMIN_APPLICATIONS_PATH}/${applicationId}`;
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      city: { select: { name: true } },
      vacancy: { select: { title: true, slug: true, companyName: true } },
      resumeFile: { select: { originalName: true, mimeType: true, size: true } },
      forwardedBy: { select: { email: true } }
    }
  });

  if (!application) {
    notFound();
  }

  const entries = payloadEntries(application.payload);
  const forwardedInfo =
    application.status === ApplicationStatus.FORWARDED_TO_EMPLOYER
      ? [application.forwardedAt ? dateTimeFormatter.format(application.forwardedAt) : null, application.forwardedBy?.email]
          .filter(Boolean)
          .join(' / ')
      : null;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Заявки</p>
        <h1 className="mt-2 text-3xl font-semibold">{application.subject || applicationTypeLabels[application.type]}</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          {applicationTypeLabels[application.type]} / создана {dateTimeFormatter.format(application.createdAt)}
        </p>
      </header>

      <AdminActionAlert params={query} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Данные заявки</h2>
            <Badge variant={applicationStatusBadgeVariants[application.status]}>
              {applicationStatusLabels[application.status]}
            </Badge>
          </div>

          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold">Имя</dt>
              <dd className="mt-1 text-[var(--muted)]">{application.name ?? '-'}</dd>
            </div>
            <div>
              <dt className="font-semibold">Город</dt>
              <dd className="mt-1 text-[var(--muted)]">{application.city?.name ?? '-'}</dd>
            </div>
            <div>
              <dt className="font-semibold">Email</dt>
              <dd className="mt-1 text-[var(--muted)]">{application.email ?? '-'}</dd>
            </div>
            <div>
              <dt className="font-semibold">Телефон</dt>
              <dd className="mt-1 text-[var(--muted)]">{application.phone ?? '-'}</dd>
            </div>
            <div>
              <dt className="font-semibold">Telegram</dt>
              <dd className="mt-1 text-[var(--muted)]">{application.telegram ?? '-'}</dd>
            </div>
            <div>
              <dt className="font-semibold">Согласие</dt>
              <dd className="mt-1 text-[var(--muted)]">
                {application.consentAcceptedAt ? dateTimeFormatter.format(application.consentAcceptedAt) : 'Не зафиксировано'}
              </dd>
            </div>
          </dl>

          {application.vacancy ? (
            <div className="mt-5 border-t border-[var(--line)] pt-5 text-sm">
              <h3 className="font-semibold">Связанная вакансия</h3>
              <p className="mt-2 text-[var(--muted)]">
                {application.vacancy.title} / {application.vacancy.companyName} /{application.vacancy.slug}
              </p>
            </div>
          ) : null}

          {application.message ? (
            <div className="mt-5 border-t border-[var(--line)] pt-5 text-sm">
              <h3 className="font-semibold">Сообщение</h3>
              <p className="mt-2 whitespace-pre-wrap leading-7 text-[var(--muted)]">{application.message}</p>
            </div>
          ) : null}

          {entries.length > 0 ? (
            <div className="mt-5 border-t border-[var(--line)] pt-5 text-sm">
              <h3 className="font-semibold">Дополнительные поля</h3>
              <dl className="mt-3 grid gap-3">
                {entries.map(([key, value]) => (
                  <div className="grid gap-1 sm:grid-cols-[180px_1fr]" key={key}>
                    <dt className="font-semibold">{key}</dt>
                    <dd className="text-[var(--muted)]">{formatPayloadValue(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {application.resumeFile ? (
            <div className="mt-5 border-t border-[var(--line)] pt-5 text-sm">
              <h3 className="font-semibold">Файл резюме</h3>
              <p className="mt-2 text-[var(--muted)]">
                {application.resumeFile.originalName} / {application.resumeFile.mimeType} / {application.resumeFile.size} bytes
              </p>
              <Button className="mt-4" href={`${currentPath}/resume`} variant="secondary">
                Скачать файл
              </Button>
            </div>
          ) : null}
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-lg font-semibold">Обработка</h2>
            <form action={updateApplicationStatus} className="mt-5 grid gap-4">
              <HiddenRedirect value={currentPath} />
              <input name="applicationId" type="hidden" value={application.id} />
              <FormField htmlFor="status" label="Статус">
                <Select id="status" name="status" defaultValue={application.status}>
                  {applicationStatusValues.map((status) => (
                    <option key={status} value={status}>
                      {applicationStatusLabels[status]}
                    </option>
                  ))}
                </Select>
              </FormField>
              {forwardedInfo ? <p className="text-sm text-[var(--muted)]">Передача отмечена: {forwardedInfo}</p> : null}
              <Button type="submit">Сохранить статус</Button>
            </form>
          </Card>

          {application.type === ApplicationType.VACANCY_SUBMISSION ? (
            <Card className="p-5">
              <h2 className="text-lg font-semibold">Вакансия из заявки</h2>
              {application.vacancyId ? (
                <div className="mt-4 grid gap-4 text-sm">
                  <p className="text-[var(--muted)]">
                    Вакансия уже связана с заявкой: {application.vacancy?.title ?? application.vacancyId}.
                  </p>
                  <Button href="/admin/vacancies" variant="secondary">
                    Открыть вакансии
                  </Button>
                </div>
              ) : (
                <form action={createVacancyDraftFromApplication} className="mt-4 grid gap-4">
                  <HiddenRedirect value={currentPath} />
                  <input name="applicationId" type="hidden" value={application.id} />
                  <Button type="submit" variant="secondary">
                    Создать вакансию из заявки
                  </Button>
                </form>
              )}
            </Card>
          ) : null}

          <Card className="p-5">
            <h2 className="text-lg font-semibold">Комментарий для бизнеса</h2>
            <form action={updateApplicationBusinessNotes} className="mt-5 grid gap-4">
              <HiddenRedirect value={currentPath} />
              <input name="applicationId" type="hidden" value={application.id} />
              <FormField htmlFor="businessNotes" label="Видимый комментарий">
                <Textarea
                  className="min-h-32"
                  defaultValue={application.businessNotes ?? ''}
                  id="businessNotes"
                  maxLength={2000}
                  name="businessNotes"
                />
              </FormField>
              <Button type="submit" variant="secondary">
                Сохранить комментарий
              </Button>
            </form>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold">Внутренняя заметка</h2>
            <form action={updateApplicationInternalNotes} className="mt-5 grid gap-4">
              <HiddenRedirect value={currentPath} />
              <input name="applicationId" type="hidden" value={application.id} />
              <FormField htmlFor="internalNotes" label="Заметка">
                <Textarea
                  className="min-h-40"
                  defaultValue={application.internalNotes ?? ''}
                  id="internalNotes"
                  maxLength={4000}
                  name="internalNotes"
                />
              </FormField>
              <Button type="submit" variant="secondary">
                Сохранить заметку
              </Button>
            </form>
          </Card>

          <Button href={ADMIN_APPLICATIONS_PATH} variant="ghost">
            Вернуться к списку
          </Button>
        </div>
      </div>
    </div>
  );
}
