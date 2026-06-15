'use client';

import { HeroActions } from '@/components/public/hero-actions';

export function MastersHeroActions() {
  const scrollTo = (hash: string) => {
    window.location.hash = hash;
  };

  return (
    <HeroActions
      primaryLabel="Стать мастером"
      secondaryLabel="Смотреть каталог"
      onPrimaryClick={() => scrollTo('master-submission')}
      onSecondaryClick={() => scrollTo('masters-list')}
    />
  );
}
