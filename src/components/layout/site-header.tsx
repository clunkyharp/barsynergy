import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { MobileSiteMenu } from '@/components/layout/mobile-site-menu';

const navItems = [
  { label: 'О проекте', href: '/about' },
  { label: 'Образование', href: '/education' },
  { label: 'События', href: '/events' },
  { label: 'Знания', href: '/articles' },
  { label: 'Вакансии', href: '/vacancies' },
  { label: 'Поставщики', href: '/suppliers' },
  { label: 'Партнеры', href: '/partners' },
  { label: 'Контакты', href: '/contacts' }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/20 bg-[color-mix(in_oklab,var(--background),white_20%)]/95 backdrop-blur">
      <div className="container flex min-h-[72px] items-center justify-between gap-6">
        <a className="flex items-center gap-3" href="/" aria-label="BARSYNERGY">
          <Image
            src="/brand/barsynergy-lockup.svg"
            alt="BARSYNERGY"
            width={178}
            height={42}
            className="h-auto w-[178px]"
            priority
          />
        </a>
        <nav className="hidden items-center gap-6 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text)] xl:flex">
          {navItems.map((item) => (
            <a className="opacity-80 transition hover:opacity-100" key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a
          className="hidden min-h-12 items-center gap-3 border border-[var(--graphite)] bg-[var(--graphite)] px-5 text-sm font-semibold uppercase tracking-[0.06em] text-white transition hover:bg-black xl:inline-flex"
          href="/contacts"
        >
          <span className="text-white">Присоединиться</span>
          <ArrowUpRight className="text-white" size={18} />
        </a>
        <MobileSiteMenu navItems={navItems} />
      </div>
    </header>
  );
}
