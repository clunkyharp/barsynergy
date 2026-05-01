export type GeneralSponsorContact = {
  name: string;
  phone: string;
  href: string;
};

export type GeneralSponsorLink = {
  label: string;
  href: string;
};

export type GeneralSponsor = {
  id: string;
  name: string;
  title: string;
  shortDescription: string;
  description: string;
  supplyGroups: string[];
  brands: string[];
  contacts: GeneralSponsorContact[];
  links: GeneralSponsorLink[];
  logoSrc: string;
  logoAlt: string;
};

export const GENERAL_SPONSORS: GeneralSponsor[] = [
  {
    id: 'hustle-brew',
    name: 'Hustle Brew',
    title: 'Официальные представители KOF и Vérle',
    shortDescription: 'Кофе, какао, концентрированные соки и рабочие поставки для кофеен, баров и HoReCa-команд.',
    description:
      'Hustle Brew работает с кофейным и барным направлением: поставляет кофе, какао, концентрированные соки и позиции для ежедневной работы заведения. Команда представляет KOF и Vérle и помогает быстро собрать поставку под бар, кофейню или учебный формат.',
    supplyGroups: ['Кофе', 'Какао Barry', 'Happy Apple', 'Рабочие поставки для HoReCa'],
    brands: ['KOF', 'Vérle', 'HQ', 'The Welder Catherine', 'Barry', 'Happy Apple'],
    contacts: [
      { name: 'Иса', phone: '8 928 866 70 02', href: 'tel:+79288667002' },
      { name: 'Арсен', phone: '8 989 441 95 95', href: 'tel:+79894419595' }
    ],
    links: [
      { label: 'Instagram', href: 'https://www.instagram.com/hustle.brew?igsh=cXd3MjhtNnJ2ODk0' },
      { label: 'WhatsApp', href: 'https://wa.me/79288667002' }
    ],
    logoSrc: '/brand/sponsors/hustle-brew-logo.png',
    logoAlt: 'Логотип Hustle Brew'
  }
];
