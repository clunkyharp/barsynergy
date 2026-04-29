import { ApplicationStatus, BusinessAccountStatus, ContentStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { applicationStatusLabels, applicationTypeLabels } from '@/lib/admin/application-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

const quickLinks = [
  { label: 'Заявки', href: '/admin/applications' },
  { label: 'Бизнес-доступы', href: '/admin/users' },
  { label: 'Статьи', href: '/admin/articles' },
  { label: 'События', href: '/admin/events' }
];

export default async function AdminPage() {
  await requireAdminSectionAccess('dashboard');
  const [newApplications, pendingBusinessAccounts, draftArticles, draftEvents, latestApplications] = await Promise.all([
    prisma.application.count({ where: { status: ApplicationStatus.NEW } }),
    prisma.businessAccount.count({ where: { status: BusinessAccountStatus.PENDING } }),
    prisma.article.count({ where: { status: ContentStatus.DRAFT } }),
    prisma.event.count({ where: { status: ContentStatus.DRAFT } }),
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Приоритет</p>
            <h1 className="mt-3 text-[clamp(2.35rem,4vw,4.8rem)] font-semibold leading-[0.94] tracking-[-0.05em]">
              Сначала очередь заявок и доступов, потом контент и справочники
            </h1>
          </div>
          <div className="grid gap-0 md:grid-cols-2">
            <div className="border-b border-black/10 p-5 md:border-b-0 md:border-r">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Новые заявки</p>
              <p className="mt-3 text-5xl font-semibold tracking-[-0.06em]">{newApplications}</p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--muted)]">
                Новые запросы требуют первого решения: взять в работу, уточнить детали или перевести дальше.
              </p>
            </div>
            <div className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Ожидают доступа</p>
              <p className="mt-3 text-5xl font-semibold tracking-[-0.06em]">{pendingBusinessAccounts}</p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--muted)]">
                Проверка доступов не должна теряться внутри общего контента. Это отдельная рабочая очередь.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 xl:col-span-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Быстрые действия</p>
          <div className="mt-4 grid gap-3">
            {quickLinks.map((link) => (
              <a
                className="rounded-2xl border border-black/10 bg-[var(--surface)] px-4 py-4 text-base font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>
        </Card>

        <Card className="p-5 xl:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Черновики контента</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-black/10 bg-[var(--surface)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Статьи</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{draftArticles}</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-[var(--surface)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">События</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{draftEvents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 xl:col-span-8">
          <div className="flex flex-col gap-3 border-b border-black/10 pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Последние входящие</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Очередь, которую нужно разобрать первой</h2>
            </div>
            <Button className="rounded-full" href="/admin/applications" variant="secondary">
              Открыть всю очередь
            </Button>
          </div>
          <div className="mt-4 grid gap-3">
            {latestApplications.length > 0 ? (
              latestApplications.map((application) => (
                <div className="rounded-2xl border border-black/10 bg-[var(--surface)] px-4 py-4" key={application.id}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-[var(--muted)]">{applicationTypeLabels[application.type]}</p>
                      <p className="mt-1 text-base font-semibold">{application.subject ?? 'Заявка без названия'}</p>
                    </div>
                    <Badge variant={application.status === ApplicationStatus.NEW ? 'warning' : 'neutral'}>
                      {applicationStatusLabels[application.status]}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-black/10 bg-[var(--surface)] px-4 py-4 text-sm leading-6 text-[var(--muted)]">
                Очередь пока пуста.
              </p>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
