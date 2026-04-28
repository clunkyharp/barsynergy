import { createBusinessAccountRequestAction } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { prisma } from '@/lib/db/prisma';
import { getEnv } from '@/lib/validation/env';

const errorMessages: Record<string, string> = {
  invalid: 'Проверьте обязательные поля, email, сайт и пароль от 8 символов.',
  exists: 'Пользователь с таким email уже существует.',
  disabled: 'Публичные формы с персональными данными отключены до юридического подтверждения.'
};

type RegisterPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const env = getEnv();
  const formsEnabled = arePublicApplicationFormsEnabled(env);
  const params = (await searchParams) ?? {};
  const error = firstParam(params.error);
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true }
  });

  return (
    <div className="container max-w-4xl py-12">
      <PageHeader
        eyebrow="Бизнес-аккаунт"
        title="Запросить доступ"
        description="Бизнес-кабинет открывается после проверки администратором. Самостоятельной публикации материалов здесь нет."
      />
      <Card className="mt-8 p-6">
        {!formsEnabled ? (
          <p className="rounded-md border border-[var(--warning)] bg-[var(--warning)]/10 p-3 text-sm text-[var(--text)]">
            Публичные формы с персональными данными отключены до юридического подтверждения.
          </p>
        ) : null}
        {error && errorMessages[error] ? (
          <p className="mb-5 rounded-md border border-[var(--danger)] bg-[var(--danger)]/5 p-3 text-sm text-[var(--danger)]">
            {errorMessages[error]}
          </p>
        ) : null}
        <form action={createBusinessAccountRequestAction} className="mt-5 grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField htmlFor="companyName" label="Компания">
              <Input id="companyName" name="companyName" required maxLength={160} disabled={!formsEnabled} />
            </FormField>
            <FormField htmlFor="contactPerson" label="Контактное лицо">
              <Input id="contactPerson" name="contactPerson" required maxLength={120} disabled={!formsEnabled} />
            </FormField>
            <FormField htmlFor="email" label="Email для входа">
              <Input id="email" name="email" type="email" autoComplete="email" required disabled={!formsEnabled} />
            </FormField>
            <FormField htmlFor="password" label="Пароль">
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                autoComplete="new-password"
                required
                disabled={!formsEnabled}
              />
            </FormField>
            <FormField htmlFor="cityId" label="Город">
              <Select id="cityId" name="cityId" disabled={!formsEnabled}>
                <option value="">Не выбран</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="phone" label="Телефон">
              <Input id="phone" name="phone" maxLength={80} disabled={!formsEnabled} />
            </FormField>
            <FormField htmlFor="telegram" label="Telegram">
              <Input id="telegram" name="telegram" maxLength={80} disabled={!formsEnabled} />
            </FormField>
            <FormField htmlFor="websiteUrl" label="Сайт">
              <Input id="websiteUrl" name="websiteUrl" type="url" maxLength={240} disabled={!formsEnabled} />
            </FormField>
          </div>
          <FormField htmlFor="description" label="Кратко о компании и запросе">
            <Textarea id="description" name="description" maxLength={1000} rows={5} disabled={!formsEnabled} />
          </FormField>
          <label className="flex gap-3 text-sm leading-6">
            <Checkbox name="consent" required disabled={!formsEnabled} />
            <span>
              Согласен на обработку персональных данных для рассмотрения заявки. Текст согласия доступен на странице{' '}
              <a className="font-semibold text-[var(--accent)] underline" href="/legal/personal-data-consent">
                согласия на обработку ПДн
              </a>
              .
            </span>
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={!formsEnabled}>
              Отправить заявку
            </Button>
            <Button href="/auth/login" variant="secondary">
              Уже есть доступ
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
