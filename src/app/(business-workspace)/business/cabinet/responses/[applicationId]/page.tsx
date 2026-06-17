import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApplicationType, ConversationSender } from '@/modules/business/queries';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConversationThread } from '@/components/messaging/conversation-thread';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels
} from '@/lib/admin/application-utils';
import {
  getBusinessResponseDetail
} from '@/modules/business/queries';
import { getConversationThread } from '@/lib/messaging/get-conversation';

type BusinessResponseDetailPageProps = {
  params: Promise<{ applicationId: string }>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Отклик на вакансию',
  description: 'Детальный просмотр отклика кандидата.'
});

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

export default async function BusinessResponseDetailPage({ params }: BusinessResponseDetailPageProps) {
  const { businessAccount, user } = await requireBusinessAccountAccess();
  const { applicationId } = await params;

  const application = await getBusinessResponseDetail(applicationId, businessAccount.id);

  if (!application) {
    notFound();
  }

  const messages = await getConversationThread(applicationId);
  const interlocutorName = application.name ?? 'Кандидат';
  const isSupplierInquiry = application.type === ApplicationType.SUPPLIER_INQUIRY;
  const contextLabel = isSupplierInquiry
    ? application.supplier?.title ?? 'Запрос поставщику'
    : application.vacancy?.title ?? 'Отклик на вакансию';

  return (
    <div className="space-y-6">
      <PageHeader title={application.name || application.subject || (isSupplierInquiry ? 'Запрос поставщику' : 'Отклик')} />

      <Panel padding="lg" tone="elevated">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{isSupplierInquiry ? 'Данные запроса' : 'Данные кандидата'}</h2>
          <StatusBadge variant={applicationStatusBadgeVariants[application.status]}>
            {applicationStatusLabels[application.status]}
          </StatusBadge>
        </div>

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold">Имя</dt>
            <dd className="mt-1 text-[var(--muted)]">{application.name ?? '-'}</dd>
          </div>
          <div>
            <dt className="font-semibold">Город</dt>
            <dd className="mt-1 text-[var(--muted)]">{application.city?.name ?? '-'}</dd>
          </div>
          <div>
            <dt className="font-semibold">Email</dt>
            <dd className="mt-1 text-[var(--muted)]">{application.email ?? '-'}</dd>
          </div>
          <div>
            <dt className="font-semibold">Телефон</dt>
            <dd className="mt-1 text-[var(--muted)]">{application.phone ?? '-'}</dd>
          </div>
          <div>
            <dt className="font-semibold">Telegram</dt>
            <dd className="mt-1 text-[var(--muted)]">{application.telegram ?? '-'}</dd>
          </div>
          <div>
            <dt className="font-semibold">{isSupplierInquiry ? 'Дата запроса' : 'Дата отклика'}</dt>
            <dd className="mt-1 text-[var(--muted)]">{dateTimeFormatter.format(application.createdAt)}</dd>
          </div>
        </dl>

        {application.message ? (
          <div className="mt-5 border-t border-[var(--line)] pt-5 text-sm">
            <h3 className="font-semibold">{isSupplierInquiry ? 'Сообщение' : 'Сопроводительное письмо'}</h3>
            <p className="mt-2 whitespace-pre-wrap leading-7 text-[var(--muted)]">{application.message}</p>
          </div>
        ) : null}
      </Panel>

      <Panel padding="md" tone="elevated">
        <h2 className="text-lg font-semibold">{isSupplierInquiry ? 'Поставщик' : 'Вакансия'}</h2>
        {isSupplierInquiry && application.supplier ? (
          <>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {application.supplier.title}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button href={`/suppliers/${application.supplier.slug}`} size="sm" variant="secondary">
                Открыть поставщика
              </Button>
            </div>
          </>
        ) : application.vacancy ? (
          <>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {application.vacancy.title}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button href={`/vacancies/${application.vacancy.slug}`} size="sm" variant="secondary">
                Открыть вакансию
              </Button>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-[var(--muted)]">{isSupplierInquiry ? 'Поставщик не найден.' : 'Вакансия не найдена.'}</p>
        )}
      </Panel>

      <ConversationThread
        applicationId={applicationId}
        composePlaceholder={isSupplierInquiry ? 'Ответьте на запрос...' : 'Ответьте кандидату...'}
        contextLabel={contextLabel}
        currentUserId={user.id}
        currentUserRole="business"
        interlocutorName={interlocutorName}
        messageCount={messages.length}
        messages={messages}
        senderRole={ConversationSender.BUSINESS}
        status={application.status}
      />

      <Button href="/business/cabinet/responses" variant="ghost">
        Вернуться к откликам
      </Button>
    </div>
  );
}
