import { ApplicationStatus, ApplicationType, ContentStatus, UserRole } from '@/modules/admin/queries';
import { getDashboardStats } from '@/lib/admin/admin-queries';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Panel } from '@/components/ui/panel';
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/status-badge';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels,
  applicationTypeLabels
} from '@/lib/admin/application-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { canAccessAdminSection } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit'
});

// Techno-editorial micro-label: mono, uppercase, wide tracking (see docs/ui-references.md).
const microLabel = 'font-mono text-[10px] font-medium uppercase tracking-[0.22em]';

const adminRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'администратор',
  [UserRole.MODERATOR]: 'модератор',
  [UserRole.BUSINESS]: 'бизнес',
  [UserRole.USER]: 'участник'
};

type QueueItem = {
  label: string;
  count: number;
  owner: string;
  href: string;
  nextStep: string;
};

type PublishingRailItem = {
  label: string;
  href: string;
  draft: number;
  published: number;
  extra?: string;
};

type HealthRow = {
  area: string;
  status: string;
  note: string;
  href?: string;
  variant: StatusBadgeVariant;
};

type DashboardApplication = {
  id: string;
  type: ApplicationType;
  status: ApplicationStatus;
  subject: string | null;
  name: string | null;
  createdAt: Date;
};

export default async function AdminPage() {
  const currentUser = await requireAdminSectionAccess('dashboard');
  const [
    newApplications,
    inReviewApplications,
    paymentPendingApplications,
    pendingBusinessAccounts,
    draftArticles,
    draftEvents,
    draftVacancies,
    draftSuppliers,
    draftGeneralSponsors,
    publishedArticles,
    archivedArticles,
    publishedEvents,
    publishedVacancies,
    publishedCourses,
    publishedPartners,
    publishedSuppliers,
    publishedGeneralSponsors,
    publishedSuppliersWithoutCity,
    activeCategories,
    activeCities,
    activeTags,
    latestApplications
  ] = await getDashboardStats();
  const canManageUsers = canAccessAdminSection(currentUser.role, 'users');
  const businessAccessHref = canManageUsers
    ? '/admin/users'
    : `/admin/applications?type=${ApplicationType.BUSINESS_ACCOUNT_REQUEST}`;
  const taxonomyHref = canAccessAdminSection(currentUser.role, 'categories') ? '/admin/categories' : undefined;
  const statusPriority = new Map<ApplicationStatus, number>([
    [ApplicationStatus.NEW, 1],
    [ApplicationStatus.IN_REVIEW, 2],
    [ApplicationStatus.PAYMENT_PENDING, 3],
    [ApplicationStatus.APPROVED, 4]
  ]);
  const prioritizedApplications = latestApplications
    .sort((a, b) => (statusPriority.get(a.status) ?? 10) - (statusPriority.get(b.status) ?? 10) || b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);
  const draftContentTotal = draftArticles + draftEvents + draftVacancies + draftSuppliers + draftGeneralSponsors;
  const activeApplicationTotal = newApplications + inReviewApplications + paymentPendingApplications;
  const queueItems: QueueItem[] = [
    {
      count: newApplications,
      href: `/admin/applications?status=${ApplicationStatus.NEW}`,
      label: 'Новые заявки',
      nextStep: 'открыть запись и назначить следующий статус',
      owner: 'модерация'
    },
    {
      count: inReviewApplications,
      href: `/admin/applications?status=${ApplicationStatus.IN_REVIEW}`,
      label: 'На проверке',
      nextStep: 'закрыть проверку, запросить детали или одобрить',
      owner: 'редакция'
    },
    {
      count: paymentPendingApplications,
      href: `/admin/applications?status=${ApplicationStatus.PAYMENT_PENDING}`,
      label: 'Оплата',
      nextStep: 'проверить ручную оплату и обновить статус',
      owner: 'администратор'
    },
    {
      count: pendingBusinessAccounts,
      href: businessAccessHref,
      label: 'Бизнес-доступы',
      nextStep: 'проверить заявку и подготовить подключение',
      owner: canManageUsers ? 'администратор' : 'модерация'
    },
    {
      count: publishedSuppliersWithoutCity,
      href: `/admin/suppliers?status=${ContentStatus.PUBLISHED}&filter=no-city`,
      label: 'Поставщики без города',
      nextStep: 'добавить город в опубликованные карточки',
      owner: 'каталог'
    },
    {
      count: draftContentTotal,
      href: `/admin/articles?status=${ContentStatus.DRAFT}`,
      label: 'Черновики',
      nextStep: 'разобрать материалы перед публикацией',
      owner: 'контент'
    }
  ];
  const publishingRailItems: PublishingRailItem[] = [
    {
      draft: draftArticles,
      extra: `Архив: ${archivedArticles}`,
      href: `/admin/articles?status=${ContentStatus.DRAFT}`,
      label: 'Статьи',
      published: publishedArticles
    },
    {
      draft: draftEvents,
      href: `/admin/events?status=${ContentStatus.DRAFT}`,
      label: 'События',
      published: publishedEvents
    },
    {
      draft: draftVacancies,
      href: `/admin/vacancies?status=${ContentStatus.DRAFT}`,
      label: 'Вакансии',
      published: publishedVacancies
    },
    {
      draft: draftSuppliers,
      extra: `Без города: ${publishedSuppliersWithoutCity}`,
      href: `/admin/suppliers?status=${ContentStatus.DRAFT}`,
      label: 'Поставщики',
      published: publishedSuppliers
    },
    {
      draft: draftGeneralSponsors,
      href: `/admin/general-sponsors?status=${ContentStatus.DRAFT}`,
      label: 'Генспонсоры',
      published: publishedGeneralSponsors
    }
  ];
  const contentHealthRows: HealthRow[] = [
    {
      area: 'Курсы',
      href: '/admin/courses',
      note: `${publishedCourses} опубл.`,
      status: publishedCourses > 0 ? 'публичная лента' : 'нет публикаций',
      variant: publishedCourses > 0 ? 'success' : 'neutral'
    },
    {
      area: 'Партнёры',
      href: '/admin/partners',
      note: `${publishedPartners} опубл.`,
      status: publishedPartners > 0 ? 'публичная лента' : 'нет публикаций',
      variant: publishedPartners > 0 ? 'success' : 'neutral'
    },
    {
      area: 'Статьи',
      href: '/admin/articles',
      note: `${publishedArticles} опубл.${archivedArticles > 0 ? ` · архив ${archivedArticles}` : ''}`,
      status: publishedArticles > 0 ? 'публичная лента' : archivedArticles > 0 ? 'только архив' : 'нет публикаций',
      variant: publishedArticles > 0 ? 'success' : archivedArticles > 0 ? 'warning' : 'neutral'
    },
    {
      area: 'Поставщики',
      href: publishedSuppliersWithoutCity > 0 ? '/admin/suppliers?filter=no-city' : '/admin/suppliers',
      note: `${publishedSuppliers} опубл.`,
      status: publishedSuppliersWithoutCity > 0 ? 'есть записи без города' : publishedSuppliers > 0 ? 'города заполнены' : 'нет публикаций',
      variant: publishedSuppliersWithoutCity > 0 ? 'warning' : publishedSuppliers > 0 ? 'success' : 'neutral'
    },
    {
      area: 'Справочники',
      href: taxonomyHref,
      note: `${activeCategories}/${activeCities}/${activeTags}`,
      status: activeCategories > 0 && activeCities > 0 && activeTags > 0 ? 'база заполнена' : 'есть пустые разделы',
      variant: activeCategories > 0 && activeCities > 0 && activeTags > 0 ? 'success' : 'warning'
    }
  ];
  const contentWarningCount = contentHealthRows.filter((row) => row.variant !== 'success').length;

  const heroBreakdown = [
    { label: 'Новые', value: newApplications, href: `/admin/applications?status=${ApplicationStatus.NEW}` },
    { label: 'Проверка', value: inReviewApplications, href: `/admin/applications?status=${ApplicationStatus.IN_REVIEW}` },
    { label: 'Оплата', value: paymentPendingApplications, href: `/admin/applications?status=${ApplicationStatus.PAYMENT_PENDING}` }
  ];
  const checksHref =
    contentWarningCount > 0 ? contentHealthRows.find((row) => row.variant !== 'success')?.href ?? '/admin/categories' : '/admin/categories';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className={cn(microLabel, 'text-[var(--muted)]')}>BARSYNERGY / админка · рабочая очередь</p>
        <span className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <span className="font-semibold text-[var(--text)]">{currentUser.email}</span>
          <span aria-hidden="true">·</span>
          <span>{adminRoleLabels[currentUser.role]}</span>
        </span>
      </div>

      <div className="grid gap-3 xl:grid-cols-12">
        {/* Hero KPI — dark command tile */}
        <Panel
          className="flex flex-col justify-between gap-6 overflow-hidden border-[var(--border-inverse)] bg-[var(--surface-inverse)] text-white xl:col-span-7"
          padding="lg"
          tone="inverse"
        >
          <div className="flex items-start justify-between gap-4">
            <p className={cn(microLabel, 'text-[var(--editorial-dark-label)]')}>Очередь · в работе</p>
            <Button className="min-h-9 rounded-[var(--radius-pill)] px-4 py-1.5 text-xs" href="/admin/applications">
              Открыть заявки →
            </Button>
          </div>
          <div>
            <div className="font-mono text-[64px] font-semibold leading-none tracking-[-0.04em] tabular-nums md:text-[84px]">
              {activeApplicationTotal}
            </div>
            <p className="mt-2 text-sm text-[var(--editorial-dark-muted)]">активных заявок в очереди модерации</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {heroBreakdown.map((item) => (
              <AppLink
                className="rounded-[var(--radius-md)] border border-[var(--border-inverse-soft)] px-3 py-3 transition hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
                href={item.href}
                key={item.label}
              >
                <span className="font-mono text-2xl font-semibold tabular-nums">{item.value}</span>
                <span className={cn(microLabel, 'mt-1 block text-[var(--editorial-dark-muted)]')}>{item.label}</span>
              </AppLink>
            ))}
          </div>
        </Panel>

        {/* Right KPI stack */}
        <div className="grid gap-3 xl:col-span-5">
          <KpiTile
            href={businessAccessHref}
            label="Бизнес-доступы"
            note={canManageUsers ? 'ожидают подключения' : 'на проверке'}
            value={pendingBusinessAccounts}
          />
          <KpiTile
            href={draftArticles > 0 ? '/admin/articles?status=DRAFT' : draftEvents > 0 ? '/admin/events?status=DRAFT' : '/admin/vacancies?status=DRAFT'}
            label="Черновики"
            note="перед публикацией"
            value={draftContentTotal}
          />
          <KpiTile
            href={checksHref}
            label="Проверки контента"
            note={contentWarningCount > 0 ? `${contentWarningCount} замечаний` : 'всё в норме'}
            tone={contentWarningCount > 0 ? 'warning' : 'default'}
            value={contentWarningCount}
          />
        </div>
      </div>

      <section className="grid gap-3 xl:grid-cols-12">
        <AdminWorkQueue className="xl:col-span-8" items={queueItems} />
        <PublishingStatusRail className="xl:col-span-4" items={publishingRailItems} />
        <ContentHealthTable className="xl:col-span-12" rows={contentHealthRows} />
        <ModerationActionLane className="xl:col-span-12" applications={prioritizedApplications} />
      </section>
    </div>
  );
}

