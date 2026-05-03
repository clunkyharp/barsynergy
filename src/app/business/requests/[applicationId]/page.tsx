import { notFound } from 'next/navigation';
import { ApplicationStatus, ApplicationType } from '@prisma/client';
import {
  archiveBusinessDraftApplication,
  submitBusinessDraftApplication,
  updateBusinessDraftApplication
} from '@/app/business/actions';
import { AdminActionAlert } from '@/components/admin/content-admin-controls';
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

const requestTypes = [
  ApplicationType.VACANCY_SUBMISSION,
  ApplicationType.SUPPLIER_SUBMISSION,
  ApplicationType.PARTNER_APPLICATION,
  ApplicationType.CORPORATE_TRAINING_APPLICATION,
  ApplicationType.CERTIFICATE_ORDER
] as const;

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
              <div className="grid gap-5 md:grid-cols-2">
                <FormField htmlFor="type" label="Тип заявки">
                  <Select id="type" name="type" required defaultValue={application.type}>
                    {requestTypes.map((type) => (
                      <option key={type} value={type}>
                        {applicationTypeLabels[type]}
                      </option>
                    ))}
                  </Select>
                </FormField>
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
                <FormField htmlFor="position" label="Должность для вакансии">
                  <Select
                    id="position"
                    name="position"
                    defaultValue={
                      isVacancyPosition(payloadValue(application.payload, 'position'))
                        ? payloadValue(application.payload, 'position')
                        : ''
                    }
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
                  <Input
                    id="employmentType"
                    name="employmentType"
                    maxLength={100}
                    defaultValue={payloadValue(application.payload, 'employmentType')}
                  />
                </FormField>
                <FormField htmlFor="salaryLabel" label="Зарплата">
                  <Input id="salaryLabel" name="salaryLabel" maxLength={120} defaultValue={payloadValue(application.payload, 'salaryLabel')} />
                </FormField>
                <FormField htmlFor="experienceLabel" label="Опыт">
                  <Input
                    id="experienceLabel"
                    name="experienceLabel"
                    maxLength={120}
                    defaultValue={payloadValue(application.payload, 'experienceLabel')}
                  />
                </FormField>
                <FormField htmlFor="shortDescription" label="Краткое описание">
                  <Input
                    id="shortDescription"
                    name="shortDescription"
                    maxLength={500}
                    defaultValue={payloadValue(application.payload, 'shortDescription')}
                  />
                </FormField>
                <FormField htmlFor="serviceArea" label="Зона поставки">
                  <Input id="serviceArea" name="serviceArea" maxLength={160} defaultValue={payloadValue(application.payload, 'serviceArea')} />
                </FormField>
                <FormField htmlFor="partnerType" label="Тип партнерства">
                  <Input id="partnerType" name="partnerType" maxLength={160} defaultValue={payloadValue(application.payload, 'partnerType')} />
                </FormField>
                <FormField htmlFor="teamSize" label="Размер команды">
                  <Input id="teamSize" name="teamSize" maxLength={80} defaultValue={payloadValue(application.payload, 'teamSize')} />
                </FormField>
                <FormField htmlFor="amountLabel" label="Сумма сертификата">
                  <Input id="amountLabel" name="amountLabel" maxLength={120} defaultValue={payloadValue(application.payload, 'amountLabel')} />
                </FormField>
                <FormField htmlFor="recipientName" label="Получатель сертификата">
                  <Input
                    id="recipientName"
                    name="recipientName"
                    maxLength={160}
                    defaultValue={payloadValue(application.payload, 'recipientName')}
                  />
                </FormField>
              </div>
              <FormField htmlFor="details" label="Подробности">
                <Textarea id="details" name="details" required maxLength={4000} rows={6} defaultValue={application.message ?? ''} />
              </FormField>
              <CheckboxField defaultChecked name="consent" required value="accepted">
                Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
                <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink> для этой заявки.
              </CheckboxField>
              <ActionRow className="border-t-0 pt-0">
                <Button type="submit">Сохранить изменения</Button>
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

        <div className="space-y-4">
          {canEdit ? (
            <Panel padding="md" tone="elevated">
              <h2 className="text-lg font-semibold">Действия</h2>
              <div className="mt-5 grid gap-3">
                <form action={submitBusinessDraftApplication}>
                  <input name="applicationId" type="hidden" value={application.id} />
                  <Button className="w-full" type="submit">
                    Отправить на проверку
                  </Button>
                </form>
                <form action={archiveBusinessDraftApplication}>
                  <input name="applicationId" type="hidden" value={application.id} />
                  <Button className="w-full" type="submit" variant="secondary">
                    Перенести в архив
                  </Button>
                </form>
              </div>
            </Panel>
          ) : null}
          <Button href="/business/requests" variant="ghost">
            Вернуться к заявкам
          </Button>
        </div>
      </div>
    </div>
  );
}
