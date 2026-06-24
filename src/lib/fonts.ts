import { Unbounded } from 'next/font/google';

export const bodyFont = {
  className: 'font-body'
};

export const displayFont = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-display'
});

export const accentFont = bodyFont;