function AdminWorkQueue({ className, items }: { className?: string; items: QueueItem[] }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <SectionHeader
        actionHref="/admin/applications"
        actionLabel="Открыть заявки"
        eyebrow="Очередь"
        title="Очередь действий"
      />
      <div className="border-t border-[var(--line)]">
        <div className="hidden grid-cols-[minmax(7rem,1fr)_4.75rem_6rem_minmax(8rem,1fr)_5rem] gap-4 border-b border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--muted)] md:grid">
          <span className="whitespace-nowrap">Участок</span>
          <span className="whitespace-nowrap">Кол-во</span>
          <span className="whitespace-nowrap">Ведёт</span>
          <span className="whitespace-nowrap">Следующий шаг</span>
          <span className="whitespace-nowrap text-right">Действие</span>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {items.map((item) => (
            <div
              className={cn(
                'grid gap-3 px-4 py-4 md:grid-cols-[minmax(7rem,1fr)_4.75rem_6rem_minmax(8rem,1fr)_5rem] md:items-center md:gap-4',
                item.count === 0 && 'opacity-50'
              )}
              key={item.label}
            >
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-[var(--muted)] md:hidden">ответственный: {item.owner}</p>
              </div>
              <div className="flex items-baseline gap-2 md:block">
                <span className="text-lg font-semibold">{item.count}</span>
                <span className="text-xs text-[var(--muted)] md:hidden">в очереди</span>
              </div>
              <div className="hidden text-sm text-[var(--muted)] md:block">{item.owner}</div>
              <p className={cn('text-sm leading-6', item.count > 0 ? 'font-medium' : 'text-[var(--muted)]')}>
                {item.count > 0 ? item.nextStep : 'действий нет'}
              </p>
              <Button
                className="min-h-9 w-full px-2 py-1.5 text-xs md:w-auto"
                href={item.href}
                variant="secondary"
              >
                Перейти
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function ContentHealthTable({ className, rows }: { className?: string; rows: HealthRow[] }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex flex-col gap-3 border-b border-[var(--line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--accent)]">Контроль контента</p>
        <StatusBadge variant={rows.some((row) => row.variant !== 'success') ? 'warning' : 'success'}>
          {rows.some((row) => row.variant !== 'success') ? 'нужна проверка' : 'в норме'}
        </StatusBadge>
      </div>
      <ul className="divide-y divide-[var(--line)]">
        {rows.map((row) => (
          <li key={row.area}>
            {row.href ? (
              <AppLink
                className="grid gap-2 px-5 py-3 text-sm transition hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)] sm:grid-cols-[minmax(7rem,1fr)_minmax(12rem,1.4fr)_auto_auto] sm:items-center sm:gap-4"
                href={row.href}
              >
                <HealthRowContent row={row} />
              </AppLink>
            ) : (
              <div className="grid gap-2 px-5 py-3 text-sm opacity-60 sm:grid-cols-[minmax(7rem,1fr)_minmax(12rem,1.4fr)_auto_auto] sm:items-center sm:gap-4">
                <HealthRowContent row={row} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function PublishingStatusRail({ className, items }: { className?: string; items: PublishingRailItem[] }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--accent)]">Статус разделов</p>
        <StatusBadge variant={items.some((item) => item.draft > 0) ? 'pending' : 'success'}>
          {items.some((item) => item.draft > 0) ? 'есть черновики' : 'чисто'}
        </StatusBadge>
      </div>
      <div className="divide-y divide-[var(--line)]">
        {items.map((item) => (
          <AppLink
            className="grid gap-2 px-5 py-3 text-sm transition hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)]"
            href={item.href}
            key={item.label}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-[var(--text)]">{item.label}</span>
              {item.extra ? <span className="text-xs text-[var(--muted)]">{item.extra}</span> : null}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)]">
              <span className={cn(item.draft > 0 ? 'font-semibold text-[var(--warning-text)]' : 'text-[var(--muted)]')}>
                {item.draft} {pluralizeRu(item.draft, ['черновик', 'черновика', 'черновиков'])}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-[var(--text)]">
                {item.published} {pluralizeRu(item.published, ['опубликован', 'опубликовано', 'опубликовано'])}
              </span>
              <span aria-hidden="true" className="ml-auto text-[var(--muted)]">
                →
              </span>
            </div>
          </AppLink>
        ))}
      </div>
    </Card>
  );
}

function ModerationActionLane({ applications, className }: { applications: DashboardApplication[]; className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex flex-col gap-3 border-b border-[var(--line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--accent)]">Модерация</p>
        <Button className="min-h-9 px-3 py-1.5 text-xs" href="/admin/applications" variant="secondary">
          Вся очередь
        </Button>
      </div>
      <div className="divide-y divide-[var(--line)]">
        {applications.length > 0 ? (
          applications.map((application) => (
            <AppLink
              className="grid gap-2 px-5 py-3 text-sm transition hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)] lg:grid-cols-[23rem_10rem_minmax(0,1fr)_1rem] lg:items-center lg:gap-4"
              href={`/admin/applications/${application.id}`}
              key={application.id}
            >
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--muted)] lg:whitespace-nowrap">
                {applicationTypeLabels[application.type]} · {dateFormatter.format(application.createdAt)}
              </span>
              <StatusBadge className="w-fit self-start lg:self-center" variant={applicationStatusBadgeVariants[application.status]}>
                {applicationStatusLabels[application.status]}
              </StatusBadge>
              <span className="min-w-0 font-semibold leading-6 text-[var(--text)]">
                {application.subject?.trim() || application.name?.trim() || 'Заявка без названия'}
              </span>
              <span aria-hidden="true" className="hidden text-[var(--muted)] lg:block">
                →
              </span>
            </AppLink>
          ))
        ) : (
          <Panel className="m-5 text-sm leading-6 text-[var(--muted)]" padding="sm">
            Очередь модерации пуста.
          </Panel>
        )}
      </div>
    </Card>
  );
}

function HealthRowContent({ row }: { row: HealthRow }) {
  return (
    <>
      <span className="font-semibold text-[var(--text)]">{row.area}</span>
      <span className="flex items-center gap-2 text-[var(--muted)]">
        <span
          aria-hidden="true"
          className={cn(
            'h-2 w-2 shrink-0 rounded-full',
            row.variant === 'success' && 'bg-[var(--success-text)]',
            row.variant === 'warning' && 'bg-[var(--warning-text)]',
            row.variant === 'danger' && 'bg-[var(--danger-text)]',
            row.variant !== 'success' && row.variant !== 'warning' && row.variant !== 'danger' && 'bg-[var(--muted)]'
          )}
        />
        <span>{row.status}</span>
      </span>
      <span className="text-[var(--muted)] sm:text-right">{row.note}</span>
      <span aria-hidden="true" className="hidden text-[var(--muted)] sm:block">
        →
      </span>
    </>
  );
}

function SectionHeader({
  actionHref,
  actionLabel,
  eyebrow,
  title
}: {
  actionHref?: string;
  actionLabel?: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-end">
      <div>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--accent)]">{eyebrow}</p>
        <h2 className="mt-2 text-lg font-semibold">{title}</h2>
      </div>
      {actionHref && actionLabel ? (
        <Button className="min-h-9 px-3 py-1.5 text-xs" href={actionHref} variant="secondary">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

function KpiTile({
  href,
  label,
  value,
  note,
  tone = 'default'
}: {
  href: string;
  label: string;
  value: number;
  note: string;
  tone?: 'default' | 'warning';
}) {
  return (
    <AppLink
      className="block rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
      href={href}
    >
      <Card
        className={cn(
          'flex h-full items-center justify-between gap-4 px-5 py-4',
          tone === 'warning' && 'border-[var(--warning-border)] bg-[var(--warning-bg)]'
        )}
        elevation="raised"
        interactive
      >
        <div className="min-w-0">
          <p className={cn(microLabel, 'text-[var(--muted)]')}>{label}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{note}</p>
        </div>
        <span className="font-mono text-[34px] font-semibold leading-none tabular-nums text-[var(--text)]">{value}</span>
      </Card>
    </AppLink>
  );
}

function pluralizeRu(value: number, forms: [string, string, string]) {
  const absValue = Math.abs(value);
  const mod10 = absValue % 10;
  const mod100 = absValue % 100;

  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];

  return forms[2];
}
