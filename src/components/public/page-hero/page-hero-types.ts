import type { ReactNode } from 'react';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type Action = {
  label: string;
  href: string;
  kind?: 'primary' | 'secondary';
};

export type PageHeroTone = 'dark' | 'graphite' | 'light-editorial';
export type PageHeroDensity = 'default' | 'compact';

// Bottom section — discriminated union
export type BottomSectionChips = {
  kind: 'chips';
  items: { label: string; href: string }[];
};

export type BottomSectionStats = {
  kind: 'stats';
  items: { value: string; label: string }[];
};

export type BottomSectionBenefits = {
  kind: 'benefits';
  items: { title: string; description: string }[];
};

export type BottomSectionSlot = {
  kind: 'slot';
  children: ReactNode;
};

export type BottomSection =
  | BottomSectionChips
  | BottomSectionStats
  | BottomSectionBenefits
  | BottomSectionSlot;

// Media — discriminated union
export type MediaImage = {
  kind: 'image';
  src: string;
  alt: string;
};

export type MediaSlot = {
  kind: 'slot';
  children: ReactNode;
};

export type Media = MediaImage | MediaSlot;

// New API
export type PageHeroProps = {
  breadcrumbs?: BreadcrumbItem[];
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: readonly [Action, Action?];
  children?: ReactNode;
  bottom?: BottomSection;
  media?: Media;
  tone: PageHeroTone;
  density?: PageHeroDensity;
};

// Old API (deprecated — mapped to new internally)
export type PageHeroChip = {
  label: string;
  href: string;
};

export type PageHeroStat = {
  value: string;
  label: string;
};

export type PageHeroBenefit = {
  title: string;
  description: string;
};
