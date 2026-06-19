import type { Metadata } from 'next';
import { ArrowRight, Building2, FileText, PartyPopper, Users } from 'lucide-react';
import { AdminActionAlert } from '@/components/admin/content-admin-controls';
import {
  BusinessProfileSummary,
  NextActionPanel,
  RequestLedger
} from '@/components/business/business-cabinet';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { getBusinessDashboardData } from '@/modules/business/queries';

type BusinessDashboardPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

const PROFILE_READY_ACTION_GRACE_MS = 7 * 24 * 60 * 60 * 1000;

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Кабинет компании',
  description: 'Закрытый кабинет компании BARSYNERGY для профиля, заявок и рабочих статусов.'
});

export default async function BusinessDashboardPage({ searchParams }: BusinessDashboardPageProps) {
  const { businessAccount } = await requireBusinessAccountAccess();
  const params = (await searchParams) ?? {};
  const isWelcome = (Array.isArray(params.welcome) ? params.welcome[0] : params.welcome) === '1';
  const {
    requestCount, activeRequestCount, draftRequestCount,
    closedRequestCount, latestApplications,
    newResponseCount
  } = await getBusinessDashboardData(businessAccount.id);

  const missingProfileFields = [
    businessAccount.contactPerson ? null : 'контактное лицо',
    businessAccount.phone ? null : 'телефон',
    businessAccount.cityId ? null : 'город',
    businessAccount.description ? null : 'описание компании'
  ].filter((field): field is string => Boolean(field));
  const profileReadyActionVisible =
    missingProfileFields.length > 0 ||
    Date.now() - businessAccount.updatedAt.getTime() <= PROFILE_READY_ACTION_GRACE_MS;

  return (
    <div className="space-y-8" data-ux-metric="business_dashboard_viewed">
      <PageHeader eyebrow="Компания" title={businessAccount.companyName} />
      <AdminActionAlert params={params} />

      {isWelcome ? (
        <Panel padding="md" tone="elevated" data-ux-event="business_welcome_shown">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)]">
              <PartyPopper aria-hidden className="text-[var(--accent)]" size={22} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[1.25rem] font-semibold leading-tight text-[var(--text)]">
                Добро пожаловать в кабинет компании
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Кабинет активен. Сначала заполните профиль, затем создайте первую заявку и проверьте отклики команды.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  { href: '/business/cabinet/settings', icon: Building2, label: 'Заполнить профиль', description: 'Контакты, город и описание компании' },
                  { href: '/business/cabinet/requests#new-request', icon: FileText, label: 'Создать заявку', description: 'Вакансия, обучение, партнёрство или каталог' },
                  { href: '/business/cabinet/responses', icon: Users, label: 'Проверить отклики', description: 'Ответы команды и новые отклики' }
                ].map((item) => (
                  <a
                    className="group flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-wash)] px-3 py-2.5 transition-colors hover:border-[var(--accent)]/35 hover:bg-[var(--accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                    href={item.href}
                    key={item.href}
                  >
                    <item.icon aria-hidden className="shrink-0 text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]" size={18} strokeWidth={1.5} />
                    <span>
                      <span className="block text-[13px] font-semibold text-[var(--text)]">{item.label}</span>
                      <span className="block text-[11px] leading-4 text-[var(--muted)]">{item.description}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      ) : null}

      <Panel className="grid gap-3 md:grid-cols-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] md:items-center" padding="md" tone="elevated" data-ux-metric="business_kpi_viewed" data-ux-value={`${requestCount},${activeRequestCount},${draftRequestCount},${newResponseCount}`}>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Всего заявок</p>
          <p className="mt-1 text-xl font-semibold text-[var(--text)]">{requestCount}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">В работе</p>
          <p className="mt-1 text-xl font-semibold text-[var(--text)]">{activeRequestCount}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Черновики</p>
          <p className="mt-1 text-xl font-semibold text-[var(--text)]">{draftRequestCount}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Новые отклики</p>
          <p className="mt-1 text-xl font-semibold text-[var(--text)]">{newResponseCount}</p>
        </div>
        <div className="md:col-span-4 lg:col-span-1 lg:ml-auto">
          <Button className="shrink-0 rounded-[var(--radius-md)]" href="/business/cabinet/requests#new-request" size="md" variant="primary">
            Создать заявку
            <ArrowRight size={15} strokeWidth={1.8} />
          </Button>
        </div>
      </Panel>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.45fr)]">
        <div id="business-profile">
          <BusinessProfileSummary account={businessAccount} missingFields={missingProfileFields} />
        </div>
        <div className="space-y-5">
          <NextActionPanel
            description={
              missingProfileFields.length > 0
                ? `В профиле не заполнены: ${missingProfileFields.join(', ')}.`
                : 'Профиль заполнен. Можно работать с новыми заявками и проверять ответы команды.'
            }
            items={[
              ...(profileReadyActionVisible
                ? [
                    {
                      label: 'Проверить профиль',
                      detail: missingProfileFields.length > 0 ? 'Дозаполните поля перед новой заявкой.' : 'Данные компании готовы для новых заявок.',
                      href: '/business/cabinet/settings',
                      status: missingProfileFields.length > 0 ? 'нужно' : 'готово'
                    }
                  ]
                : []),
              {
                label: 'Создать заявку',
                detail: 'Вакансия, поставщик, партнёрство, обучение или сертификат.',
                href: '/business/cabinet/requests#new-request',
                status: undefined
              },
              {
                label: 'Проверить журнал',
                detail: 'Откройте последнюю запись, если изменился статус или появился комментарий.',
                href: latestApplications[0] ? `/business/cabinet/requests/${latestApplications[0].id}` : '/business/cabinet/requests',
                status: undefined
              }
            ]}
            primaryAction={{ href: '/business/cabinet/requests', label: 'Открыть журнал заявок' }}
          />
          {closedRequestCount > 0 ? (
            <Panel className="text-sm leading-6 text-[var(--muted)]" padding="md" tone="elevated">
              Закрытых заявок: <span className="font-semibold text-[var(--text)]">{closedRequestCount}</span>. Архив и завершённые записи доступны в журнале.
            </Panel>
          ) : null}
        </div>
      </section>

      <RequestLedger
        applications={latestApplications}
        emptyAction={{ href: '/business/cabinet/requests', label: 'Создать первую заявку' }}
        emptyDescription="Когда компания создаст первую заявку, здесь появятся её статус, рабочие комментарии и быстрый переход к записи."
        title="Последние заявки"
        viewAllHref="/business/cabinet/requests"
      />
    </div>
  );
}
