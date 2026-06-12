'use client';

import Image from 'next/image';
import { LogOut, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, useDropdownMenu } from '@/components/ui/dropdown-menu';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

type AccountMenuProps = {
  user: {
    id: string;
    email: string;
    role: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  logoutAction: () => Promise<void>;
};

const focusClassName = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';

function LogoutForm({ logoutAction }: { logoutAction: () => Promise<void> }) {
  const { closeMenu } = useDropdownMenu();

  return (
    <form
      action={async () => {
        closeMenu();
        await logoutAction();
      }}
    >
      <button
        className="flex w-full min-h-11 items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-[13px] font-semibold text-[var(--text)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-[var(--surface-muted)] hover:text-[var(--accent-strong)] motion-reduce:transition-none"
        role="menuitem"
        type="submit"
      >
        <LogOut aria-hidden size={15} strokeWidth={1.8} />
        Выйти
      </button>
    </form>
  );
}

function getMenuItems(role: string) {
  if (role === 'USER') {
    return [
      { label: 'Профиль', href: '/profile' },
      { label: 'Мои отклики', href: '/profile/responses' }
    ] as const;
  }

  if (role === 'BUSINESS') {
    return [
      { label: 'Кабинет компании', href: '/business/cabinet' },
      { label: 'Заявки', href: '/business/cabinet/requests' }
    ] as const;
  }

  if (role === 'ADMIN' || role === 'MODERATOR') {
    return [
      { label: 'Админ-панель', href: '/admin' }
    ] as const;
  }

  return [] as const;
}

export function AccountMenu({ user, logoutAction }: AccountMenuProps) {
  const router = useRouter();
  const items = getMenuItems(user.role);
  const initials = user.displayName
    ? user.displayName.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2)
    : null;

  return (
    <DropdownMenu align="end" minWidth={200}>
      <DropdownMenuTrigger
        aria-label="Открыть меню аккаунта"
        className={cn(
          'inline-flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] px-2 text-[12px] font-semibold text-inherit transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-[rgba(255,253,249,0.12)] motion-reduce:transition-none overflow-hidden',
          focusClassName
        )}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:scale-110 motion-reduce:transition-none">
          {user.avatarUrl ? (
            <Image
              alt=""
              className="h-full w-full object-cover"
              height={28}
              src={user.avatarUrl}
              width={28}
            />
          ) : initials ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[11px] font-bold text-[var(--accent)]">
              {initials}
            </span>
          ) : (
            <UserRound size={16} strokeWidth={1.8} />
          )}
        </span>
        <span className="hidden 2xl:inline">{user.displayName || user.email}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[200px] rounded-[var(--radius-md)] border border-[var(--card-border)] bg-[var(--surface-elevated)] p-2 shadow-[var(--shadow-panel)]">
        <div className="border-b border-[var(--line)] pb-2 mb-1 px-3 py-2">
          <p className="text-[13px] font-semibold text-[var(--text)] truncate">
            {user.displayName || user.email}
          </p>
          <p className="text-[11px] text-[var(--muted)] mt-0.5 truncate">{user.email}</p>
        </div>
        {items.map((item) => (
          <AppLink
            className="flex min-h-11 items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-[13px] font-semibold text-[var(--text)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-[var(--surface-muted)] hover:text-[var(--accent-strong)] motion-reduce:transition-none"
            href={item.href}
            key={item.href}
            role="menuitem"
            onClick={() => router.push(item.href)}
          >
            {item.label}
          </AppLink>
        ))}
        <div className="border-t border-[var(--line)] pt-1 mt-1">
          <LogoutForm logoutAction={logoutAction} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
