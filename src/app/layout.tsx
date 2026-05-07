import type { Metadata } from 'next';
import './globals.css';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { CookieNotice } from '@/components/public/cookie-notice';
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button';
import { bodyFont } from '@/lib/fonts';
import { getEnv } from '@/lib/validation/env';

const env = getEnv();

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: {
    default: 'BARSYNERGY: барная индустрия СКФО',
    template: '%s | BARSYNERGY'
  },
  description:
    'Платформа для барной индустрии СКФО: обучение, события, статьи, вакансии, поставщики и партнёрские запросы.',
  openGraph: {
    title: 'BARSYNERGY',
    description:
      'Обучение, события, вакансии и рабочие контакты для барной индустрии СКФО.',
    url: env.APP_URL,
    siteName: 'BARSYNERGY',
    images: [{ url: '/og-preview.svg', width: 1200, height: 630 }],
    locale: 'ru_RU',
    type: 'website'
  },
  alternates: {
    canonical: env.APP_URL
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="ru" suppressHydrationWarning>
      <body className={bodyFont.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var storedTheme = window.localStorage.getItem('barsynergy-theme');
                var theme = storedTheme === 'dark' || storedTheme === 'light'
                  ? storedTheme
                  : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.dataset.theme = theme;
                document.documentElement.style.colorScheme = theme;
              } catch (_) {}
            `
          }}
        />
        <div className="site-shell overflow-x-clip">
          <SiteHeader />
          <main className="site-main overflow-x-hidden w-full max-w-full">{children}</main>
          <SiteFooter />
          <ScrollToTopButton />
          <CookieNotice />
        </div>
      </body>
    </html>
  );
}
