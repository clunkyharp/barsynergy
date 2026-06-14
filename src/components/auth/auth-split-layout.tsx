import Image from 'next/image';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowUpRight, BookOpen, BriefcaseBusiness, GraduationCap, PackageCheck } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';

type AuthSplitLayoutProps = {
  children: ReactNode;
};

const highlights = [
  { icon: BriefcaseBusiness, text: 'Вакансии для команд СКФО' },
  { icon: GraduationCap, text: 'Обучение и интенсивы' },
  { icon: PackageCheck, text: 'Каталог поставщиков' },
  { icon: BookOpen, text: 'Материалы и кейсы' },
];

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="auth-login-screen flex min-h-screen">
      {/* Left — dark brand panel */}
      <aside className="hidden w-[480px] shrink-0 flex-col justify-between bg-[var(--editorial-dark-surface)] p-10 xl:flex" data-theme="dark">
        <div>
          <AppLink href="/">
            <Image
              alt="BARSYNERGY"
              className="h-auto w-[180px]"
              height={35}
              priority
              src="/brand/barsynergy-lockup-light.svg"
              width={360}
            />
          </AppLink>
          <div
            aria-hidden="true"
            className="mb-8 mt-10 aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-xl)] bg-cover bg-center opacity-90"
            style={{ backgroundImage: 'url("/images/home/hero-coffee-counter-haberdoedas.jpg")' }}
          />
          <div className="grid gap-4">
            {highlights.map((item) => (
              <div className="flex items-center gap-3 text-[var(--editorial-dark-text)]" key={item.text}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)]/20">
                  <item.icon aria-hidden className="text-[var(--accent)]" size={16} strokeWidth={1.5} />
                </span>
                <span className="text-sm font-medium leading-5">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <blockquote className="border-l-2 border-[var(--accent)] pl-4">
          <p className="text-sm leading-6 text-[var(--editorial-dark-muted)]">
            Платформа для барной индустрии Северного Кавказа.
          </p>
          <AppLink className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]" href="/about">
            О проекте
            <ArrowUpRight size={12} strokeWidth={1.8} />
          </AppLink>
        </blockquote>
      </aside>

      {/* Right — form column */}
      <main className="flex flex-1 items-center justify-center bg-[var(--background)] px-5 py-8 md:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-6 xl:hidden">
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
            <AppLink className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]" href="/">
              <ArrowLeft aria-hidden size={15} strokeWidth={1.8} />
              Вернуться на сайт
            </AppLink>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
