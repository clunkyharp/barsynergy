import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { updateBusinessProfile } from '@/lib/business/actions';
import { AdminActionAlert } from '@/components/admin/content-admin-controls';
import {
  BusinessProfileSheet,
  NextActionPanel,
  RequestLedger,
  RequestStatusRail
} from '@/components/business/business-cabinet';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import {
  getBusinessDashboardData,
  getActiveCities
} from '@/modules/business/queries';

type BusinessDashboardPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Кабинет компании',
  description: 'Закрытый кабинет компании BARSYNERGY для профиля, заявок и рабочих статусов.'
});

export default async function BusinessDashboardPage({ searchParams }: BusinessDashboardPageProps) {
  const { businessAccount } = await requireBusinessAccountAccess();
  const params = (await searchParams) ?? {};
  const cities = await getActiveCities();
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

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Компания" title={businessAccount.companyName} />
      <AdminActionAlert params={params} />

      <div className="flex flex-wrap items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-elevated)] px-5 py-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-semibold text-[var(--text)]">Активных заявок: <span className="text-[var(--accent)]">{activeRequestCount}</span></span>
          <span className="h-4 w-px bg-[var(--line)]" aria-hidden="true" />
          <span className="font-semibold text-[var(--text)]">Новых откликов: <span className="text-[var(--accent)]">{newResponseCount}</span></span>
        </div>
        <Button className="ml-auto shrink-0 rounded-[var(--radius-md)]" href="/business/cabinet/requests" size="sm" variant="primary">
          Создать заявку
          <ArrowRight size={15} strokeWidth={1.8} />
        </Button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.45fr)]">
        <BusinessProfileSheet account={businessAccount} action={updateBusinessProfile} cities={cities} />
        <div className="space-y-5">
          <RequestStatusRail
            items={[
              { label: 'Всего', value: requestCount, detail: 'Все заявки компании' },
              { label: 'В работе', value: activeRequestCount, detail: 'Отправленные и неархивные', tone: 'pending' },
              { label: 'Черновики', value: draftRequestCount, detail: 'Можно открыть и отправить', tone: 'neutral' },
              { label: 'Закрытые', value: closedRequestCount, detail: 'Завершены, отклонены или в архиве', tone: 'neutral' }
            ]}
          />
          <NextActionPanel
            description={
              missingProfileFields.length > 0
                ? `В профиле не заполнены: ${missingProfileFields.join(', ')}.`
                : 'Профиль заполнен. Можно работать с новыми заявками и проверять ответы команды.'
            }
            items={[
              {
                label: 'Проверить профиль',
                detail: missingProfileFields.length > 0 ? 'Дозаполните поля перед новой заявкой.' : 'Данные компании готовы для новых заявок.',
                status: missingProfileFields.length > 0 ? 'нужно' : 'готово'
              },
              {
                label: 'Создать заявку',
                detail: 'Вакансия, поставщик, партнёрство, обучение или сертификат.',
                href: '/business/cabinet/requests',
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
        </div>
      </section>

      <RequestLedger applications={latestApplications} title="Последние заявки" viewAllHref="/business/cabinet/requests" />
    </div>
  );
}
