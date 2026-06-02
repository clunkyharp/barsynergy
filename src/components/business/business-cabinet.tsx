import type { ReactNode } from 'react';
import { ApplicationStatus, ApplicationType } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/status-badge';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels,
  applicationTypeLabels
} from '@/lib/admin/application-utils';
import { cn } from '@/lib/utils';

type BusinessFormAction = (formData: FormData) => void | Promise<void>;

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

type RequestLedgerApplication = {
  businessNotes: string | null;
  createdAt?: Date;
  id: string;
  status: ApplicationStatus;
  subject: string | null;
  type: ApplicationType;
  updatedAt?: Date;
};

type RequestLedgerProps = {
  applications: RequestLedgerApplication[];
  className?: string;
  description?: string;
  emptyDescription?: string;
  title?: string;
};

type RequestStatusRailItem = {
  detail?: string;
  label: string;
  tone?: StatusBadgeVariant;
  value: number | string;
};

type RequestStatusRailProps = {
  className?: string;
  items: RequestStatusRailItem[];
  title?: string;
};

type NextActionItem = {
  detail: string;
  href?: string;
  label: string;
  status?: string;
};

type NextActionPanelProps = {
  children?: ReactNode;
  className?: string;
  description?: string;
  items?: NextActionItem[];
  primaryAction?: {
    href: string;
    label: string;
  };
  title?: string;
};

const requestDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

function formatRequestDate(application: RequestLedgerApplication) {
  const value = application.updatedAt ?? application.createdAt;
  return value ? requestDateFormatter.format(value) : 'Без даты';
}

function SheetSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="border-t border-[var(--line)] pt-5 first:border-t-0 first:pt-0">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{title}</h3>
      {children}
    </section>
  );
}

export function BusinessProfileSheet({ account, action, cities }: BusinessProfileSheetProps) {
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

      <form action={action} className="grid gap-6 p-5 md:p-6">
        <SheetSection title="Компания">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField htmlFor="companyName" label="Компания">
              <Input id="companyName" name="companyName" required maxLength={160} defaultValue={account.companyName} />
            </FormField>
            <FormField htmlFor="contactPerson" label="Контактное лицо">
              <Input id="contactPerson" name="contactPerson" required maxLength={120} defaultValue={account.contactPerson ?? ''} />
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
              <Input id="phone" name="phone" maxLength={80} defaultValue={account.phone ?? ''} />
            </FormField>
            <FormField htmlFor="telegram" label="Telegram">
              <Input id="telegram" name="telegram" maxLength={80} defaultValue={account.telegram ?? ''} />
            </FormField>
            <FormField htmlFor="websiteUrl" label="Сайт">
              <Input id="websiteUrl" name="websiteUrl" type="url" maxLength={240} defaultValue={account.websiteUrl ?? ''} />
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
      </form>
    </section>
  );
}

export function RequestStatusRail({ className, items, title = 'Статус заявок' }: RequestStatusRailProps) {
  return (
    <aside className={cn('rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-elevated)] p-5', className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{title}</p>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div className="border-t border-[var(--line)] pt-3 first:border-t-0 first:pt-0" key={item.label}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                {item.detail ? <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.detail}</p> : null}
              </div>
              <StatusBadge variant={item.tone ?? 'neutral'} showDot={false}>
                {item.value}
              </StatusBadge>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export function RequestLedger({
  applications,
  className,
  description = 'Последние записи, статусы и рабочие комментарии по компании.',
  emptyDescription = 'Когда компания создаст заявку, здесь появится её статус и рабочий комментарий.',
  title = 'Журнал заявок'
}: RequestLedgerProps) {
  return (
    <section className={cn('rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-elevated)]', className)}>
      <div className="border-b border-[var(--line)] px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Реестр заявок</p>
        <h2 className="mt-2 text-xl font-semibold">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>

      {applications.length > 0 ? (
        <div className="divide-y divide-[var(--line)]">
          {applications.map((application, index) => (
            <article
              className="grid gap-3 px-5 py-4 lg:grid-cols-[3rem_minmax(0,1fr)_auto] lg:items-start"
              key={application.id}
            >
              <div className="font-mono text-xs tabular-nums text-[var(--muted)]">#{String(index + 1).padStart(2, '0')}</div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{applicationTypeLabels[application.type]}</p>
                <h3 className="mt-1 text-base font-semibold leading-6">{application.subject ?? applicationTypeLabels[application.type]}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{formatRequestDate(application)}</p>
                {application.businessNotes ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{application.businessNotes}</p>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Комментариев пока нет.</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <StatusBadge variant={applicationStatusBadgeVariants[application.status]}>
                  {applicationStatusLabels[application.status]}
                </StatusBadge>
                <Button href={`/business/cabinet/requests/${application.id}`} size="sm" variant="secondary">
                  Открыть
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="px-5 py-6 text-sm leading-6 text-[var(--muted)]">{emptyDescription}</div>
      )}
    </section>
  );
}

export function NextActionPanel({
  children,
  className,
  description = 'Короткий список действий, которые помогают держать заявки в рабочем состоянии.',
  items = [],
  primaryAction,
  title = 'Следующее действие'
}: NextActionPanelProps) {
  return (
    <aside className={cn('rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-elevated)] p-5', className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
      {items.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {items.map((item, index) => (
            <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-t border-[var(--line)] pt-3 first:border-t-0 first:pt-0" key={item.label}>
              <span className="font-mono text-xs tabular-nums text-[var(--muted)]">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{item.label}</p>
                  {item.status ? (
                    <span className="rounded-[var(--radius-sm)] border border-[var(--line)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                      {item.status}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.detail}</p>
                {item.href ? (
                  <Button className="mt-3" href={item.href} size="sm" variant="secondary">
                    Перейти
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {primaryAction ? (
        <Button className="mt-5 w-full rounded-[var(--radius-md)]" href={primaryAction.href} variant="secondary">
          {primaryAction.label}
        </Button>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </aside>
  );
}
