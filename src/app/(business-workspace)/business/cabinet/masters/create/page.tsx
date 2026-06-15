import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { getActiveCities } from '@/modules/business/queries';
import { createBusinessMasterAction } from '../actions';
import { EntityTypeToggle } from '../_components/entity-type-toggle';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Новая карточка мастера',
  description: 'Создание карточки мастера для вашей компании.'
});

export default async function BusinessMasterCreatePage() {
  const { businessAccount } = await requireBusinessAccountAccess();
  const cities = await getActiveCities();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader title="Новая карточка мастера" />
        <Button href="/business/cabinet/masters" variant="secondary">
          Назад к списку
        </Button>
      </div>

      <form action={createBusinessMasterAction} className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-elevated)] shadow-[var(--shadow-panel)]">
        <div className="space-y-6 p-5 md:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <EntityTypeToggle
              defaultType="BUSINESS"
              defaultCompanyName={businessAccount.companyName ?? ''}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField htmlFor="master-specializations" label="Специализации" hint="Через запятую.">
              <Textarea id="master-specializations" name="specializations" className="min-h-28" required minLength={2} maxLength={500} placeholder="Барная карта, обучение персонала, запуск сервиса" />
            </FormField>
            <div className="grid gap-5">
              <FormField htmlFor="master-serviceArea" label="Зона работы">
                <Input id="master-serviceArea" name="serviceArea" maxLength={180} placeholder="Например, Москва и область" />
              </FormField>
              <FormField htmlFor="master-experienceYears" label="Опыт, лет">
                <Input id="master-experienceYears" name="experienceYears" min={0} max={80} type="number" />
              </FormField>
              <FormField htmlFor="master-rateLabel" label="Стоимость">
                <Input id="master-rateLabel" name="rateLabel" maxLength={120} placeholder="Например, от 30 000 рублей" />
              </FormField>
            </div>
          </div>

          <FormField htmlFor="master-summary" label="Краткое описание">
            <Textarea id="master-summary" name="summary" required minLength={10} maxLength={500} rows={4} />
          </FormField>

          <FormField htmlFor="master-description" label="Подробности">
            <Textarea id="master-description" name="description" className="min-h-40" required minLength={20} maxLength={4000} rows={6} />
          </FormField>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField htmlFor="master-cityId" label="Город">
              <Select id="master-cityId" name="cityId" defaultValue={businessAccount.cityId ?? ''}>
                <option value="">Не выбран</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="border-t border-[var(--line)] pt-6">
            <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Контакты</p>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField htmlFor="master-contactLabel" label="Контакт">
                <Input id="master-contactLabel" name="contactLabel" maxLength={180} placeholder="Например, отдел проектов" />
              </FormField>
              <FormField htmlFor="master-contactTelegram" label="Telegram">
                <Input id="master-contactTelegram" name="contactTelegram" maxLength={120} placeholder="@username" />
              </FormField>
              <FormField htmlFor="master-contactPhone" label="Телефон">
                <Input id="master-contactPhone" name="contactPhone" maxLength={60} type="tel" placeholder="+7 (999) 123-45-67" />
              </FormField>
              <FormField htmlFor="master-contactEmail" label="Email">
                <Input id="master-contactEmail" name="contactEmail" maxLength={180} type="email" placeholder="mail@example.com" />
              </FormField>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--line)] px-5 py-4 md:px-6">
          <Button href="/business/cabinet/masters" variant="ghost">
            Отмена
          </Button>
          <SubmitButton className="rounded-[var(--radius-md)]" size="lg">
            Сохранить черновик
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
