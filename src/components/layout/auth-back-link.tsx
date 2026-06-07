import { ArrowLeft } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';

/**
 * "← Вернуться на сайт" for full-screen auth pages (login, register/user).
 * Absolutely positioned top-left, z-10 so it clears the form container.
 */
export function AuthBackLink() {
  return (
    <AppLink
      className="absolute top-4 left-4 z-10 sm:top-5 sm:left-6 inline-flex min-h-10 items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      href="/"
    >
      <ArrowLeft aria-hidden size={14} strokeWidth={1.8} />
      Вернуться на сайт
    </AppLink>
  );
}
