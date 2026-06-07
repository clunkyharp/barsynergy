import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ApplicationStatus, ApplicationType, BusinessAccountStatus, ConversationSender, UserStatus } from '@/modules/admin/queries';
import { AdminActionAlert } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { ConversationThread } from '@/components/messaging/conversation-thread';
import { getAvailableApplicationStatuses } from '@/lib/admin/application-transitions';
import { isApplicationPublicationStatusAllowed } from '@/lib/admin/application-publication';
import { applicationStatusValues } from '@/lib/admin/application-utils';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import {
  BUSINESS_ACCESS_PREVIEW_COOKIE_NAME, isBusinessAccessInvitePreparationStatusAllowed
} from '@/lib/auth/business-access';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { getConversationThread } from '@/lib/messaging/get-conversation';
import { prisma } from '@/modules/admin/queries';
import { ApplicationInfo } from './_components/application-info';
import { BusinessAccessForm } from './_forms/business-access-form';
import { PartnerPublicationForm, SupplierPublicationForm, VacancyPublicationForm } from './_forms/publication-form';
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

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      city: { select: { name: true } },
      vacancy: { select: { id: true, title: true, slug: true, companyName: true } },
      supplier: { select: { id: true, title: true, slug: true, companyName: true } },
      partner: { select: { id: true, title: true, slug: true, companyName: true } },
      resumeFile: { select: { originalName: true, mimeType: true, size: true } },
      forwardedBy: { select: { email: true } },
      businessAccount: {
        select: { id: true, companyName: true, status: true, owner: { select: { id: true, email: true, status: true } } }
      }
    }
  });

  if (!application) notFound();

  const messages = await getConversationThread(applicationId);
  const interlocutorName = application.name ?? application.businessAccount?.companyName ?? 'Заявитель';
  const contextLabel = application.vacancy?.title ?? application.supplier?.title ?? application.type;

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
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <ApplicationInfo application={application} />
        </div>

        <div className="space-y-6">
          <AdminActionAlert params={query} />

          <ProcessingForm application={application} availableStatuses={availableStatuses} forwardedInfo={forwardedInfo} currentPath={currentPath} />

          {application.type === ApplicationType.VACANCY_SUBMISSION ? (
            <VacancyPublicationForm application={application} canPublish={canPublish} currentPath={currentPath} />
          ) : null}

          {application.type === ApplicationType.SUPPLIER_SUBMISSION ? (
            <SupplierPublicationForm application={application} canPublish={canPublish} currentPath={currentPath} />
          ) : null}

          {application.type === ApplicationType.PARTNER_APPLICATION ? (
            <PartnerPublicationForm application={application} canPublish={canPublish} currentPath={currentPath} />
          ) : null}

          {application.type === ApplicationType.BUSINESS_ACCOUNT_REQUEST ? (
            <BusinessAccessForm application={application} canPrepareInvite={canPrepareBusinessAccessInvite} isAccessActive={isBusinessAccessActive} activationPreview={activationPreview} currentPath={currentPath} />
          ) : null}

          <Button href={ADMIN_APPLICATIONS_PATH} variant="ghost">Вернуться к списку</Button>
        </div>
      </div>

      <ConversationThread
        applicationId={applicationId}
        composePlaceholder="Напишите ответ от имени платформы..."
        contextLabel={contextLabel}
        currentUserId={null}
        currentUserRole="admin"
        interlocutorName={interlocutorName}
        messageCount={messages.length}
        messages={messages}
        senderRole={ConversationSender.ADMIN}
        status={application.status}
      />
    </div>
  );
}
