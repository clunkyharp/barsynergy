import { Manrope, Playfair_Display } from 'next/font/google';

export const bodyFont = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

export const displayFont = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  weight: ['600', '700', '800'],
  display: 'swap'
});

export const accentFont = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700'],
  display: 'swap'
});
