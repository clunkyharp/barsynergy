const legalLinks = [
  { label: 'Политика конфиденциальности', href: '/legal/privacy' },
  { label: 'Согласие на ПДн', href: '/legal/personal-data-consent' },
  { label: 'Условия', href: '/legal/terms' },
  { label: 'Cookies', href: '/legal/cookies' }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--graphite)] py-10 text-white">
      <div className="container grid gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-lg font-bold">BARSYNERGY</p>
          <p className="mt-3 max-w-xl text-sm text-white/68">
            Платформа для образования, событий, контента и деловых возможностей барной индустрии СКФО.
          </p>
        </div>
        <nav className="grid gap-2 text-sm text-white/72">
          {legalLinks.map((item) => (
            <a className="transition hover:text-white" key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
