import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ApplicationStatus, ApplicationType, BusinessAccountStatus, UserStatus } from '@prisma/client';
import {
  createVacancyDraftFromApplication,
  prepareBusinessAccessAction,
  publishContentFromApplication,
  updateApplicationProcessing
} from '@/app/admin/applications/actions';
import { AdminActionAlert, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels,
  applicationStatusValues,
  applicationTypeLabels,
  formatApplicationPayloadValue,
  getApplicationPayloadFieldLabel
} from '@/lib/admin/application-utils';
import { isApplicationPublicationStatusAllowed } from '@/lib/admin/application-publication';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import {
  BUSINESS_ACCESS_PREVIEW_COOKIE_NAME,
  isBusinessAccessInvitePreparationStatusAllowed
} from '@/lib/auth/business-access';
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

const businessStatusLabels: Record<BusinessAccountStatus, string> = {
  [BusinessAccountStatus.PENDING]: 'Ожидает активации',
  [BusinessAccountStatus.ACTIVE]: 'Активен',
  [BusinessAccountStatus.BLOCKED]: 'Заблокирован',
  [BusinessAccountStatus.ARCHIVED]: 'Архив'
};

const userStatusLabels: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'Активен',
  [UserStatus.BLOCKED]: 'Заблокирован',
  [UserStatus.PENDING]: 'Ожидает'
};

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

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} байт`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} КБ`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

