import { createBusinessAccountRequestAction } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
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
  const cities = formsEnabled
    ? await prisma.city.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true }
      })
    : [];

  return (
    <div className="container max-w-6xl py-12 md:py-16">
      <div className="grid gap-6 xl:grid-cols-[0.4fr_0.6fr] xl:items-start">
        <section className="editorial-form-shell p-6 md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Бизнес-аккаунт</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">Запросить доступ</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-[var(--muted)]">
            Доступ открывается после проверки администратором. Форма нужна для первой заявки и связи по компании.
          </p>
          <div className="mt-8 border-t border-black/10 pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Что указать</p>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--muted)]">
              <li className="grid grid-cols-[0.5rem_minmax(0,1fr)] gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
                <span>Название компании, контактное лицо и удобный канал связи.</span>
              </li>
              <li className="grid grid-cols-[0.5rem_minmax(0,1fr)] gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
                <span>Короткое описание бизнеса и задачи, с которой вы хотите работать через кабинет.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="editorial-form-shell overflow-hidden">
          {!formsEnabled ? (
            <div className="p-5 md:p-6">
              <div className="rounded-[1.5rem] border border-[var(--warning)]/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.72))] p-6 md:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--warning)]">Доступ временно закрыт</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">Форма заявок сейчас недоступна</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                  Юридическое подтверждение для персональных данных еще не завершено. Пока что не показываем интерактивную форму, чтобы
                  пользователь не попадал в тупик с заблокированными полями.
                </p>
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-black/10 bg-white/70 px-4 py-4 text-sm leading-6 text-[var(--muted)]">
                    Если нужно обсудить подключение заранее, используйте рабочий контакт команды.
                  </div>
                  <div className="rounded-[1.25rem] border border-black/10 bg-white/70 px-4 py-4 text-sm leading-6 text-[var(--muted)]">
                    Как только юридический контур будет готов, форма снова откроется и сохранит этот же сценарий доступа.
                  </div>
                </div>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button className="min-h-12 rounded-full px-6 tracking-[0.12em]" href="/contacts">
                    Связаться с командой
                  </Button>
                  <Button className="min-h-12 rounded-full px-6 tracking-[0.12em]" href="/auth/login" variant="secondary">
                    Уже есть доступ
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-black/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.58))] px-5 py-5 md:px-6 md:py-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Заявка на доступ</p>
                <h2 className="mt-3 text-2xl font-semibold uppercase leading-8">Данные компании</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
                  После проверки администратор откроет доступ к кабинету и заявкам бизнеса.
                </p>
              </div>
              <div className="p-5 md:p-6">
                {error && errorMessages[error] ? (
                  <p className="mb-5 rounded-[1.15rem] border border-[var(--danger)] bg-[var(--danger)]/5 px-4 py-4 text-sm leading-6 text-[var(--danger)]">
                    {errorMessages[error]}
                  </p>
                ) : null}
                <form action={createBusinessAccountRequestAction} className="grid gap-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField htmlFor="companyName" label="Компания">
                      <Input id="companyName" name="companyName" required maxLength={160} />
                    </FormField>
                    <FormField htmlFor="contactPerson" label="Контактное лицо">
                      <Input id="contactPerson" name="contactPerson" required maxLength={120} />
                    </FormField>
                    <FormField htmlFor="email" label="Email для входа">
                      <Input id="email" name="email" type="email" autoComplete="email" required />
                    </FormField>
                    <FormField htmlFor="password" label="Пароль" hint="Минимум 8 символов. Лучше использовать уникальный пароль для кабинета.">
                      <Input id="password" name="password" type="password" minLength={8} autoComplete="new-password" required />
                    </FormField>
                    <FormField htmlFor="cityId" label="Город">
                      <Select id="cityId" name="cityId">
                        <option value="">Не выбран</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                    <FormField htmlFor="phone" label="Телефон">
                      <Input id="phone" name="phone" maxLength={80} />
                    </FormField>
                    <FormField htmlFor="telegram" label="Telegram">
                      <Input id="telegram" name="telegram" maxLength={80} />
                    </FormField>
                    <FormField htmlFor="websiteUrl" label="Сайт">
                      <Input id="websiteUrl" name="websiteUrl" type="url" maxLength={240} />
                    </FormField>
                  </div>
                  <FormField htmlFor="description" label="Кратко о компании и запросе">
                    <Textarea id="description" name="description" className="min-h-40" maxLength={1000} rows={5} />
                  </FormField>
                  <label className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-3.5 rounded-[1.15rem] border border-black/10 bg-[rgba(255,255,255,0.6)] px-4 py-4 text-sm leading-6 text-[var(--muted)]">
                    <Checkbox name="consent" required />
                    <span>
                      Согласен на обработку персональных данных для рассмотрения заявки. Текст согласия доступен на странице{' '}
                      <a className="font-semibold text-[var(--accent)] underline underline-offset-4" href="/legal/personal-data-consent">
                        согласия на обработку ПДн
                      </a>
                      .
                    </span>
                  </label>
                  <div className="flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-md text-xs leading-6 text-[var(--muted)]">
                      После проверки доступ откроют вручную. Используйте email, который потом останется основным для кабинета.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button className="min-h-12 rounded-full px-6 tracking-[0.12em]" type="submit">
                        Отправить заявку
                      </Button>
                      <Button className="min-h-12 rounded-full px-6 tracking-[0.12em]" href="/auth/login" variant="secondary">
                        Уже есть доступ
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
