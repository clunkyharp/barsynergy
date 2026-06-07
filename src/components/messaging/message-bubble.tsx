import { ConversationSender } from '@prisma/client';
import { getSenderInitials } from './unread-badge';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit'
});

type MessageBubbleProps = {
  senderRole: ConversationSender;
  authorName: string | null;
  body: string;
  createdAt: Date;
  isOwn: boolean;
};

export function MessageBubble({ senderRole, authorName, body, createdAt, isOwn }: MessageBubbleProps) {
  const initials = getSenderInitials(authorName, senderRole);
  const displayName = authorName ?? getRoleFallbackName(senderRole);

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-wash)] text-[13px] font-semibold text-[var(--text)]"
      >
        {initials}
      </div>

      <div className={`max-w-[75%] min-w-0 ${isOwn ? 'text-right' : 'text-left'}`}>
        <div className="mb-1 flex items-baseline gap-2 text-[12px] text-[var(--muted)]">
          {isOwn ? (
            <>
              <time dateTime={createdAt.toISOString()}>{dateFormatter.format(createdAt)}</time>
              <span className="font-medium text-[var(--text)]">{displayName}</span>
            </>
          ) : (
            <>
              <span className="font-medium text-[var(--text)]">{displayName}</span>
              <time dateTime={createdAt.toISOString()}>{dateFormatter.format(createdAt)}</time>
            </>
          )}
        </div>

        <div
          className={`inline-block rounded-[var(--radius-md)] px-3.5 py-2.5 text-[14px] leading-relaxed ${
            isOwn
              ? 'bg-[var(--accent-soft)] text-[var(--text)]'
              : 'bg-[var(--surface-wash)] text-[var(--text)]'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{body}</p>
        </div>
      </div>
    </div>
  );
}

function getRoleFallbackName(role: ConversationSender): string {
  switch (role) {
    case ConversationSender.USER: return 'Участник';
    case ConversationSender.BUSINESS: return 'Компания';
    case ConversationSender.ADMIN: return 'Платформа';
  }
}
