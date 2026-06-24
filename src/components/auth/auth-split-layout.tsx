import Image from 'next/image';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';

type AuthSplitLayoutProps = {
  children: ReactNode;
};

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="auth-login-screen flex min-h-screen items-center justify-center bg-[var(--background)] px-5 py-12">
      <div className="w-full max-w-[420px]">

        {/* Logo + back link */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <AppLink href="/">
            <Image
              alt="BARSYNERGY"
              className="h-auto w-[176px] theme-logo-light md:w-[198px]"
              height={31}
              priority
              src="/brand/barsynergy-lockup.svg"
              width={360}
            />
            <Image
              alt="BARSYNERGY"
              className="h-auto w-[176px] theme-logo-dark md:w-[198px]"
              height={31}
              priority
              src="/brand/barsynergy-lockup-light.svg"
              width={360}
            />
          </AppLink>
          <AppLink className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-ink)]" href="/">
            <ArrowLeft aria-hidden size={15} strokeWidth={1.8} />
            На сайт
          </AppLink>
        </div>

        {children}
      </div>
    </div>
  );
}
