export interface CategoryStyle {
  bg: string;
  text: string;
}

const categoryStyles: Record<string, CategoryStyle> = {
  'каппинг': { bg: 'var(--cat-cupping-bg, rgba(255,208,47,0.18))', text: 'var(--cat-cupping-text, #c89b00)' },
  'лекция': { bg: 'var(--cat-lecture-bg, rgba(34,197,94,0.15))', text: 'var(--cat-lecture-text, #15803d)' },
  'чемпионат': { bg: 'var(--cat-champ-bg, rgba(239,68,68,0.15))', text: 'var(--cat-champ-text, #b91c1c)' },
  'мастер-класс': { bg: 'var(--cat-masterclass-bg, rgba(168,85,247,0.15))', text: 'var(--cat-masterclass-text, #7c3aed)' },
  'встреча': { bg: 'var(--cat-meetup-bg, rgba(59,130,246,0.15))', text: 'var(--cat-meetup-text, #1d4ed8)' },
  'обучение': { bg: 'var(--cat-training-bg, rgba(249,115,22,0.15))', text: 'var(--cat-training-text, #c2410c)' }
};

export function getCategoryStyle(label?: string, useDarkFallback = false): CategoryStyle {
  const style = categoryStyles[label?.toLowerCase() ?? ''];
  if (style) return style;
  return useDarkFallback
    ? { bg: 'var(--accent)', text: 'var(--accent-contrast)' }
    : { bg: 'var(--accent-soft)', text: 'var(--accent)' };
}
