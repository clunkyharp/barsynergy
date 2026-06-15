import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { contentStatusBadgeVariants, contentStatusLabels } from '@/lib/admin/content-utils';
import { getActiveCities, getBusinessMasterById } from '@/modules/business/queries';
import { updateBusinessMasterAction } from '../actions';
import { EntityTypeToggle } from '../_components/entity-type-toggle';

type PageProps = {
  params: Promise<{ masterId: string }>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Редактирование карточки мастера',
  description: 'Редактирование карточки мастера.'
});

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

export default async function BusinessMasterEditPage({ params }: PageProps) {
  const { businessAccount } = await requireBusinessAccountAccess();
  const { masterId } = await params;

  const [master, cities] = await Promise.all([
    getBusinessMasterById(masterId, businessAccount.id),
    getActiveCities()
  ]);

  if (!master) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader title={`Редактирование: ${master.title}`} />
        <Button href="/business/cabinet/masters" variant="secondary">
          Назад к списку
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] px-5 py-4">
        <span className="text-sm text-[var(--muted)]">Статус:</span>
        <StatusBadge variant={contentStatusBadgeVariants[master.status]}>
          {contentStatusLabels[master.status]}
        </StatusBadge>
        {master.isVerified ? (
          <StatusBadge variant="success">Проверен</StatusBadge>
        ) : null}
        {master.publishedAt ? (
          <span className="text-sm text-[var(--muted)]">
            Опубликовано {dateFormatter.format(master.publishedAt)}
          </span>
        ) : null}
      </div>

      <form
        action={updateBusinessMasterAction.bind(null, master.id)}
        className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-elevated)] shadow-[var(--shadow-panel)]"
      >
        <div className="space-y-6 p-5 md:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField htmlFor="master-slug" label="Slug">
              <Input id="master-slug" value={`/${master.slug}`} readOnly className="text-[var(--muted)]" tabIndex={-1} />
            </FormField>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <EntityTypeToggle
              defaultType={master.entityType}
              defaultFullName={master.fullName ?? ''}
              defaultCompanyName={master.companyName ?? ''}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField htmlFor="master-specializations" label="Специализации" hint="Через запятую.">
              <Textarea id="master-specializations" name="specializations" className="min-h-28" required minLength={2} maxLength={500} defaultValue={master.specializations.join(', ')} />
            </FormField>
            <div className="grid gap-5">
              <FormField htmlFor="master-serviceArea" label="Зона работы">
                <Input id="master-serviceArea" name="serviceArea" maxLength={180} defaultValue={master.serviceArea ?? ''} />
              </FormField>
              <FormField htmlFor="master-experienceYears" label="Опыт, лет">
                <Input id="master-experienceYears" name="experienceYears" min={0} max={80} type="number" defaultValue={master.experienceYears != null ? String(master.experienceYears) : ''} />
              </FormField>
              <FormField htmlFor="master-rateLabel" label="Стоимость">
                <Input id="master-rateLabel" name="rateLabel" maxLength={120} defaultValue={master.rateLabel ?? ''} />
              </FormField>
            </div>
          </div>

          <FormField htmlFor="master-summary" label="Краткое описание">
            <Textarea id="master-summary" name="summary" required minLength={10} maxLength={500} rows={4} defaultValue={master.summary} />
          </FormField>

          <FormField htmlFor="master-description" label="Подробности">
            <Textarea id="master-description" name="description" className="min-h-40" required minLength={20} maxLength={4000} rows={6} defaultValue={master.description} />
          </FormField>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField htmlFor="master-cityId" label="Город">
              <Select id="master-cityId" name="cityId" defaultValue={master.cityId ?? ''}>
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
                <Input id="master-contactLabel" name="contactLabel" maxLength={180} defaultValue={master.contactLabel ?? ''} />
              </FormField>
              <FormField htmlFor="master-contactTelegram" label="Telegram">
                <Input id="master-contactTelegram" name="contactTelegram" maxLength={120} defaultValue={master.contactTelegram ?? ''} />
              </FormField>
              <FormField htmlFor="master-contactPhone" label="Телефон">
                <Input id="master-contactPhone" name="contactPhone" maxLength={60} type="tel" defaultValue={master.contactPhone ?? ''} />
              </FormField>
              <FormField htmlFor="master-contactEmail" label="Email">
                <Input id="master-contactEmail" name="contactEmail" maxLength={180} type="email" defaultValue={master.contactEmail ?? ''} />
              </FormField>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--line)] px-5 py-4 md:px-6">
          <Button href="/business/cabinet/masters" variant="ghost">
            Отмена
          </Button>
          <SubmitButton className="rounded-[var(--radius-md)]" size="lg">
            Сохранить изменения
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
