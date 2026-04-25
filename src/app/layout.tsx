import type { Metadata } from 'next';
import './globals.css';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { bodyFont } from '@/lib/fonts';
import { getEnv } from '@/lib/validation/env';

const env = getEnv();

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: {
    default: 'BARSYNERGY — профессиональная среда барной индустрии СКФО',
    template: '%s | BARSYNERGY'
  },
  description:
    'BARSYNERGY объединяет образование, события, знания, вакансии, поставщиков и партнерские возможности для профессионалов барной индустрии СКФО.',
  openGraph: {
    title: 'BARSYNERGY',
    description:
      'Профессиональная онлайн-платформа и образовательное комьюнити для барной индустрии СКФО.',
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
    <html lang="ru">
      <body className={bodyFont.className}>
        <div className="site-shell">
          <SiteHeader />
          <main className="site-main">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
