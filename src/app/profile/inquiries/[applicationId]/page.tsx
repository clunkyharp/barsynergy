import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConversationThread } from '@/components/messaging/conversation-thread';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels
} from '@/lib/admin/application-utils';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getConversationThread } from '@/lib/messaging/get-conversation';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { ConversationSender, getUserInquiry } from '@/modules/profile/queries';

type InquiryDetailPageProps = {
  params: Promise<{ applicationId: string }>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Запрос поставщику',
  description: 'Детали запроса поставщику BARSYNERGY.'
});

export default async function InquiryDetailPage({ params }: InquiryDetailPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login?returnTo=/profile/inquiries');
  }

  const { applicationId } = await params;
  const application = await getUserInquiry(applicationId, currentUser.id);

  if (!application) {
    notFound();
  }

  const messages = await getConversationThread(applicationId);
  const interlocutorName = application.supplier?.businessAccountId
    ? application.supplier.title
    : 'Платформа BARSYNERGY';
  const contextLabel = application.supplier?.title ?? 'Запрос поставщику';

  return (
    <div className="space-y-6">
      <PageHeader title={application.subject ?? 'Запрос поставщику'} />

      <Panel padding="md" tone="elevated">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MetaChip variant="filter">Запрос поставщику</MetaChip>
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

        {application.supplier && (
          <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Поставщик</p>
            <p className="mt-1 text-sm font-medium">{application.supplier.title}</p>
          </div>
        )}

        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <Button href="/profile/inquiries" variant="secondary">
            Вернуться к запросам
          </Button>
        </div>
      </Panel>

      <ConversationThread
        applicationId={applicationId}
        composePlaceholder="Напишите уточнение..."
        contextLabel={contextLabel}
        currentUserId={currentUser.id}
        currentUserRole="user"
        interlocutorName={interlocutorName}
        messageCount={messages.length}
        messages={messages}
        senderRole={ConversationSender.USER}
        status={application.status}
      />
    </div>
  );
}
