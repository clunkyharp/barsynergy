import type { ApplicationStatus } from '@prisma/client';
import { applicationStatusLabels, applicationStatusBadgeVariants } from '@/lib/admin/application-utils';
import { StatusBadge } from '@/components/ui/status-badge';

type ConversationHeaderProps = {
  interlocutorName: string;
  contextLabel: string;
  status: ApplicationStatus;
  messageCount: number;
};

export function ConversationHeader({
  interlocutorName,
  contextLabel,
  status,
  messageCount
}: ConversationHeaderProps) {
  const statusLabel = applicationStatusLabels[status];
  const badgeVariant = applicationStatusBadgeVariants[status];

  return (
    <header className="border-b border-[var(--line)] px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-[16px] font-semibold leading-tight text-[var(--text)]">
            {interlocutorName}
          </h2>
          <p className="mt-0.5 truncate text-[13px] text-[var(--muted)]">
            {contextLabel}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge variant={badgeVariant}>{statusLabel}</StatusBadge>
          <span className="text-[12px] text-[var(--muted)]">
            {messageCount} сообщ.
          </span>
        </div>
      </div>
    </header>
  );
}
