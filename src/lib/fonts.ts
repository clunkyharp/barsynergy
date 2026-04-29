import { Oswald, Outfit } from 'next/font/google';

export const bodyFont = Outfit({
  subsets: ['latin', 'latin-ext']
});

export const displayFont = Oswald({
  subsets: ['latin', 'cyrillic']
});
