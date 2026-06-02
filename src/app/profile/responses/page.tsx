import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { applicationStatusBadgeVariants, applicationStatusLabels, applicationTypeLabels } from '@/lib/admin/application-utils';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';

const PROFILE_RESPONSES_PAGE_SIZE = 20;

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Мои отклики',
  description: 'Закрытая история откликов и заявок специалиста BARSYNERGY.'
});

export default async function ProfileResponsesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  const responses = await prisma.application.findMany({
    where: {
      email: user.email
    },
    select: {
      id: true,
      type: true,
      status: true,
      createdAt: true,
      subject: true,
      message: true,
      vacancy: {
        select: {
          title: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: PROFILE_RESPONSES_PAGE_SIZE
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="История активности"
        description="История ваших откликов на вакансии и других заявок."
        title="Мои отклики"
      />

      <div className="space-y-4">
        {responses.length === 0 ? (
          <Panel className="max-w-xl" padding="lg">
            <div className="flex flex-col items-start gap-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--accent-soft)] text-[var(--accent)]">
                <Mail aria-hidden="true" size={20} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="text-xl font-semibold leading-7 text-[var(--text)]">Откликов пока нет</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                  Найдите вакансию и откликнитесь — здесь появится история.
                </p>
              </div>
              <Button href="/vacancies">Смотреть вакансии →</Button>
            </div>
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
                <StatusBadge variant={applicationStatusBadgeVariants[response.status]}>
                  {applicationStatusLabels[response.status]}
                </StatusBadge>
              </div>
            </Panel>
          ))
        )}
      </div>
    </div>
  );
}
