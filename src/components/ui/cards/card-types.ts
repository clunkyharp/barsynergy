export type CardAction = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
};

export type CardActionList = readonly [CardAction, CardAction?];

export type CardMediaLogo = {
  kind: 'logo';
  src?: string;
  alt?: string;
  initials?: string;
};

export type CardMediaImage = {
  kind: 'image';
  src?: string;
  alt?: string;
};

export type CardMediaNone = {
  kind: 'none';
};

export type CardMedia = CardMediaLogo | CardMediaImage | CardMediaNone;

export type CardDensity = 'comfortable' | 'compact';

export type CardTone = 'light' | 'dark';
