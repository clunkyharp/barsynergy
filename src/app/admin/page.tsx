import { ApplicationStatus, BusinessAccountStatus, ContentStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Panel } from '@/components/ui/panel';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { applicationStatusLabels, applicationTypeLabels } from '@/lib/admin/application-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const quickLinks = [
  { label: 'Заявки', href: '/admin/applications' },
  { label: 'Бизнес-доступы', href: '/admin/users' },
  { label: 'Статьи', href: '/admin/articles' },
  { label: 'События', href: '/admin/events' },
  { label: 'Вакансии', href: '/admin/vacancies' },
  { label: 'Поставщики', href: '/admin/suppliers' }
];

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit'
});

export default async function AdminPage() {
  const currentUser = await requireAdminSectionAccess('dashboard');
  const [newApplications, pendingBusinessAccounts, draftArticles, draftEvents, draftVacancies, draftSuppliers, latestApplications] = await Promise.all([
    prisma.application.count({ where: { status: ApplicationStatus.NEW } }),
    prisma.businessAccount.count({ where: { status: BusinessAccountStatus.PENDING } }),
    prisma.article.count({ where: { status: ContentStatus.DRAFT } }),
    prisma.event.count({ where: { status: ContentStatus.DRAFT } }),
    prisma.vacancy.count({ where: { status: ContentStatus.DRAFT } }),
    prisma.supplier.count({ where: { status: ContentStatus.DRAFT } }),
    prisma.application.findMany({
      orderBy: [{ createdAt: 'desc' }],
      take: 4,
      select: { id: true, type: true, status: true, subject: true, createdAt: true }
    })
  ]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-12 xl:grid-flow-dense">
        <Card className="overflow-hidden xl:col-span-7">
          <div className="border-b border-black/10 px-5 py-5 md:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">BARSYNERGY / admin</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-5xl xl:text-[3.65rem]">Рабочая панель</h1>
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

        <Card className="p-5 xl:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Черновики контента</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatCard label="Статьи" value={draftArticles} />
            <StatCard label="События" value={draftEvents} />
            <StatCard label="Вакансии" value={draftVacancies} />
            <StatCard label="Поставщики" value={draftSuppliers} />
          </div>
        </Card>

        <Card className="p-5 xl:col-span-8">
          <div className="flex flex-col gap-3 border-b border-black/10 pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Последние входящие</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Новые заявки</h2>
            </div>
            <Button className="rounded-full" href="/admin/applications" variant="secondary">
              Открыть всю очередь
            </Button>
          </div>
          <div className="mt-4 grid gap-3">
            {latestApplications.length > 0 ? (
              latestApplications.map((application) => (
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
