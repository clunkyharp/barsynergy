import { getDashboardStats } from '@/lib/admin/admin-queries';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { cn } from '@/lib/utils';
import {
  AdminWorkQueue, ContentHealthTable, PublishingStatusRail,
  ModerationActionLane, KpiTile
} from '@/components/admin/dashboard-components';
import { adminRoleLabels } from '@/modules/admin/dashboard/types';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { canAccessAdminSection } from '@/lib/auth/permissions';
import { ApplicationStatus, ApplicationType, ContentStatus } from '@/modules/admin/queries';

export const dynamic = 'force-dynamic';

const ml = 'font-mono text-[10px] font-medium uppercase tracking-[0.22em]';

const sp = new Map<ApplicationStatus, number>([
  [ApplicationStatus.NEW, 1], [ApplicationStatus.IN_REVIEW, 2],
  [ApplicationStatus.PAYMENT_PENDING, 3], [ApplicationStatus.APPROVED, 4]
]);

export default async function AdminPage() {
  const u = await requireAdminSectionAccess('dashboard');
  const s = await getDashboardStats();
  const canManage = canAccessAdminSection(u.role, 'users');
  const bHref = canManage ? '/admin/users' : `/admin/applications?type=${ApplicationType.BUSINESS_ACCOUNT_REQUEST}`;

  const [nA, irA, ppA, pBA, dA, dE, dV, dS, dGS, pA, arA, pE, pV, pC, pP, pS, pGS, pSwoC, aCat, aCit, aTag, lat] = s;
  const dTotal = dA + dE + dV + dS + dGS;
  const aTotal = nA + irA + ppA;
  const prio = [...lat].sort((a: { status: string; createdAt: Date }, b: { status: string; createdAt: Date }) => (sp.get(a.status as ApplicationStatus) ?? 10) - (sp.get(b.status as ApplicationStatus) ?? 10) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);
  const dHref = dA > 0 ? '/admin/articles?status=DRAFT' : dE > 0 ? '/admin/events?status=DRAFT' : '/admin/vacancies?status=DRAFT';

  const qItems = [
    { count: nA, href: `/admin/applications?status=${ApplicationStatus.NEW}`, label: 'Новые заявки', nextStep: 'открыть запись и назначить следующий статус', owner: 'модерация' },
    { count: irA, href: `/admin/applications?status=${ApplicationStatus.IN_REVIEW}`, label: 'На проверке', nextStep: 'закрыть проверку, запросить детали или одобрить', owner: 'редакция' },
    { count: ppA, href: `/admin/applications?status=${ApplicationStatus.PAYMENT_PENDING}`, label: 'Оплата', nextStep: 'проверить ручную оплату и обновить статус', owner: 'администратор' },
    { count: pBA, href: bHref, label: 'Бизнес-доступы', nextStep: 'проверить заявку и подготовить подключение', owner: 'администратор' },
    { count: pSwoC, href: `/admin/suppliers?status=${ContentStatus.PUBLISHED}&filter=no-city`, label: 'Поставщики без города', nextStep: 'добавить город в опубликованные карточки', owner: 'каталог' },
    { count: dTotal, href: `/admin/articles?status=${ContentStatus.DRAFT}`, label: 'Черновики', nextStep: 'разобрать материалы перед публикацией', owner: 'контент' }
  ];

  const pRail = [
    { draft: dA, extra: `Архив: ${arA}`, href: `/admin/articles?status=${ContentStatus.DRAFT}`, label: 'Статьи', published: pA },
    { draft: dE, href: `/admin/events?status=${ContentStatus.DRAFT}`, label: 'События', published: pE },
    { draft: dV, href: `/admin/vacancies?status=${ContentStatus.DRAFT}`, label: 'Вакансии', published: pV },
    { draft: dS, extra: `Без города: ${pSwoC}`, href: `/admin/suppliers?status=${ContentStatus.DRAFT}`, label: 'Поставщики', published: pS },
    { draft: dGS, href: `/admin/general-sponsors?status=${ContentStatus.DRAFT}`, label: 'Генспонсоры', published: pGS }
  ];

  const cRows = [
    { area: 'Курсы', href: '/admin/courses', note: `${pC} опубл.`, status: pC > 0 ? 'публичная лента' : 'нет публикаций', variant: pC > 0 ? 'success' as const : 'neutral' as const },
    { area: 'Партнёры', href: '/admin/partners', note: `${pP} опубл.`, status: pP > 0 ? 'публичная лента' : 'нет публикаций', variant: pP > 0 ? 'success' as const : 'neutral' as const },
    { area: 'Статьи', href: '/admin/articles', note: `${pA} опубл.${arA > 0 ? ` · архив ${arA}` : ''}`, status: pA > 0 ? 'публичная лента' : arA > 0 ? 'только архив' : 'нет публикаций', variant: pA > 0 ? 'success' as const : arA > 0 ? 'warning' as const : 'neutral' as const },
    { area: 'Поставщики', href: pSwoC > 0 ? '/admin/suppliers?filter=no-city' : '/admin/suppliers', note: `${pS} опубл.`, status: pSwoC > 0 ? 'есть записи без города' : pS > 0 ? 'города заполнены' : 'нет публикаций', variant: pSwoC > 0 ? 'warning' as const : pS > 0 ? 'success' as const : 'neutral' as const },
    { area: 'Справочники', note: `${aCat}/${aCit}/${aTag}`, status: aCat > 0 && aCit > 0 && aTag > 0 ? 'база заполнена' : 'есть пустые разделы', variant: aCat > 0 && aCit > 0 && aTag > 0 ? 'success' as const : 'warning' as const }
  ];

  const cWarn = cRows.filter((r) => r.variant !== 'success').length;
  const cHref = cWarn > 0 ? cRows.find((r) => r.variant !== 'success')?.href ?? '/admin/categories' : '/admin/categories';
  const hBreak = [
    { label: 'Новые', value: nA, href: `/admin/applications?status=${ApplicationStatus.NEW}` },
    { label: 'Проверка', value: irA, href: `/admin/applications?status=${ApplicationStatus.IN_REVIEW}` },
    { label: 'Оплата', value: ppA, href: `/admin/applications?status=${ApplicationStatus.PAYMENT_PENDING}` }
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className={cn(ml, 'text-[var(--muted)]')}>BARSYNERGY / админка · рабочая очередь</p>
        <span className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <span className="font-semibold text-[var(--text)]">{u.email}</span>
          <span aria-hidden="true">·</span>
          <span>{adminRoleLabels[u.role]}</span>
        </span>
      </div>

      <div className="grid gap-3 xl:grid-cols-12">
        <Panel className="flex flex-col justify-between gap-6 overflow-hidden border-[var(--border-inverse)] bg-[var(--surface-inverse)] text-white xl:col-span-7" padding="lg" tone="inverse">
          <div className="flex items-start justify-between gap-4">
            <p className={cn(ml, 'text-[var(--editorial-dark-label)]')}>Очередь · в работе</p>
            <Button className="min-h-9 rounded-[var(--radius-pill)] px-4 py-1.5 text-xs" href="/admin/applications">Открыть заявки →</Button>
          </div>
          <div>
            <div className="font-mono text-[64px] font-semibold leading-none tracking-[-0.04em] tabular-nums md:text-[84px]">{aTotal}</div>
            <p className="mt-2 text-sm text-[var(--editorial-dark-muted)]">активных заявок в очереди модерации</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {hBreak.map((item) => (
              <AppLink className="rounded-[var(--radius-md)] border border-[var(--border-inverse-soft)] px-3 py-3 transition hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40" href={item.href} key={item.label}>
                <span className="font-mono text-2xl font-semibold tabular-nums">{item.value}</span>
                <span className={cn(ml, 'mt-1 block text-[var(--editorial-dark-muted)]')}>{item.label}</span>
              </AppLink>
            ))}
          </div>
        </Panel>

        <div className="grid gap-3 xl:col-span-5">
          <KpiTile href={bHref} label="Бизнес-доступы" note={canManage ? 'ожидают подключения' : 'на проверке'} value={pBA} />
          <KpiTile href={dHref} label="Черновики" note="перед публикацией" value={dTotal} />
          <KpiTile href={cHref} label="Проверки контента" note={cWarn > 0 ? `${cWarn} замечаний` : 'всё в норме'} tone={cWarn > 0 ? 'warning' : 'default'} value={cWarn} />
        </div>
      </div>

      <section className="grid gap-3 xl:grid-cols-12">
        <AdminWorkQueue className="xl:col-span-8" items={qItems} />
        <PublishingStatusRail className="xl:col-span-4" items={pRail} />
        <ContentHealthTable className="xl:col-span-12" rows={cRows} />
        <ModerationActionLane className="xl:col-span-12" applications={prio} />
      </section>
    </div>
  );
}
