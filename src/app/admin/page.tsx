import { ApplicationStatus, ApplicationType, BusinessAccountStatus, ContentStatus, UserRole } from '@prisma/client';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableFrame,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow
} from '@/components/ui/data-table';
import { Panel } from '@/components/ui/panel';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/status-badge';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels,
  applicationTypeLabels
} from '@/lib/admin/application-utils';
import { contentStatusBadgeVariants, contentStatusLabels } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { canAccessAdminSection } from '@/lib/auth/permissions';
import { prisma } from '@/lib/db/prisma';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit'
});

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
  ] = await Promise.all([
    prisma.application.count({ where: { status: ApplicationStatus.NEW } }),
    prisma.application.count({ where: { status: ApplicationStatus.IN_REVIEW } }),
    prisma.application.count({ where: { status: ApplicationStatus.PAYMENT_PENDING } }),
    prisma.businessAccount.count({ where: { status: BusinessAccountStatus.PENDING } }),
    prisma.article.count({ where: { status: ContentStatus.DRAFT } }),
    prisma.event.count({ where: { status: ContentStatus.DRAFT } }),
    prisma.vacancy.count({ where: { status: ContentStatus.DRAFT } }),
    prisma.supplier.count({ where: { status: ContentStatus.DRAFT } }),
    prisma.generalSponsor.count({ where: { status: ContentStatus.DRAFT } }),
    prisma.article.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.article.count({ where: { status: ContentStatus.ARCHIVED } }),
    prisma.event.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.vacancy.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.course.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.partner.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.supplier.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.generalSponsor.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.supplier.count({ where: { status: ContentStatus.PUBLISHED, cityId: null } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.city.count({ where: { isActive: true } }),
    prisma.tag.count({ where: { isActive: true } }),
    prisma.application.findMany({
      where: {
        status: {
          in: [
            ApplicationStatus.NEW,
            ApplicationStatus.IN_REVIEW,
            ApplicationStatus.PAYMENT_PENDING,
            ApplicationStatus.APPROVED
          ]
        }
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 8,
      select: { id: true, type: true, status: true, subject: true, name: true, createdAt: true }
    })
  ]);
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
      href: `/admin/suppliers?status=${ContentStatus.PUBLISHED}`,
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
      note: `Опубликовано: ${publishedCourses}`,
      status: publishedCourses > 0 ? 'есть публикации' : 'нет опубликованных курсов',
      variant: publishedCourses > 0 ? 'success' : 'warning'
    },
    {
      area: 'Партнёры',
      href: '/admin/partners',
      note: `Опубликовано: ${publishedPartners}`,
      status: publishedPartners > 0 ? 'есть публикации' : 'нет опубликованных партнёров',
      variant: publishedPartners > 0 ? 'success' : 'warning'
    },
    {
      area: 'Статьи',
      href: '/admin/articles',
      note: `Опубликовано: ${publishedArticles}, архив: ${archivedArticles}`,
      status: publishedArticles === 0 && archivedArticles > 0 ? 'только архив' : 'публичная лента',
      variant: publishedArticles === 0 && archivedArticles > 0 ? 'warning' : 'success'
    },
    {
      area: 'Поставщики',
      href: '/admin/suppliers',
      note: `Опубликовано: ${publishedSuppliers}`,
      status: publishedSuppliersWithoutCity > 0 ? 'есть записи без города' : 'города заполнены',
      variant: publishedSuppliersWithoutCity > 0 ? 'warning' : 'success'
    },
    {
      area: 'Справочники',
      href: taxonomyHref,
      note: `Категории: ${activeCategories}, города: ${activeCities}, теги: ${activeTags}`,
      status: activeCategories > 0 && activeCities > 0 && activeTags > 0 ? 'база заполнена' : 'есть пустые разделы',
      variant: activeCategories > 0 && activeCities > 0 && activeTags > 0 ? 'success' : 'warning'
    }
  ];
  const contentWarningCount = contentHealthRows.filter((row) => row.variant !== 'success').length;

  return (
    <div className="space-y-5">
      <Panel className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end" padding="lg" tone="elevated">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">BARSYNERGY / админка</p>
          <h1 className={`${displayFont.className} mt-3 text-[2.4rem] font-semibold leading-none tracking-normal md:text-[3.1rem]`}>
            Рабочая очередь
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Входящие заявки, публикации и проверки контента в одном коротком списке действий.
          </p>
        </div>
        <div className="text-sm leading-6 text-[var(--muted)] md:text-right">
          <p className="font-semibold text-[var(--text)]">{currentUser.email}</p>
          <p>роль: {adminRoleLabels[currentUser.role]}</p>
        </div>
      </Panel>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          delta={`${newApplications} новых`}
          label="Заявки в работе"
          status="модерация"
          value={activeApplicationTotal}
        />
        <StatCard
          delta={`${pendingBusinessAccounts} ждут`}
          label="Бизнес-доступы"
          status={canManageUsers ? 'админ' : 'просмотр'}
          value={pendingBusinessAccounts}
        />
        <StatCard
          delta={`${draftArticles + draftEvents + draftVacancies} материалов`}
          label="Черновики"
          status="публикация"
          value={draftContentTotal}
        />
        <StatCard
          delta={contentWarningCount > 0 ? 'проверить' : 'чисто'}
          label="Проверки контента"
          status="контроль"
          value={contentWarningCount}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-12">
        <AdminWorkQueue className="xl:col-span-8" items={queueItems} />
        <PublishingStatusRail className="xl:col-span-4" items={publishingRailItems} />
        <ContentHealthTable className="xl:col-span-7" rows={contentHealthRows} />
        <ModerationActionLane className="xl:col-span-5" applications={prioritizedApplications} />
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
        <div className="hidden grid-cols-[minmax(7rem,1fr)_3.5rem_6rem_minmax(8rem,1fr)_5rem] gap-4 border-b border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)] md:grid">
          <span>Участок</span>
          <span>Кол-во</span>
          <span>Ведёт</span>
          <span>Следующий шаг</span>
          <span className="text-right">Действие</span>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {items.map((item) => (
            <div
              className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(7rem,1fr)_3.5rem_6rem_minmax(8rem,1fr)_5rem] md:items-center md:gap-4"
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
                variant={item.count > 0 ? 'primary' : 'secondary'}
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
      <SectionHeader eyebrow="Контроль контента" title="Состояние разделов" />
      <div className="divide-y divide-[var(--line)] border-t border-[var(--line)] md:hidden">
        {rows.map((row) => (
          <div className="grid gap-3 px-4 py-4" key={row.area}>
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold">{row.area}</p>
              <StatusBadge variant={row.variant}>{row.status}</StatusBadge>
            </div>
            <p className="text-sm leading-6 text-[var(--muted)]">{row.note}</p>
            {row.href ? (
              <Button className="min-h-9 w-full px-3 py-1.5 text-xs" href={row.href} variant="secondary">
                Открыть
              </Button>
            ) : (
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">нет доступа</span>
            )}
          </div>
        ))}
      </div>
      <DataTableFrame className="hidden rounded-none border-0 border-t md:block">
        <DataTable className="table-fixed" minWidth="100%">
          <DataTableHead>
            <tr>
              <DataTableHeaderCell className="w-[22%]">Раздел</DataTableHeaderCell>
              <DataTableHeaderCell className="w-[30%]">Статус</DataTableHeaderCell>
              <DataTableHeaderCell className="w-[30%]">Данные</DataTableHeaderCell>
              <DataTableHeaderCell className="w-[18%] text-right">Действие</DataTableHeaderCell>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {rows.map((row) => (
              <DataTableRow key={row.area}>
                <DataTableCell className="font-semibold">{row.area}</DataTableCell>
                <DataTableCell>
                  <StatusBadge variant={row.variant}>{row.status}</StatusBadge>
                </DataTableCell>
                <DataTableCell className="text-[var(--muted)]">{row.note}</DataTableCell>
                <DataTableCell className="text-right">
                  {row.href ? (
                    <Button className="min-h-9 px-3 py-1.5 text-xs" href={row.href} variant="secondary">
                      Открыть
                    </Button>
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">нет доступа</span>
                  )}
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </DataTableFrame>
    </Card>
  );
}

function PublishingStatusRail({ className, items }: { className?: string; items: PublishingRailItem[] }) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Статус разделов</p>
          <h2 className="mt-2 text-lg font-semibold">Публикация</h2>
        </div>
        <StatusBadge variant={items.some((item) => item.draft > 0) ? 'pending' : 'success'}>
          {items.some((item) => item.draft > 0) ? 'есть черновики' : 'чисто'}
        </StatusBadge>
      </div>
      <div className="mt-5 divide-y divide-[var(--line)]">
        {items.map((item) => (
          <AppLink
            className="grid gap-3 py-3 transition hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            href={item.href}
            key={item.label}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-[var(--text)]">{item.label}</span>
              <span className="text-sm text-[var(--muted)]">{item.extra ?? ' '}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <MetricPill label={contentStatusLabels[ContentStatus.DRAFT]} value={item.draft} variant={contentStatusBadgeVariants[ContentStatus.DRAFT]} />
              <MetricPill
                label={contentStatusLabels[ContentStatus.PUBLISHED]}
                value={item.published}
                variant={contentStatusBadgeVariants[ContentStatus.PUBLISHED]}
              />
            </div>
          </AppLink>
        ))}
      </div>
    </Card>
  );
}

function ModerationActionLane({ applications, className }: { applications: DashboardApplication[]; className?: string }) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex flex-col gap-3 border-b border-[var(--line)] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Модерация</p>
          <h2 className="mt-2 text-lg font-semibold">Последние заявки</h2>
        </div>
        <Button className="min-h-9 px-3 py-1.5 text-xs" href="/admin/applications" variant="secondary">
          Вся очередь
        </Button>
      </div>
      <div className="mt-4 grid gap-3">
        {applications.length > 0 ? (
          applications.map((application) => (
            <div className="border-b border-[var(--line)] pb-3 last:border-0 last:pb-0" key={application.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                  {applicationTypeLabels[application.type]} / {dateFormatter.format(application.createdAt)}
                </span>
                <StatusBadge variant={applicationStatusBadgeVariants[application.status]}>
                  {applicationStatusLabels[application.status]}
                </StatusBadge>
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <p className="text-sm font-semibold leading-6">
                  {application.subject?.trim() || application.name?.trim() || 'Заявка без названия'}
                </p>
                <Button className="min-h-9 px-3 py-1.5 text-xs" href={`/admin/applications/${application.id}`} variant="secondary">
                  Открыть
                </Button>
              </div>
            </div>
          ))
        ) : (
          <Panel className="text-sm leading-6 text-[var(--muted)]" padding="sm">
            Очередь модерации пуста.
          </Panel>
        )}
      </div>
    </Card>
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{eyebrow}</p>
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

function MetricPill({
  label,
  value,
  variant
}: {
  label: string;
  value: number;
  variant: StatusBadgeVariant;
}) {
  return (
    <span className="grid rounded-[var(--radius-md)] border border-[var(--line)] px-3 py-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</span>
      <span className="mt-1 flex items-center justify-between gap-2">
        <span className="text-lg font-semibold text-[var(--text)]">{value}</span>
        <StatusBadge className="px-2 py-0.5 text-[10px]" variant={variant}>
          {value > 0 ? 'есть' : '0'}
        </StatusBadge>
      </span>
    </span>
  );
}
