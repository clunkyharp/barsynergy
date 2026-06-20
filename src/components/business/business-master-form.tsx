import type { ContentStatus } from '@prisma/client';
import { ActionRow } from '@/components/ui/action-row';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { contentStatusBadgeVariants, contentStatusLabels } from '@/lib/admin/content-utils';

type CityOption = {
  id: string;
  name: string;
};

type BusinessMasterFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  cities: CityOption[];
  defaultCityId?: string | null;
};

type BusinessMasterListProps = {
  masters: Array<{
    id: string;
    title: string;
    slug: string;
    status: ContentStatus;
    summary: string;
    city: { name: string } | null;
    isVerified: boolean;
    updatedAt: Date;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

export function BusinessMasterForm({ action, cities, defaultCityId }: BusinessMasterFormProps) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-elevated)] shadow-[var(--shadow-panel)]">
      <div className="border-b border-[var(--line)] px-5 py-5 md:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Услуга мастера</p>
        <h2 className="mt-3 text-[1.65rem] font-semibold leading-tight tracking-normal">Добавить услугу компании</h2>
      </div>
      <form action={action} className="grid gap-6 p-5 md:p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField htmlFor="title" label="Название услуги">
            <Input id="title" name="title" required minLength={2} maxLength={180} placeholder="Например, запуск барной карты" />
          </FormField>
          <FormField htmlFor="cityId" label="Город">
            <Select id="cityId" name="cityId" defaultValue={defaultCityId ?? ''}>
              <option value="">Не выбран</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="specializations" label="Специализации" hint="Через запятую.">
            <Textarea id="specializations" name="specializations" className="min-h-28" required minLength={2} maxLength={500} placeholder="Барная карта, обучение персонала, запуск сервиса" />
          </FormField>
          <div className="grid gap-5">
            <FormField htmlFor="serviceArea" label="Зона работы">
              <Input id="serviceArea" name="serviceArea" maxLength={180} placeholder="Например, Москва и область" />
            </FormField>
            <FormField htmlFor="experienceYears" label="Опыт, лет">
              <Input id="experienceYears" name="experienceYears" min={0} max={80} type="number" />
            </FormField>
            <FormField htmlFor="rateLabel" label="Стоимость">
              <Input id="rateLabel" name="rateLabel" maxLength={120} placeholder="Например, от 30 000 рублей" />
            </FormField>
          </div>
        </div>
        <FormField htmlFor="summary" label="Краткое описание">
          <Textarea id="summary" name="summary" required minLength={10} maxLength={500} rows={4} />
        </FormField>
        <FormField htmlFor="description" label="Подробности">
          <Textarea id="description" name="description" className="min-h-40" required minLength={20} maxLength={4000} rows={6} />
        </FormField>
        <FormField htmlFor="contactLabel" label="Контактное лицо" hint="Имя или должность.">
          <Input id="contactLabel" name="contactLabel" maxLength={120} placeholder="Например, отдел проектов" />
        </FormField>
        <ActionRow>
          <SubmitButton className="rounded-[var(--radius-md)]" size="lg">
            Сохранить черновик
          </SubmitButton>
        </ActionRow>
      </form>
    </section>
  );
}

export function BusinessMasterList({ masters }: BusinessMasterListProps) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-panel)] md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Каталог</p>
          <h2 className="mt-2 text-xl font-semibold">Услуги компании</h2>
        </div>
        <p className="text-sm text-[var(--muted)]">Всего: {masters.length}</p>
      </div>
      <div className="mt-5 grid gap-3">
        {masters.length === 0 ? (
          <p className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--muted)]">
            Услуг мастеров пока нет. Создайте первую карточку слева.
          </p>
        ) : (
          masters.map((master) => (
            <article className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-elevated)] p-4" key={master.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold">{master.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{master.summary}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    /{master.slug} · {master.city?.name ?? 'Город не указан'} · обновлено {dateFormatter.format(master.updatedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <StatusBadge variant={contentStatusBadgeVariants[master.status]}>{contentStatusLabels[master.status]}</StatusBadge>
                  {master.isVerified ? <StatusBadge variant="success">Проверен</StatusBadge> : null}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
