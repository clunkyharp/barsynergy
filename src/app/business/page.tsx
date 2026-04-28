import { updateBusinessProfile } from '@/app/business/actions';
import { AdminActionAlert } from '@/components/admin/content-admin-controls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { prisma } from '@/lib/db/prisma';

type BusinessDashboardPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function BusinessDashboardPage({ searchParams }: BusinessDashboardPageProps) {
  const { businessAccount } = await requireBusinessAccountAccess();
  const params = (await searchParams) ?? {};
  const [cities, requestCount] = await Promise.all([
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    }),
    prisma.application.count({ where: { businessAccountId: businessAccount.id } })
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Компания"
        title={businessAccount.companyName}
        description="Профиль компании используется для заявок из кабинета. Публикация материалов остается через администратора."
      />
      <AdminActionAlert params={params} />
      <section className="grid gap-4 md:grid-cols-[1fr_0.75fr]">
        <Card className="p-5">
          <h2 className="text-lg font-semibold">Профиль компании</h2>
          <form action={updateBusinessProfile} className="mt-5 grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField htmlFor="companyName" label="Компания">
                <Input id="companyName" name="companyName" required maxLength={160} defaultValue={businessAccount.companyName} />
              </FormField>
              <FormField htmlFor="contactPerson" label="Контактное лицо">
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  required
                  maxLength={120}
                  defaultValue={businessAccount.contactPerson ?? ''}
                />
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
              <FormField htmlFor="phone" label="Телефон">
                <Input id="phone" name="phone" maxLength={80} defaultValue={businessAccount.phone ?? ''} />
              </FormField>
              <FormField htmlFor="telegram" label="Telegram">
                <Input id="telegram" name="telegram" maxLength={80} defaultValue={businessAccount.telegram ?? ''} />
              </FormField>
              <FormField htmlFor="websiteUrl" label="Сайт">
                <Input id="websiteUrl" name="websiteUrl" type="url" maxLength={240} defaultValue={businessAccount.websiteUrl ?? ''} />
              </FormField>
            </div>
            <FormField htmlFor="description" label="Описание">
              <Textarea
                id="description"
                name="description"
                maxLength={1000}
                rows={5}
                defaultValue={businessAccount.description ?? ''}
              />
            </FormField>
            <Button type="submit">Сохранить профиль</Button>
          </form>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-lg font-semibold">Статус</h2>
            <div className="mt-4">
              <Badge variant="success">Активен</Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              Компания может создавать заявки, но не может публиковать вакансии, поставщиков или партнерские карточки напрямую.
            </p>
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-semibold">Заявки</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Всего связанных заявок: {requestCount}</p>
            <Button className="mt-5 w-full" href="/business/requests" variant="secondary">
              Открыть заявки
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
