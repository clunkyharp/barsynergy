import { notFound } from 'next/navigation';
import { ApplicationStatus, ApplicationType } from '@prisma/client';
import {
  archiveBusinessDraftApplication,
  submitBusinessDraftApplication,
  updateBusinessDraftApplication
} from '@/lib/business/actions';
import { AdminActionAlert } from '@/components/admin/content-admin-controls';
import { NextActionPanel } from '@/components/business/business-cabinet';
import { ActionRow } from '@/components/ui/action-row';
import { Button } from '@/components/ui/button';
import { CheckboxField } from '@/components/ui/checkbox-field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels,
  applicationTypeLabels
} from '@/lib/admin/application-utils';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { prisma } from '@/lib/db/prisma';
import { isVacancyPosition, vacancyPositionValues } from '@/lib/vacancies/positions';

type BusinessRequestDetailPageProps = {
  params: Promise<{ applicationId: string }>;
  searchParams?: Promise<AdminContentSearchParams>;
};

function payloadValue(payload: unknown, key: string) {
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
    return '';
  }

  const value = (payload as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : '';
}

function renderDraftTypeFields(type: ApplicationType, payload: unknown) {
  switch (type) {
    case ApplicationType.VACANCY_SUBMISSION:
      return (
        <>
          <FormField htmlFor="position" label="Должность">
            <Select
              id="position"
              name="position"
              required
              defaultValue={isVacancyPosition(payloadValue(payload, 'position')) ? payloadValue(payload, 'position') : ''}
            >
              <option value="">Не выбрана</option>
              {vacancyPositionValues.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="employmentType" label="Тип занятости">
            <Input id="employmentType" name="employmentType" maxLength={100} defaultValue={payloadValue(payload, 'employmentType')} />
          </FormField>
          <FormField htmlFor="salaryLabel" label="Зарплата">
            <Input id="salaryLabel" name="salaryLabel" maxLength={120} defaultValue={payloadValue(payload, 'salaryLabel')} />
          </FormField>
          <FormField htmlFor="experienceLabel" label="Опыт">
            <Input id="experienceLabel" name="experienceLabel" maxLength={120} defaultValue={payloadValue(payload, 'experienceLabel')} />
          </FormField>
          <FormField className="md:col-span-2" htmlFor="shortDescription" label="Краткое описание роли">
            <Input
              id="shortDescription"
              name="shortDescription"
              required
              maxLength={500}
              defaultValue={payloadValue(payload, 'shortDescription')}
            />
          </FormField>
        </>
      );
    case ApplicationType.SUPPLIER_SUBMISSION:
      return (
        <>
          <FormField htmlFor="serviceArea" label="Зона поставки">
            <Input id="serviceArea" name="serviceArea" required maxLength={160} defaultValue={payloadValue(payload, 'serviceArea')} />
          </FormField>
          <FormField htmlFor="shortDescription" label="Кратко о предложении">
            <Input id="shortDescription" name="shortDescription" maxLength={500} defaultValue={payloadValue(payload, 'shortDescription')} />
          </FormField>
        </>
      );
    case ApplicationType.PARTNER_APPLICATION:
      return (
        <>
          <FormField htmlFor="partnerType" label="Тип партнёрства">
            <Input id="partnerType" name="partnerType" required maxLength={160} defaultValue={payloadValue(payload, 'partnerType')} />
          </FormField>
          <FormField htmlFor="shortDescription" label="Краткое описание формата">
            <Input id="shortDescription" name="shortDescription" maxLength={500} defaultValue={payloadValue(payload, 'shortDescription')} />
          </FormField>
        </>
      );
    case ApplicationType.CORPORATE_TRAINING_APPLICATION:
      return (
        <>
          <FormField htmlFor="teamSize" label="Размер команды">
            <Input id="teamSize" name="teamSize" required maxLength={80} defaultValue={payloadValue(payload, 'teamSize')} />
          </FormField>
          <FormField htmlFor="shortDescription" label="Кратко о задаче обучения">
            <Input id="shortDescription" name="shortDescription" maxLength={500} defaultValue={payloadValue(payload, 'shortDescription')} />
          </FormField>
        </>
      );
    case ApplicationType.CERTIFICATE_ORDER:
      return (
        <>
          <FormField htmlFor="amountLabel" label="Сумма сертификата">
            <Input id="amountLabel" name="amountLabel" required maxLength={120} defaultValue={payloadValue(payload, 'amountLabel')} />
          </FormField>
          <FormField htmlFor="recipientName" label="Получатель сертификата">
            <Input id="recipientName" name="recipientName" required maxLength={160} defaultValue={payloadValue(payload, 'recipientName')} />
          </FormField>
        </>
      );
    default:
      return null;
  }
}

export default async function BusinessRequestDetailPage({ params, searchParams }: BusinessRequestDetailPageProps) {
  const { businessAccount } = await requireBusinessAccountAccess();
  const { applicationId } = await params;
  const query = (await searchParams) ?? {};
  const [cities, application] = await Promise.all([
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    }),
    prisma.application.findFirst({
      where: {
        id: applicationId,
        businessAccountId: businessAccount.id
      },
      include: {
        city: { select: { name: true } }
      }
    })
  ]);

  if (!application) {
    notFound();
  }

  const canEdit = application.status === ApplicationStatus.DRAFT;

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={applicationTypeLabels[application.type]} title={application.subject ?? applicationTypeLabels[application.type]} />
      <AdminActionAlert params={query} />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <Panel padding="md" tone="elevated">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{canEdit ? 'Редактирование заявки' : 'Данные заявки'}</h2>
            <StatusBadge variant={applicationStatusBadgeVariants[application.status]}>{applicationStatusLabels[application.status]}</StatusBadge>
          </div>

          {canEdit ? (
            <form action={updateBusinessDraftApplication} className="mt-5 grid gap-5">
              <input name="applicationId" type="hidden" value={application.id} />
              <input name="type" type="hidden" value={application.type} />
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[var(--radius-md)] border border-black/10 bg-[rgba(255,252,248,0.72)] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Тип заявки</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text)]">{applicationTypeLabels[application.type]}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Тип фиксируется для черновика, чтобы показывать только нужные поля.</p>
                </div>
                <FormField htmlFor="title" label="Короткое название">
                  <Input id="title" name="title" required maxLength={180} defaultValue={payloadValue(application.payload, 'title')} />
                </FormField>
                <FormField htmlFor="cityId" label="Город">
                  <Select id="cityId" name="cityId" defaultValue={application.cityId ?? businessAccount.cityId ?? ''}>
                    <option value="">Не выбран</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </Select>
                </FormField>
                {renderDraftTypeFields(application.type, application.payload)}
              </div>
              <FormField htmlFor="details" label="Подробности">
                <Textarea id="details" name="details" required maxLength={4000} rows={6} defaultValue={application.message ?? ''} />
              </FormField>
              <CheckboxField defaultChecked name="consent" required value="accepted">
                Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
                <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink> для этой заявки.
              </CheckboxField>
              <ActionRow className="border-t-0 pt-0">
                <SubmitButton>Сохранить изменения</SubmitButton>
              </ActionRow>
            </form>
          ) : (
            <dl className="mt-5 grid gap-4 text-sm">
              <div>
                <dt className="font-semibold">Город</dt>
                <dd className="mt-1 text-[var(--muted)]">{application.city?.name ?? 'Не указан'}</dd>
              </div>
              <div>
                <dt className="font-semibold">Подробности</dt>
                <dd className="mt-1 whitespace-pre-wrap leading-7 text-[var(--muted)]">{application.message ?? '-'}</dd>
              </div>
              {application.businessNotes ? (
                <div>
                  <dt className="font-semibold">Комментарий администратора</dt>
                  <dd className="mt-1 whitespace-pre-wrap leading-7 text-[var(--muted)]">{application.businessNotes}</dd>
                </div>
              ) : null}
            </dl>
          )}
        </Panel>

        <NextActionPanel
          description={
            canEdit
              ? 'Черновик можно сохранить, отправить на проверку или перенести в архив.'
              : 'Заявка уже отправлена. Здесь доступен возврат к журналу компании.'
          }
          items={[
            {
              label: applicationStatusLabels[application.status],
              detail: canEdit ? 'Заполните обязательные поля и отправьте заявку.' : 'Статус обновляется командой BARSYNERGY.',
              status: canEdit ? 'черновик' : 'отправлена'
            }
          ]}
          title="Действия по заявке"
        >
          <div className="grid gap-3">
            {canEdit ? (
              <>
                <form action={submitBusinessDraftApplication}>
                  <input name="applicationId" type="hidden" value={application.id} />
                  <SubmitButton className="w-full">
                    Отправить на проверку
                  </SubmitButton>
                </form>
                <form action={archiveBusinessDraftApplication}>
                  <input name="applicationId" type="hidden" value={application.id} />
                  <SubmitButton className="w-full" variant="secondary">
                    Перенести в архив
                  </SubmitButton>
                </form>
              </>
            ) : null}
            <Button href="/business/cabinet/requests" variant="ghost">
              Вернуться к заявкам
            </Button>
          </div>
        </NextActionPanel>
      </div>
    </div>
  );
}
