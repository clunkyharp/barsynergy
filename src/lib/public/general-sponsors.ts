import { ContentStatus, FileVisibility } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getPublicFileUrl } from '@/lib/storage/public-url';

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

function phoneHref(phone: string) {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('8')) {
    return `tel:+7${digits.slice(1)}`;
  }

  if (digits.length > 0) {
    return `tel:+${digits}`;
  }

  return `tel:${phone}`;
}

function sponsorTitle(brands: string[]) {
  if (brands.length === 0) {
    return 'Генеральный партнёр BARSYNERGY';
  }

  return `Официальные представители ${brands.slice(0, 2).join(' и ')}`;
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
    const contacts = phones.map((phone, index) => ({
      name: names[index] ?? sponsor.contactName ?? 'Контакт',
      phone,
      href: phoneHref(phone)
    }));
    const links = [
      sponsor.websiteUrl ? { label: 'Сайт', href: sponsor.websiteUrl } : undefined,
      sponsor.instagramUrl ? { label: 'Instagram', href: sponsor.instagramUrl } : undefined,
      sponsor.whatsappUrl ? { label: 'WhatsApp', href: sponsor.whatsappUrl } : undefined,
      sponsor.telegramUrl ? { label: 'Telegram', href: sponsor.telegramUrl } : undefined,
      sponsor.contactEmail ? { label: 'Email', href: `mailto:${sponsor.contactEmail}` } : undefined
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
      logoAlt: `Логотип ${sponsor.name}`
    };
  });
}
