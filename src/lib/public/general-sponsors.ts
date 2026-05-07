import { ContentStatus, FileVisibility } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getPublicFileUrl } from '@/lib/storage/public-url';

export type GeneralSponsorContact = {
  name: string;
  phone: string;
  href: string;
};

export type GeneralSponsorLinkKind = 'email' | 'instagram' | 'telegram' | 'website' | 'whatsapp';

export type GeneralSponsorLink = {
  kind: GeneralSponsorLinkKind;
  label: string;
  href: string;
  value: string;
};

export type GeneralSponsor = {
  id: string;
  name: string;
  status: string;
  title: string;
  shortDescription: string;
  description: string;
  venueValue: string[];
  supplyGroups: string[];
  brands: string[];
  contacts: GeneralSponsorContact[];
  links: GeneralSponsorLink[];
  logoSrc?: string;
  logoAlt: string;
  brandLogos: {
    src: string;
    alt: string;
  }[];
};

type SponsorFile = {
  fileKey: string;
  bucket: string | null;
  visibility: FileVisibility;
} | null;

function publicImageUrl(file: SponsorFile, fallbackPath?: string | null) {
  if (file?.visibility === FileVisibility.PUBLIC) {
    return getPublicFileUrl({
      fileKey: file.fileKey,
      bucket: file.bucket ?? undefined,
      visibility: 'public'
    });
  }

  return fallbackPath?.trim() || undefined;
}

function splitList(value?: string | null) {
  return (value ?? '')
    .split(/\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLoose(value?: string | null) {
  return (value ?? '')
    .split(/\s*\/\s*|\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeRussianPhoneWhatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('8')) {
    return `https://wa.me/7${digits.slice(1)}`;
  }

  if (digits.length === 10 && digits.startsWith('9')) {
    return `https://wa.me/7${digits}`;
  }

  if (digits.length > 0) {
    return `https://wa.me/${digits}`;
  }

  return undefined;
}

function normalizeExternalHref(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function normalizeInstagramHref(value: string) {
  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const handle = trimmed.replace(/^@/, '').replace(/^instagram\.com\//i, '').replace(/\/$/, '');

  return handle ? `https://instagram.com/${handle}` : undefined;
}

function normalizeTelegramHref(value: string) {
  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const handle = trimmed.replace(/^@/, '').replace(/^t\.me\//i, '').replace(/\/$/, '');

  return handle ? `https://t.me/${handle}` : undefined;
}

function normalizeWhatsappHref(value: string) {
  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('8')) {
    return `https://wa.me/7${digits.slice(1)}`;
  }

  if (digits.length === 10 && digits.startsWith('9')) {
    return `https://wa.me/7${digits}`;
  }

  if (digits.length > 0) {
    return `https://wa.me/${digits}`;
  }

  return undefined;
}

function sponsorLink(kind: GeneralSponsorLinkKind, label: string, rawValue?: string | null, href?: string) {
  const value = rawValue?.trim();
  const normalizedHref = href?.trim();

  if (!value || !normalizedHref) {
    return undefined;
  }

  return { kind, label, href: normalizedHref, value };
}

function sponsorTitle(brands: string[]) {
  if (brands.length === 0) {
    return 'Генеральный партнёр BARSYNERGY';
  }

  return `Официальные представители ${brands.slice(0, 2).join(' и ')}`;
}

const representedBrandLogos: Record<string, { src: string; alt: string }> = {
  agrobar: {
    src: '/brand/sponsors/agrobar-logo.png',
    alt: 'Логотип Agrobar'
  }
};

function brandLogoKey(brand: string) {
  return brand.toLocaleLowerCase('ru').replace(/[^a-zа-яё0-9]+/gi, '');
}

function resolveRepresentedBrandLogos(brands: string[]) {
  return brands
    .map((brand) => representedBrandLogos[brandLogoKey(brand)])
    .filter(Boolean);
}

export async function getPublishedGeneralSponsors(limit?: number): Promise<GeneralSponsor[]> {
  const sponsors = await prisma.generalSponsor.findMany({
    where: { status: ContentStatus.PUBLISHED },
    orderBy: [{ isFeatured: 'desc' }, { priority: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    include: {
      logoImage: { select: { fileKey: true, bucket: true, visibility: true } },
      coverImage: { select: { fileKey: true, bucket: true, visibility: true } }
    }
  });

  return sponsors.map((sponsor) => {
    const brands = splitList(sponsor.representedBrands);
    const names = splitLoose(sponsor.contactName);
    const phones = splitLoose(sponsor.contactPhone);
    const contacts = phones.flatMap((phone, index) => {
      const href = normalizeRussianPhoneWhatsappHref(phone);

      return href
        ? [{
            name: names[index] ?? names[0] ?? 'Контакт',
            phone,
            href
          }]
        : [];
    });
    const links = [
      sponsorLink('telegram', 'Telegram', sponsor.telegramUrl, sponsor.telegramUrl ? normalizeTelegramHref(sponsor.telegramUrl) : undefined),
      sponsorLink('whatsapp', 'WhatsApp', sponsor.whatsappUrl, sponsor.whatsappUrl ? normalizeWhatsappHref(sponsor.whatsappUrl) : undefined),
      sponsorLink('email', 'Email', sponsor.contactEmail, sponsor.contactEmail ? `mailto:${sponsor.contactEmail.trim()}` : undefined),
      sponsorLink('website', 'Сайт', sponsor.websiteUrl, sponsor.websiteUrl ? normalizeExternalHref(sponsor.websiteUrl) : undefined),
      sponsorLink('instagram', 'Instagram', sponsor.instagramUrl, sponsor.instagramUrl ? normalizeInstagramHref(sponsor.instagramUrl) : undefined)
    ].filter(Boolean) as GeneralSponsorLink[];

    return {
      id: sponsor.id,
      name: sponsor.name,
      status: sponsor.seasonLabel ?? 'Генеральный спонсор',
      title: sponsorTitle(brands),
      shortDescription: sponsor.shortDescription,
      description: sponsor.fullDescription,
      venueValue: splitList(sponsor.benefitsForVenues),
      supplyGroups: [],
      brands,
      contacts,
      links,
      logoSrc: publicImageUrl(sponsor.logoImage, sponsor.logoPath),
      logoAlt: `Логотип ${sponsor.name}`,
      brandLogos: resolveRepresentedBrandLogos(brands)
    };
  });
}
