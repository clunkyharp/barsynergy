/**
 * @deprecated — use page-hero/index.ts
 * Backward-compatible re-export. All pages using old API continue to work
 * via internal prop mapping in page-hero/page-hero.tsx.
 * TODO: remove 2026-07-15
 */
export { PageHero } from './page-hero/index';
export type {
  PageHeroProps,
  PageHeroTone,
  PageHeroChip,
  PageHeroStat,
  PageHeroBenefit,
  Action,
  BreadcrumbItem,
  BottomSection,
  Media
} from './page-hero/index';