export default async function AdminApplicationDetailPage({ params, searchParams }: AdminApplicationDetailPageProps) {
  await requireAdminSectionAccess('applications');

  const { applicationId } = await params;
  const query = (await searchParams) ?? {};
  const currentPath = `${ADMIN_APPLICATIONS_PATH}/${applicationId}`;
  const cookieStore = await cookies();
  const activationPreviewValue = cookieStore.get(BUSINESS_ACCESS_PREVIEW_COOKIE_NAME)?.value;
  const activationPreview = (() => {
    if (!activationPreviewValue) {
      return null;
    }

    try {
      const parsed = JSON.parse(activationPreviewValue) as {
        applicationId?: string;
        activationUrl?: string;
        email?: string;
        companyName?: string;
        expiresAt?: string;
      };

      return parsed.applicationId === applicationId ? parsed : null;
    } catch {
      return null;
    }
  })();
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      city: { select: { name: true } },
      vacancy: { select: { id: true, title: true, slug: true, companyName: true } },
      supplier: { select: { id: true, title: true, slug: true, companyName: true } },
      partner: { select: { id: true, title: true, slug: true, companyName: true } },
      resumeFile: { select: { originalName: true, mimeType: true, size: true } },
      forwardedBy: { select: { email: true } },
      businessAccount: {
        select: {
          id: true,
          companyName: true,
          status: true,
          owner: {
            select: {
              id: true,
              email: true,
              status: true
            }
          }
        }
      }
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
  const isBusinessAccessActive =
    application.businessAccount?.owner.status === UserStatus.ACTIVE &&
    application.businessAccount.status === BusinessAccountStatus.ACTIVE;
  const canPrepareBusinessAccessInvite =
    application.type === ApplicationType.BUSINESS_ACCOUNT_REQUEST &&
    !isBusinessAccessActive &&
    isBusinessAccessInvitePreparationStatusAllowed(application.status);
  const hasPublicationConsent = Boolean(application.consentAcceptedAt);
  const canPublishApplicationContent = isApplicationPublicationStatusAllowed(application.status) && hasPublicationConsent;

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
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Данные заявки</h2>
              <StatusBadge variant={applicationStatusBadgeVariants[application.status]}>{applicationStatusLabels[application.status]}</StatusBadge>
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
                <p className="text-[var(--muted)]">
                  {application.vacancy.companyName} / {application.vacancy.slug}
                </p>
                <Button className="w-fit" href={`/admin/vacancies/${application.vacancy.id}`} size="sm" variant="secondary">
                  Открыть вакансию
                </Button>
              </div>
            ) : application.supplier ? (
              <div className="mt-4 grid gap-3 text-sm">
                <p className="font-medium text-[var(--text)]">{application.supplier.title}</p>
                <p className="text-[var(--muted)]">
                  {application.supplier.companyName} / {application.supplier.slug}
                </p>
                <Button className="w-fit" href={`/admin/suppliers/${application.supplier.id}`} size="sm" variant="secondary">
                  Открыть поставщика
                </Button>
              </div>
            ) : application.partner ? (
              <div className="mt-4 grid gap-3 text-sm">
                <p className="font-medium text-[var(--text)]">{application.partner.title}</p>
                <p className="text-[var(--muted)]">
                  {application.partner.companyName} / {application.partner.slug}
                </p>
                <Button className="w-fit" href={`/admin/partners/${application.partner.id}`} size="sm" variant="secondary">
                  Открыть партнёра
                </Button>
              </div>
            ) : application.businessAccount ? (
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-semibold">Компания</dt>
                  <dd className="mt-1 text-[var(--muted)]">{application.businessAccount.companyName}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Статус доступа</dt>
                  <dd className="mt-1 text-[var(--muted)]">{businessStatusLabels[application.businessAccount.status]}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Владелец</dt>
                  <dd className="mt-1 text-[var(--muted)]">{application.businessAccount.owner.email}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Статус аккаунта</dt>
                  <dd className="mt-1 text-[var(--muted)]">{userStatusLabels[application.businessAccount.owner.status]}</dd>
                </div>
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
                <p className="text-[var(--muted)]">
                  {application.resumeFile.mimeType} / {formatFileSize(application.resumeFile.size)}
                </p>
                <Button className="w-fit" href={`${currentPath}/resume`} variant="secondary">
                  Скачать резюме
                </Button>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted)]">Файл не приложен.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-lg font-semibold">Обработка</h2>
            <form action={updateApplicationProcessing} className="mt-5 grid gap-4">
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
              <FormField htmlFor="businessNotes" label="Видимый комментарий">
                <Textarea
                  className="min-h-32"
                  defaultValue={application.businessNotes ?? ''}
                  id="businessNotes"
                  maxLength={2000}
                  name="businessNotes"
                />
              </FormField>
              <FormField htmlFor="internalNotes" label="Внутренняя заметка">
                <Textarea
                  className="min-h-40"
                  defaultValue={application.internalNotes ?? ''}
                  id="internalNotes"
                  maxLength={4000}
                  name="internalNotes"
                />
              </FormField>
              <Button type="submit">Сохранить обработку</Button>
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
                <div className="mt-4 grid gap-4">
                  {!canPublishApplicationContent ? (
                    <p className="text-sm text-[var(--muted)]">
                      Для быстрой публикации нужен рабочий статус заявки и зафиксированное согласие.
                    </p>
                  ) : null}
                  <form action={publishContentFromApplication} className="grid gap-4">
                    <HiddenRedirect value={currentPath} />
                    <input name="applicationId" type="hidden" value={application.id} />
                    <input name="target" type="hidden" value="vacancy" />
                    <Button type="submit" disabled={!canPublishApplicationContent}>
                      Опубликовать вакансию
                    </Button>
                  </form>
                  <form action={createVacancyDraftFromApplication} className="grid gap-4">
                    <HiddenRedirect value={currentPath} />
                    <input name="applicationId" type="hidden" value={application.id} />
                    <Button type="submit" variant="secondary">
                      Создать черновик вакансии
                    </Button>
                  </form>
                </div>
              )}
            </Card>
          ) : null}

          {application.type === ApplicationType.SUPPLIER_SUBMISSION ? (
            <Card className="p-5">
              <h2 className="text-lg font-semibold">Поставщик из заявки</h2>
              {application.supplierId ? (
                <div className="mt-4 grid gap-4 text-sm">
                  <p className="text-[var(--muted)]">
                    Поставщик уже связан с заявкой: {application.supplier?.title ?? application.supplierId}.
                  </p>
                  <Button href="/admin/suppliers" variant="secondary">
                    Открыть поставщиков
                  </Button>
                </div>
              ) : (
                <form action={publishContentFromApplication} className="mt-4 grid gap-4">
                  {!canPublishApplicationContent ? (
                    <p className="text-sm text-[var(--muted)]">
                      Для публикации нужен рабочий статус заявки и зафиксированное согласие.
                    </p>
                  ) : null}
                  <HiddenRedirect value={currentPath} />
                  <input name="applicationId" type="hidden" value={application.id} />
                  <input name="target" type="hidden" value="supplier" />
                  <Button type="submit" disabled={!canPublishApplicationContent}>
                    Опубликовать поставщика
                  </Button>
                </form>
              )}
            </Card>
          ) : null}

          {application.type === ApplicationType.PARTNER_APPLICATION ? (
            <Card className="p-5">
              <h2 className="text-lg font-semibold">Партнёр из заявки</h2>
              {application.partnerId ? (
                <div className="mt-4 grid gap-4 text-sm">
                  <p className="text-[var(--muted)]">
                    Партнёр уже связан с заявкой: {application.partner?.title ?? application.partnerId}.
                  </p>
                  <Button href="/admin/partners" variant="secondary">
                    Открыть партнёров
                  </Button>
                </div>
              ) : (
                <form action={publishContentFromApplication} className="mt-4 grid gap-4">
                  {!canPublishApplicationContent ? (
                    <p className="text-sm text-[var(--muted)]">
                      Для публикации нужен рабочий статус заявки и зафиксированное согласие.
                    </p>
                  ) : null}
                  <HiddenRedirect value={currentPath} />
                  <input name="applicationId" type="hidden" value={application.id} />
                  <input name="target" type="hidden" value="partner" />
                  <Button type="submit" disabled={!canPublishApplicationContent}>
                    Опубликовать партнёра
                  </Button>
                </form>
              )}
            </Card>
          ) : null}

          {application.type === ApplicationType.BUSINESS_ACCOUNT_REQUEST ? (
            <Card className="p-5">
              <h2 className="text-lg font-semibold">Подготовка доступа</h2>
              <div className="mt-4 grid gap-3 text-sm">
                <p className="text-[var(--muted)]">
                  После проверки подготовьте одноразовую ссылку, по которой владелец бизнеса сам задаст пароль и завершит активацию.
                </p>
                {application.businessAccount ? (
                  <p className="text-[var(--muted)]">
                    Связанный кабинет: {application.businessAccount.companyName} / {application.businessAccount.owner.email} /{' '}
                    {isBusinessAccessActive ? 'доступ уже активирован' : 'доступ ожидает активации'}
                  </p>
                ) : null}
                {!isBusinessAccessInvitePreparationStatusAllowed(application.status) ? (
                  <p className="text-[var(--muted)]">Подготовка ссылки недоступна для текущего статуса заявки.</p>
                ) : null}
              </div>

              <form action={prepareBusinessAccessAction} className="mt-4 grid gap-4">
                <HiddenRedirect value={currentPath} />
                <input name="applicationId" type="hidden" value={application.id} />
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={!canPrepareBusinessAccessInvite}
                >
                  {application.businessAccount ? 'Пересоздать ссылку активации' : 'Подготовить доступ и получить ссылку'}
                </Button>
              </form>

              {activationPreview?.activationUrl ? (
                <div className="mt-5 border-t border-[var(--line)] pt-5">
                  <FormField htmlFor="activationUrl" label="Свежая ссылка активации">
                    <Input
                      id="activationUrl"
                      name="activationUrl"
                      readOnly
                      value={activationPreview.activationUrl}
                    />
                  </FormField>
                  <p className="mt-3 text-xs leading-6 text-[var(--muted)]">
                    Передайте ссылку владельцу бизнеса безопасным каналом. Срок действия: {activationPreview.expiresAt ?? 'не указан'}.
                  </p>
                </div>
              ) : null}
            </Card>
          ) : null}

          <Button href={ADMIN_APPLICATIONS_PATH} variant="ghost">
            Вернуться к списку
          </Button>
        </div>
      </div>
    </div>
  );
}
