import Image from 'next/image';

export type SectionIconType =
  | 'events'
  | 'education'
  | 'vacancies'
  | 'articles'
  | 'calculator'
  | 'suppliers'
  | 'handshake'
  | 'building'
  | 'search'
  | 'star'
  | 'user'
  | 'chart'
  | 'megaphone'
  | 'location'
  | 'contact'
  | 'sponsor'
  | 'coffee'
  | 'coffee-bean'
  | 'espresso'
  | 'dripper';

const ICON_PATHS: Record<SectionIconType, string> = {
  events:    '/icons/section/icon-calendar-events.png',
  education: '/icons/section/icon-education-cap.png',
  vacancies: '/icons/section/icon-briefcase-vacancies.png',
  articles:  '/icons/section/icon-article-document.png',
  calculator:'/icons/section/icon-calculator-pricing.png',
  suppliers: '/icons/section/icon-package-supplier.png',
  handshake: '/icons/section/icon-handshake-partnership.png',
  building:  '/icons/section/icon-building-business.png',
  search:    '/icons/section/icon-search.png',
  star:      '/icons/section/icon-star-featured.png',
  user:      '/icons/section/icon-user-profile.png',
  chart:     '/icons/section/icon-chart-analytics.png',
  megaphone: '/icons/section/icon-megaphone-announcements.png',
  location:  '/icons/section/icon-location-pin.png',
  contact:   '/icons/section/icon-message-contact.png',
  sponsor:   '/icons/section/icon-crown-sponsor.png',
  coffee:    '/icons/section/icon-coffee-cup.png',
  'coffee-bean': '/icons/section/icon-coffee-bean.png',
  espresso:  '/icons/section/icon-espresso-machine.png',
  dripper:   '/icons/section/icon-dripper-brewing.png',
};

export function SectionIcon({
  type,
  size = 40,
  className,
}: {
  type: SectionIconType;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={`block rounded-[18%] ${className ?? ''}`}
      height={size}
      src={ICON_PATHS[type]}
      width={size}
    />
  );
}
