import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels,
  applicationTypeLabels
} from '@/lib/admin/application-utils';
import { getApplicationPayloadDisplayEntries } from '@/lib/applications/application-payloads';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';

type ResponseDetailPageProps = {
  params: Promise<{ applicationId: string }>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Детали отклика',
  description: 'Детальная информация об отклике BARSYNERGY.'
});

export default async function ResponseDetailPage({ params }: ResponseDetailPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login?returnTo=/profile/responses');
  }

  const { applicationId } = await params;

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId: currentUser.id
    },
    include: {
      vacancy: { select: { title: true } },
      city: { select: { name: true } }
    }
  });

  if (!application) {
    notFound();
  }

  const payloadEntries = getApplicationPayloadDisplayEntries(application.type, application.payload);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={applicationTypeLabels[application.type]}
        description="Детальная информация по вашему отклику или заявке."
        title={application.subject ?? applicationTypeLabels[application.type]}
      />

      <Panel padding="md" tone="elevated">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MetaChip variant="filter">
              {applicationTypeLabels[application.type]}
            </MetaChip>
            <StatusBadge variant={applicationStatusBadgeVariants[application.status]}>
              {applicationStatusLabels[application.status]}
            </StatusBadge>
          </div>
          <span className="text-sm text-[var(--muted)]">
            {new Date(application.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        {application.vacancy && (
          <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Вакансия</p>
            <p className="mt-1 text-sm font-medium">{application.vacancy.title}</p>
          </div>
        )}

        {application.message && (
          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Сообщение</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">{application.message}</p>
          </div>
        )}

        {payloadEntries.length > 0 && (
          <div className="mt-5 border-t border-[var(--line)] pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Данные отклика</p>
            <dl className="mt-3 grid gap-3 text-sm">
              {payloadEntries.map(({ key, label, value }) => (
                <div className="grid grid-cols-[1fr_2fr] gap-4" key={key}>
                  <dt className="font-medium text-[var(--muted)]">{label}</dt>
                  <dd className="text-[var(--text)]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <Button href="/profile/responses" variant="secondary">
            Вернуться к откликам
          </Button>
        </div>
      </Panel>
    </div>
  );
}
