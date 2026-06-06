import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { ApplicationStatus, ApplicationType } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { AppLink } from '@/components/ui/app-link';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { prisma } from '@/lib/db/prisma';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels
} from '@/lib/admin/application-utils';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Отклики на вакансии',
  description: 'Отклики кандидатов на вакансии компании.'
});

export default async function BusinessResponsesPage() {
  const { businessAccount } = await requireBusinessAccountAccess();

  const vacancies = await prisma.vacancy.findMany({
    where: { businessAccountId: businessAccount.id },
    select: { id: true, title: true, slug: true }
  });

  const vacancyIds = vacancies.map((v) => v.id);

  const responses = vacancyIds.length > 0
    ? await prisma.application.findMany({
        where: {
          vacancyId: { in: vacancyIds },
          type: ApplicationType.VACANCY_RESPONSE,
          status: { not: ApplicationStatus.DRAFT }
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          name: true,
          message: true,
          vacancy: { select: { title: true, slug: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Отклики кандидатов"
        description="Список откликов специалистов на вакансии вашей компании."
        title="Отклики"
      />

      {responses.length === 0 ? (
        <Panel className="max-w-xl" padding="lg">
          <div className="flex flex-col items-start gap-4">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--accent-soft)] text-[var(--accent)]">
              <Mail aria-hidden="true" size={20} strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="text-xl font-semibold leading-7 text-[var(--text)]">Откликов пока нет</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                Когда кандидаты начнут откликаться на ваши вакансии, отклики появятся здесь.
              </p>
            </div>
            <Button href="/business/cabinet/requests">К заявкам</Button>
          </div>
        </Panel>
      ) : (
        <div className="space-y-4">
          {responses.map((response) => (
            <Panel key={response.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" padding="md" tone="elevated">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge variant={applicationStatusBadgeVariants[response.status]}>
                    {applicationStatusLabels[response.status]}
                  </StatusBadge>
                  <span className="text-[var(--muted)]">•</span>
                  <span className="text-xs text-[var(--muted)]">
                    {new Date(response.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <h3 className="mt-1 font-semibold truncate">
                  {response.name || 'Без имени'}
                </h3>
                {response.vacancy && (
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    На вакансию:{' '}
                    <AppLink className="hover:text-[var(--accent)] transition-colors" href={`/vacancies/${response.vacancy.slug}`}>
                      {response.vacancy.title}
                    </AppLink>
                  </p>
                )}
                {response.message && (
                  <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">{response.message}</p>
                )}
              </div>
              <Button href={`/business/cabinet/responses/${response.id}`} size="sm" variant="secondary">
                Подробнее
              </Button>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
