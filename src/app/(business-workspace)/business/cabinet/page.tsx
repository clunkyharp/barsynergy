import { ApplicationStatus } from '@prisma/client';
import { updateBusinessProfile } from '@/lib/business/actions';
import { AdminActionAlert } from '@/components/admin/content-admin-controls';
import {
  BusinessProfileSheet,
  NextActionPanel,
  RequestLedger,
  RequestStatusRail
} from '@/components/business/business-cabinet';
import { PageHeader } from '@/components/ui/page-header';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { prisma } from '@/lib/db/prisma';

type BusinessDashboardPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function BusinessDashboardPage({ searchParams }: BusinessDashboardPageProps) {
  const { businessAccount } = await requireBusinessAccountAccess();
  const params = (await searchParams) ?? {};
  const [cities, requestCount, activeRequestCount, draftRequestCount, closedRequestCount, latestApplications] = await Promise.all([
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    }),
    prisma.application.count({ where: { businessAccountId: businessAccount.id } }),
    prisma.application.count({
      where: {
        businessAccountId: businessAccount.id,
        status: {
          notIn: [ApplicationStatus.DRAFT, ApplicationStatus.ARCHIVED]
        }
      }
    }),
    prisma.application.count({
      where: {
        businessAccountId: businessAccount.id,
        status: ApplicationStatus.DRAFT
      }
    }),
    prisma.application.count({
      where: {
        businessAccountId: businessAccount.id,
        status: {
          in: [ApplicationStatus.COMPLETED, ApplicationStatus.REJECTED, ApplicationStatus.ARCHIVED]
        }
      }
    }),
    prisma.application.findMany({
      where: { businessAccountId: businessAccount.id },
      orderBy: [{ updatedAt: 'desc' }],
      take: 5,
      select: { id: true, type: true, subject: true, status: true, businessNotes: true, createdAt: true, updatedAt: true }
    })
  ]);

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

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.45fr)]">
        <BusinessProfileSheet account={businessAccount} action={updateBusinessProfile} cities={cities} />
        <div className="space-y-5">
          <RequestStatusRail
            items={[
              { label: 'Всего', value: requestCount, detail: 'Все заявки компании' },
              { label: 'В работе', value: activeRequestCount, detail: 'Отправленные и неархивные', tone: 'pending' },
              { label: 'Черновики', value: draftRequestCount, detail: 'Можно открыть и отправить', tone: 'neutral' },
              { label: 'Закрытые', value: closedRequestCount, detail: 'Завершены, отклонены или в архиве', tone: 'success' }
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
                href: '/business/cabinet/requests'
              },
              {
                label: 'Проверить журнал',
                detail: 'Откройте последнюю запись, если изменился статус или появился комментарий.',
                href: latestApplications[0] ? `/business/cabinet/requests/${latestApplications[0].id}` : '/business/cabinet/requests',
                status: activeRequestCount > 0 ? 'есть работа' : 'нет активных'
              }
            ]}
            primaryAction={{ href: '/business/cabinet/requests', label: 'Открыть журнал заявок' }}
          />
        </div>
      </section>

      <RequestLedger applications={latestApplications} title="Последние заявки" />
    </div>
  );
}
