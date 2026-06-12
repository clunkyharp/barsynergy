'use client';

import { useActionState } from 'react';
import { InlineAlert } from '@/components/ui/inline-alert';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';

type ActionResult = { type: 'success' | 'error'; message: string };

type BusinessFormAction = (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;

type CityOption = {
  id: string;
  name: string;
};

type BusinessProfileAccount = {
  cityId: string | null;
  companyName: string;
  contactPerson: string | null;
  description: string | null;
  phone: string | null;
  telegram: string | null;
  websiteUrl: string | null;
};

type BusinessProfileSheetProps = {
  account: BusinessProfileAccount;
  action: BusinessFormAction;
  cities: CityOption[];
};

function SheetSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="border-t border-[var(--line)] pt-5 first:border-t-0 first:pt-0">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{title}</h3>
      {children}
    </section>
  );
}

export function BusinessProfileSheet({ account, action, cities }: BusinessProfileSheetProps) {
  const [result, formAction] = useActionState(action, null);

  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-elevated)] shadow-[var(--shadow-panel)]">
      <div className="grid gap-4 border-b border-[var(--line)] px-5 py-5 md:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Профильный лист</p>
          <h2 className="mt-3 text-[1.65rem] font-semibold leading-tight tracking-normal">
            Данные компании
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Эти данные подставляются в заявки и помогают команде быстрее сверить контекст.
          </p>
        </div>
        <StatusBadge variant="success">Доступ активен</StatusBadge>
      </div>

      <form action={formAction} className="grid gap-6 p-5 md:p-6" noValidate>
        <SheetSection title="Компания">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField htmlFor="companyName" label="Компания">
              <Input id="companyName" name="companyName" required maxLength={160} placeholder="Например, Coffee Point" defaultValue={account.companyName} />
            </FormField>
            <FormField htmlFor="contactPerson" label="Контактное лицо">
              <Input id="contactPerson" name="contactPerson" required maxLength={120} placeholder="Иван Иванов" defaultValue={account.contactPerson ?? ''} />
            </FormField>
            <FormField htmlFor="cityId" label="Город">
              <Select id="cityId" name="cityId" defaultValue={account.cityId ?? ''}>
                <option value="">Не выбран</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </SheetSection>

        <SheetSection title="Контакты">
          <div className="grid gap-5 md:grid-cols-3">
            <FormField htmlFor="phone" label="Телефон">
              <Input id="phone" name="phone" maxLength={80} placeholder="+7 999 123 45 67" defaultValue={account.phone ?? ''} />
            </FormField>
            <FormField htmlFor="telegram" label="Telegram">
              <Input id="telegram" name="telegram" maxLength={80} placeholder="@username" defaultValue={account.telegram ?? ''} />
            </FormField>
            <FormField htmlFor="websiteUrl" label="Сайт">
              <Input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://example.ru" maxLength={240} defaultValue={account.websiteUrl ?? ''} />
            </FormField>
          </div>
        </SheetSection>

        <SheetSection title="Описание">
          <FormField htmlFor="description" label="О компании">
            <Textarea
              id="description"
              name="description"
              className="min-h-36"
              maxLength={1000}
              rows={5}
              placeholder="Например: кофейня в центре города, завтраки весь день, спешелти-кофе и вечерние события."
              defaultValue={account.description ?? ''}
            />
          </FormField>
        </SheetSection>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
          <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
            После сохранения новые заявки будут использовать обновлённые данные компании.
          </p>
          <SubmitButton className="rounded-[var(--radius-md)]">Сохранить профиль</SubmitButton>
        </div>

        {result ? (
          <InlineAlert tone={result.type === 'error' ? 'error' : 'success'}>
            {result.message}
          </InlineAlert>
        ) : null}
      </form>
    </section>
  );
}
