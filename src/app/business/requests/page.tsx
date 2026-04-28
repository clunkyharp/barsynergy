import { ApplicationType } from '@prisma/client';
import { createBusinessApplication } from '@/app/business/actions';
import { AdminActionAlert } from '@/components/admin/content-admin-controls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels,
  applicationTypeLabels
} from '@/lib/admin/application-utils';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { prisma } from '@/lib/db/prisma';
import { vacancyPositionValues } from '@/lib/vacancies/positions';

const requestTypes = [
  ApplicationType.VACANCY_SUBMISSION,
  ApplicationType.SUPPLIER_SUBMISSION,
  ApplicationType.PARTNER_APPLICATION,
  ApplicationType.CORPORATE_TRAINING_APPLICATION,
  ApplicationType.CERTIFICATE_ORDER
] as const;

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

type BusinessRequestsPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function BusinessRequestsPage({ searchParams }: BusinessRequestsPageProps) {
  const { businessAccount } = await requireBusinessAccountAccess();
  const params = (await searchParams) ?? {};
  const [cities, applications] = await Promise.all([
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    }),
    prisma.application.findMany({
      where: { businessAccountId: businessAccount.id },
      orderBy: [{ createdAt: 'desc' }],
      take: 50,
      select: {
        id: true,
        type: true,
        status: true,
        subject: true,
        businessNotes: true,
        createdAt: true
      }
    })
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Бизнес-заявки"
        title="Заявки компании"
        description="Создавайте черновики или отправляйте заявки на проверку. Администратор остается точкой публикации."
      />
      <AdminActionAlert params={params} />
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-5">
          <h2 className="text-lg font-semibold">Новая заявка</h2>
          <form action={createBusinessApplication} className="mt-5 grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField htmlFor="type" label="Тип заявки">
                <Select id="type" name="type" required defaultValue={ApplicationType.VACANCY_SUBMISSION}>
                  {requestTypes.map((type) => (
                    <option key={type} value={type}>
                      {applicationTypeLabels[type]}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField htmlFor="title" label="Короткое название">
                <Input id="title" name="title" required maxLength={180} />
              </FormField>
              <FormField htmlFor="cityId" label="Город">
                <Select id="cityId" name="cityId" defaultValue={businessAccount.cityId ?? ''}>
                  <option value="">Не выбран</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField htmlFor="position" label="Должность для вакансии">
                <Select id="position" name="position" defaultValue="">
                  <option value="">Не выбрана</option>
                  {vacancyPositionValues.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField htmlFor="employmentType" label="Тип занятости">
                <Input id="employmentType" name="employmentType" maxLength={100} />
              </FormField>
              <FormField htmlFor="salaryLabel" label="Зарплата">
                <Input id="salaryLabel" name="salaryLabel" maxLength={120} />
              </FormField>
              <FormField htmlFor="experienceLabel" label="Опыт">
                <Input id="experienceLabel" name="experienceLabel" maxLength={120} />
              </FormField>
              <FormField htmlFor="shortDescription" label="Краткое описание">
                <Input id="shortDescription" name="shortDescription" maxLength={500} />
              </FormField>
              <FormField htmlFor="serviceArea" label="Зона поставки">
                <Input id="serviceArea" name="serviceArea" maxLength={160} />
              </FormField>
              <FormField htmlFor="partnerType" label="Тип партнерства">
                <Input id="partnerType" name="partnerType" maxLength={160} />
              </FormField>
              <FormField htmlFor="teamSize" label="Размер команды">
                <Input id="teamSize" name="teamSize" maxLength={80} />
              </FormField>
              <FormField htmlFor="amountLabel" label="Сумма сертификата">
                <Input id="amountLabel" name="amountLabel" maxLength={120} />
              </FormField>
              <FormField htmlFor="recipientName" label="Получатель сертификата">
                <Input id="recipientName" name="recipientName" maxLength={160} />
              </FormField>
            </div>
            <FormField htmlFor="details" label="Подробности">
              <Textarea id="details" name="details" required maxLength={4000} rows={6} />
            </FormField>
            <label className="flex gap-3 text-sm leading-6">
              <Checkbox name="consent" value="accepted" required />
              <span>Подтверждаю согласие на обработку данных заявки.</span>
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" name="intent" value="submit">
                Отправить на проверку
              </Button>
              <Button type="submit" name="intent" value="draft" variant="secondary">
                Сохранить черновик
              </Button>
            </div>
          </form>
        </Card>

        <section>
          <h2 className="text-xl font-semibold">История заявок</h2>
          <div className="mt-4 grid gap-3">
            {applications.length > 0 ? (
              applications.map((application) => (
                <Card className="p-4" key={application.id}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-[var(--muted)]">{applicationTypeLabels[application.type]}</p>
                      <h3 className="mt-1 font-semibold">{application.subject ?? applicationTypeLabels[application.type]}</h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">{dateFormatter.format(application.createdAt)}</p>
                      {application.businessNotes ? (
                        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{application.businessNotes}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <Badge variant={applicationStatusBadgeVariants[application.status]}>
                        {applicationStatusLabels[application.status]}
                      </Badge>
                      <Button href={`/business/requests/${application.id}`} variant="secondary">
                        Открыть
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-5 text-sm text-[var(--muted)]">У компании пока нет заявок.</Card>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
