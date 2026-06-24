import { ConversationSender, ApplicationStatus } from '@prisma/client';
import type { ConversationThreadMessage } from '@/lib/messaging/get-conversation';
import { MessageBubble } from './message-bubble';
import { ConversationHeader } from './conversation-header';
import { ConversationThreadClient } from './conversation-thread-client';

type ConversationThreadProps = {
  applicationId: string;
  messages: ConversationThreadMessage[];
  interlocutorName: string;
  contextLabel: string;
  status: ApplicationStatus;
  messageCount: number;
  currentUserId: string | null;
  senderRole: ConversationSender;
  composeDisabled?: boolean;
  composeDisabledReason?: string;
  composePlaceholder?: string;
};

const CLOSED_STATUSES = new Set<ApplicationStatus>([
  ApplicationStatus.COMPLETED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.ARCHIVED
]);

export function ConversationThread({
  applicationId,
  messages,
  interlocutorName,
  contextLabel,
  status,
  messageCount,
  currentUserId,
  senderRole,
  composeDisabled,
  composeDisabledReason,
  composePlaceholder
}: ConversationThreadProps) {
  const isClosed = CLOSED_STATUSES.has(status);
  const disabled = composeDisabled ?? isClosed;
  const disabledReason = composeDisabledReason ?? (isClosed ? 'Заявка закрыта, переписка недоступна.' : undefined);

  return (
    <div className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)]">
      <ConversationHeader
        contextLabel={contextLabel}
        interlocutorName={interlocutorName}
        messageCount={messageCount}
        status={status}
      />

      <div className="flex-1 overflow-y-auto px-5 py-4" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-[14px] text-[var(--muted)]">
            Сообщений пока нет.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <MessageBubble
                authorName={msg.authorName}
                body={msg.body}
                createdAt={msg.createdAt}
                isOwn={msg.authorId === currentUserId}
                key={msg.id}
                senderRole={msg.senderRole}
              />
            ))}
          </div>
        )}
      </div>

      <ConversationThreadClient
        applicationId={applicationId}
        disabled={disabled}
        disabledReason={disabledReason}
        placeholder={composePlaceholder}
        senderRole={senderRole}
      />
    </div>
  );
}
