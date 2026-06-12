import localFont from 'next/font/local';
import { Manrope } from 'next/font/google';

export const bodyFont = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap'
});

export const displayFont = localFont({
  src: [
    {
      path: '../../public/fonts/lebowski-regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../../public/fonts/lebowski-regular.woff',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../../public/fonts/lebowski-regular.ttf',
      weight: '400',
      style: 'normal'
    }
  ],
  display: 'swap',
  variable: '--font-lebowski'
});

export const accentFont = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700', '800'],
  display: 'swap'
});
