import { ConversationSender } from '@prisma/client';

type UnreadBadgeProps = {
  count: number;
  className?: string;
};

export function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      aria-label={`${count} непрочитанных`}
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-[11px] font-semibold leading-none text-[var(--accent-contrast)] ${className ?? ''}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function getSenderInitials(name: string | null, role: ConversationSender): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  switch (role) {
    case ConversationSender.USER: return 'У';
    case ConversationSender.BUSINESS: return 'К';
    case ConversationSender.ADMIN: return 'А';
  }
}
