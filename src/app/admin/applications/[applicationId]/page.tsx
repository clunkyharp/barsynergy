import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ApplicationStatus, ApplicationType, BusinessAccountStatus, ConversationSender, UserStatus } from '@/modules/admin/queries';
import { AdminActionAlert } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConversationThread } from '@/components/messaging/conversation-thread';
import { getAvailableApplicationStatuses } from '@/lib/admin/application-transitions';
import { isApplicationPublicationStatusAllowed } from '@/lib/admin/application-publication';
import { applicationStatusBadgeVariants, applicationStatusLabels, applicationStatusValues, applicationTypeLabels } from '@/lib/admin/application-utils';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import {
  BUSINESS_ACCESS_PREVIEW_COOKIE_NAME, isBusinessAccessInvitePreparationStatusAllowed
} from '@/lib/auth/business-access';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { getConversationThread } from '@/lib/messaging/get-conversation';
import { getApplicationById } from '@/lib/admin/admin-queries';
import { ApplicationInfo } from './_components/application-info';
import { BusinessAccessForm } from './_forms/business-access-form';
import { ProcessingForm } from './_forms/processing-form';

export const dynamic = 'force-dynamic';

const ADMIN_APPLICATIONS_PATH = '/admin/applications';

type Props = {
  params: Promise<{ applicationId: string }>;
  searchParams?: Promise<AdminContentSearchParams>;
};

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

export default async function AdminApplicationDetailPage({ params, searchParams }: Props) {
  await requireAdminSectionAccess('applications');

  const { applicationId } = await params;
  const query = (await searchParams) ?? {};
  const currentPath = `${ADMIN_APPLICATIONS_PATH}/${applicationId}`;
  const cookieStore = await cookies();
  const activationPreviewValue = cookieStore.get(BUSINESS_ACCESS_PREVIEW_COOKIE_NAME)?.value;
  const activationPreview = (() => {
    if (!activationPreviewValue) return null;
    try {
      const parsed = JSON.parse(activationPreviewValue) as { applicationId?: string; activationUrl?: string; email?: string; companyName?: string; expiresAt?: string };
      return parsed.applicationId === applicationId ? parsed : null;
    } catch { return null; }
  })();

  const application = await getApplicationById(applicationId);

  if (!application) notFound();

  const messages = await getConversationThread(applicationId);
  const interlocutorName = application.name ?? application.businessAccount?.companyName ?? 'Заявитель';
  const contextLabel = application.vacancy?.title ?? application.supplier?.title ?? application.master?.title ?? applicationTypeLabels[application.type];

  const forwardedInfo = application.status === ApplicationStatus.FORWARDED_TO_EMPLOYER
    ? [application.forwardedAt ? dateTimeFormatter.format(application.forwardedAt) : null, application.forwardedBy?.email].filter(Boolean).join(' / ')
    : null;
  const availableStatuses = getAvailableApplicationStatuses(application, applicationStatusValues);
  const isBusinessAccessActive = application.businessAccount?.owner.status === UserStatus.ACTIVE && application.businessAccount.status === BusinessAccountStatus.ACTIVE;
  const canPrepareBusinessAccessInvite = application.type === ApplicationType.BUSINESS_ACCOUNT_REQUEST && !isBusinessAccessActive && isBusinessAccessInvitePreparationStatusAllowed(application.status);
  const hasPublicationConsent = Boolean(application.consentAcceptedAt);
  const canPublish = isApplicationPublicationStatusAllowed(application.status) && hasPublicationConsent;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">Админка / Заявки / {applicationTypeLabels[application.type]}</p>
          <h1 className="mt-2 text-3xl font-semibold">{application.subject || applicationTypeLabels[application.type]}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusBadge variant={applicationStatusBadgeVariants[application.status]}>
              {applicationStatusLabels[application.status]}
            </StatusBadge>
            <span className="text-sm text-[var(--muted)]">
              {applicationTypeLabels[application.type]} / создана {dateTimeFormatter.format(application.createdAt)}
            </span>
          </div>
        </div>
        <Button href={ADMIN_APPLICATIONS_PATH} variant="secondary">
          Вернуться к списку
        </Button>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <ApplicationInfo application={application} />
        </div>

        <div className="space-y-6">
          <AdminActionAlert params={query} />

          <ProcessingForm application={application} availableStatuses={availableStatuses} canPublish={canPublish} forwardedInfo={forwardedInfo} currentPath={currentPath} />

          {application.type === ApplicationType.BUSINESS_ACCOUNT_REQUEST ? (
            <BusinessAccessForm application={application} canPrepareInvite={canPrepareBusinessAccessInvite} isAccessActive={isBusinessAccessActive} activationPreview={activationPreview} currentPath={currentPath} />
          ) : null}
        </div>
      </div>

      <ConversationThread
        applicationId={applicationId}
        composePlaceholder="Напишите ответ от имени платформы..."
        contextLabel={contextLabel}
        currentUserId={null}
        interlocutorName={interlocutorName}
        messageCount={messages.length}
        messages={messages}
        senderRole={ConversationSender.ADMIN}
        status={application.status}
      />
    </div>
  );
}
