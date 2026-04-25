import Image from 'next/image';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'О проекте', href: '/about' },
  { label: 'Образование', href: '/education' },
  { label: 'События', href: '/events' },
  { label: 'Знания', href: '/articles' },
  { label: 'Вакансии', href: '/vacancies' },
  { label: 'Поставщики', href: '/suppliers' },
  { label: 'Партнеры', href: '/partners' }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--background),white_18%)]/95 backdrop-blur">
      <div className="container flex min-h-20 items-center justify-between gap-6">
        <a className="flex items-center gap-3" href="/" aria-label="BARSYNERGY">
          <Image src="/brand/barsynergy-mark.svg" alt="" width={38} height={38} priority />
          <span className="text-lg font-bold tracking-[0.02em]">BARSYNERGY</span>
        </a>
        <nav className="hidden items-center gap-5 text-sm font-semibold text-[var(--muted)] lg:flex">
          {navItems.map((item) => (
            <a className="muted-link" key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden sm:block">
          <Button href="/contacts" variant="secondary">
            Связаться
          </Button>
        </div>
      </div>
    </header>
  );
}
