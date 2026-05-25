import { Noto_Sans, Noto_Serif_Display } from 'next/font/google';

export const bodyFont = Noto_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

export const displayFont = Noto_Serif_Display({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700', '800'],
  display: 'swap'
});

export const accentFont = Noto_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700'],
  display: 'swap'
});
