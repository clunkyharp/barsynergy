import { redirect } from 'next/navigation';
import type { ApplicationStatus, ApplicationType } from '@prisma/client';
import { MetaChip } from '@/components/ui/meta-chip';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/status-badge';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';

const applicationTypeLabels: Record<ApplicationType, string> = {
  BUSINESS_ACCOUNT_REQUEST: 'Запрос бизнес-аккаунта',
  COURSE_APPLICATION: 'Заявка на курс',
  EVENT_APPLICATION: 'Заявка на событие',
  VACANCY_SUBMISSION: 'Подача вакансии',
  VACANCY_RESPONSE: 'Отклик на вакансию',
  SUPPLIER_SUBMISSION: 'Подача поставщика',
  PARTNER_APPLICATION: 'Заявка на партнерство',
  CONTACT_MESSAGE: 'Сообщение из контактов',
  CORPORATE_TRAINING_APPLICATION: 'Заявка на корпоративное обучение',
  CERTIFICATE_ORDER: 'Заказ сертификата'
};

const statusVariants: Record<ApplicationStatus, StatusBadgeVariant> = {
  DRAFT: 'neutral',
  NEW: 'pending',
  IN_REVIEW: 'warning',
  CONTACTED: 'success',
  FORWARDED_TO_EMPLOYER: 'success',
  PAYMENT_PENDING: 'warning',
  PAID_MANUALLY: 'success',
  APPROVED: 'success',
  REJECTED: 'danger',
  COMPLETED: 'success',
  ARCHIVED: 'neutral'
};

const statusLabels: Record<ApplicationStatus, string> = {
  DRAFT: 'Черновик',
  NEW: 'Новая',
  IN_REVIEW: 'На рассмотрении',
  CONTACTED: 'Связались',
  FORWARDED_TO_EMPLOYER: 'Передано работодателю',
  PAYMENT_PENDING: 'Ожидает оплаты',
  PAID_MANUALLY: 'Оплачено (вручную)',
  APPROVED: 'Одобрено',
  REJECTED: 'Отклонено',
  COMPLETED: 'Завершено',
  ARCHIVED: 'В архиве'
};

export default async function ProfileResponsesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  const responses = await prisma.application.findMany({
    where: {
      email: user.email
    },
    include: {
      vacancy: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="История активности"
        description="История ваших откликов на вакансии и заявок на другие услуги платформы."
        title="Мои отклики"
      />

      <div className="space-y-4">
        {responses.length === 0 ? (
          <Panel className="text-center text-[var(--muted)]" padding="lg">
            У вас пока нет откликов.
          </Panel>
        ) : (
          responses.map((response) => (
            <Panel className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" key={response.id} padding="md" tone="elevated">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <MetaChip variant="filter">
                    {applicationTypeLabels[response.type]}
                  </MetaChip>
                  <span className="text-[var(--muted)]">•</span>
                  <span className="text-xs text-[var(--muted)]">
                    {new Date(response.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <h3 className="mt-1 font-semibold truncate">
                  {response.subject || response.vacancy?.title || 'Без темы'}
                </h3>
                {response.message && (
                  <p className="mt-1 text-sm text-[var(--muted)] line-clamp-1">{response.message}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge variant={statusVariants[response.status]}>
                  {statusLabels[response.status]}
                </StatusBadge>
              </div>
            </Panel>
          ))
        )}
      </div>
    </div>
  );
}
