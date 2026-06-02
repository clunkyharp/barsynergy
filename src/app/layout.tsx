import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { CookieNotice } from '@/components/public/cookie-notice';
import { ViewportReveal } from '@/components/public/viewport-reveal';
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button';
import { JsonLd } from '@/components/seo/json-ld';
import { ServerInsertedScript } from '@/components/seo/server-inserted-script';
import { ToastProvider } from '@/components/ui/toast';
import { bodyFont } from '@/lib/fonts';
import { buildSiteJsonLd } from '@/lib/public/structured-data';
import { getEnv } from '@/lib/validation/env';

const env = getEnv();
const themeInitScript = `
  try {
    var storedTheme = window.localStorage.getItem('barsynergy-theme');
    var theme = storedTheme === 'dark' || storedTheme === 'light'
      ? storedTheme
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
`;

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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html data-scroll-behavior="smooth" lang="ru" suppressHydrationWarning>
      <body className={bodyFont.className}>
        <ServerInsertedScript
          html={themeInitScript}
          id="barsynergy-theme-init"
          nonce={nonce}
        />
        <JsonLd data={buildSiteJsonLd()} />
        <ToastProvider>
          <div className="site-shell overflow-x-clip">
            <SiteHeader />
            <main className="site-main overflow-x-hidden w-full max-w-full">{children}</main>
            <SiteFooter />
            <ViewportReveal />
            <ScrollToTopButton />
            <CookieNotice />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
