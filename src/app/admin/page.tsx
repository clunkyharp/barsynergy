import { ApplicationStatus, BusinessAccountStatus, ContentStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Panel } from '@/components/ui/panel';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { applicationStatusLabels, applicationTypeLabels } from '@/lib/admin/application-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';
import { displayFont } from '@/lib/fonts';

export const dynamic = 'force-dynamic';

const quickLinks = [
  { label: 'Новые заявки', href: `/admin/applications?status=${ApplicationStatus.NEW}` },
  { label: 'На проверке', href: `/admin/applications?status=${ApplicationStatus.IN_REVIEW}` },
  { label: 'Ожидают оплаты', href: `/admin/applications?status=${ApplicationStatus.PAYMENT_PENDING}` },
  { label: 'Бизнес-доступы', href: '/admin/users' },
  { label: 'Черновики статей', href: `/admin/articles?status=${ContentStatus.DRAFT}` },
  { label: 'Черновики событий', href: `/admin/events?status=${ContentStatus.DRAFT}` },
  { label: 'Поставщики без города', href: `/admin/suppliers?status=${ContentStatus.PUBLISHED}` },
  { label: 'Генспонсоры', href: '/admin/general-sponsors' }
];

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit'
});

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
    publishedCourses,
    publishedPartners,
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
    prisma.course.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.partner.count({ where: { status: ContentStatus.PUBLISHED } }),
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
      select: { id: true, type: true, status: true, subject: true, createdAt: true }
    })
  ]);
  const statusPriority = new Map<ApplicationStatus, number>([
    [ApplicationStatus.NEW, 1],
    [ApplicationStatus.IN_REVIEW, 2],
    [ApplicationStatus.PAYMENT_PENDING, 3],
    [ApplicationStatus.APPROVED, 4]
  ]);
  const prioritizedApplications = latestApplications
    .sort((a, b) => (statusPriority.get(a.status) ?? 10) - (statusPriority.get(b.status) ?? 10) || b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  const draftContentTotal = draftArticles + draftEvents + draftVacancies + draftSuppliers + draftGeneralSponsors;
  const actionQueue = [
    { count: newApplications, label: 'новые заявки', href: `/admin/applications?status=${ApplicationStatus.NEW}` },
    { count: inReviewApplications, label: 'заявки на проверке', href: `/admin/applications?status=${ApplicationStatus.IN_REVIEW}` },
    { count: paymentPendingApplications, label: 'ожидают оплаты', href: `/admin/applications?status=${ApplicationStatus.PAYMENT_PENDING}` },
    { count: pendingBusinessAccounts, label: 'бизнес-доступы ждут активации', href: '/admin/users' },
    { count: publishedSuppliersWithoutCity, label: 'опубликованные поставщики без города', href: `/admin/suppliers?status=${ContentStatus.PUBLISHED}` },
    { count: draftContentTotal, label: 'черновики контента', href: `/admin/articles?status=${ContentStatus.DRAFT}` }
  ].filter((item) => item.count > 0);
  const healthIssues = [
    publishedCourses === 0 ? { label: 'Нет опубликованных курсов', href: '/admin/courses' } : null,
    publishedPartners === 0 ? { label: 'Нет опубликованных партнёров', href: '/admin/partners' } : null,
    publishedArticles === 0 && archivedArticles > 0 ? { label: 'Статьи есть только в архиве', href: '/admin/articles' } : null,
    activeCategories === 0 ? { label: 'Нет активных категорий', href: '/admin/categories' } : null,
    activeCities === 0 ? { label: 'Нет активных городов', href: '/admin/cities' } : null,
    activeTags === 0 ? { label: 'Нет активных тегов', href: '/admin/tags' } : null
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-12 xl:grid-flow-dense">
        <Card className="overflow-hidden xl:col-span-7">
          <div className="border-b border-black/10 px-5 py-5 md:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">BARSYNERGY / admin</p>
            <h1 className={`${displayFont.className} mt-3 text-[3rem] font-semibold leading-none tracking-normal md:text-[4.2rem]`}>Рабочая панель</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{currentUser.email}</p>
          </div>
          <div className="grid gap-0 md:grid-cols-2">
            <StatCard
              className="rounded-none border-0 border-b border-black/10 shadow-none md:border-b-0 md:border-r"
              label="Новые заявки"
              value={newApplications}
            />
            <StatCard
              className="rounded-none border-0 shadow-none"
              label="Ожидают доступа"
              value={pendingBusinessAccounts}
            />
          </div>
        </Card>

        <Card className="p-5 xl:col-span-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Быстрые действия</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Button className="justify-between rounded-[var(--radius-lg)] px-4 py-4 text-base normal-case tracking-normal" href={link.href} key={link.href} variant="secondary">
                {link.label}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-5 xl:col-span-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Требует действия</p>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <StatCard label="Новые" value={newApplications} />
            <StatCard label="На проверке" value={inReviewApplications} />
            <StatCard label="Ожидают оплаты" value={paymentPendingApplications} />
            <StatCard label="Ожидают доступа" value={pendingBusinessAccounts} />
          </div>
          <div className="mt-5 grid gap-2">
            {actionQueue.length > 0 ? (
              actionQueue.map((item) => (
                <Button
                  className="justify-between rounded-[var(--radius-md)] px-4 py-3 text-left text-sm normal-case tracking-normal"
                  href={item.href}
                  key={item.label}
                  variant="secondary"
                >
                  <span>{item.label}</span>
                  <span>{item.count}</span>
                </Button>
              ))
            ) : (
              <Panel className="text-sm text-[var(--muted)]" padding="sm">
                Очередь действий пуста.
              </Panel>
            )}
          </div>
        </Card>

        <Card className="p-5 xl:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Черновики контента</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatCard label="Статьи" value={draftArticles} />
            <StatCard label="События" value={draftEvents} />
            <StatCard label="Вакансии" value={draftVacancies} />
            <StatCard label="Поставщики" value={draftSuppliers} />
            <StatCard label="Генспонсоры" value={draftGeneralSponsors} />
          </div>
        </Card>

        <Card className="p-5 xl:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Проверки CMS</p>
          <div className="mt-4 grid gap-2">
            {healthIssues.length > 0 ? (
              healthIssues.map((issue) => (
                <Button
                  className="justify-between rounded-[var(--radius-md)] px-4 py-3 text-left text-sm normal-case tracking-normal"
                  href={issue.href}
                  key={issue.label}
                  variant="secondary"
                >
                  {issue.label}
                </Button>
              ))
            ) : (
              <Panel className="text-sm text-[var(--muted)]" padding="sm">
                Критичных пустых блоков не найдено.
              </Panel>
            )}
          </div>
        </Card>

        <Card className="p-5 xl:col-span-8">
          <div className="flex flex-col gap-3 border-b border-black/10 pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Последние входящие</p>
              <h2 className={`${displayFont.className} mt-3 text-[2rem] font-semibold leading-none tracking-normal`}>Новые заявки</h2>
            </div>
            <Button className="rounded-[var(--radius-md)]" href="/admin/applications" variant="secondary">
              Открыть всю очередь
            </Button>
          </div>
          <div className="mt-4 grid gap-3">
            {prioritizedApplications.length > 0 ? (
              prioritizedApplications.map((application) => (
                <Panel key={application.id} padding="sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-[var(--muted)]">
                        {applicationTypeLabels[application.type]} / {dateFormatter.format(application.createdAt)}
                      </p>
                      <p className="mt-1 text-base font-semibold">{application.subject ?? 'Заявка без названия'}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge variant={application.status === ApplicationStatus.NEW ? 'pending' : 'neutral'}>
                        {applicationStatusLabels[application.status]}
                      </StatusBadge>
                      <Button href={`/admin/applications/${application.id}`} size="sm" variant="secondary">
                        Открыть
                      </Button>
                    </div>
                  </div>
                </Panel>
              ))
            ) : (
              <Panel className="text-sm leading-6 text-[var(--muted)]" padding="sm">
                Очередь пока пуста.
              </Panel>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
