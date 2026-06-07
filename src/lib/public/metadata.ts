import type { Metadata } from 'next';
import type { PublicContentDetail } from '@/modules/content/shared/detail-helpers';

const siteName = 'BARSYNERGY';
const defaultOpenGraphImage = {
  url: '/og-preview.svg',
  width: 1200,
  height: 630,
  alt: 'BARSYNERGY'
};

type PublicPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: {
    url: string;
    alt?: string;
  };
};

type MissingContentMetadataInput = {
  title: string;
  description: string;
};

function compactDescription(value: string) {
  return value.replace(/\s+/g, ' ').trim().slice(0, 300);
}

function openGraphImages(image?: PublicPageMetadataInput['image']) {
  if (!image) {
    return [defaultOpenGraphImage];
  }

  return [
    {
      url: image.url,
      alt: image.alt
    }
  ];
}

export function buildPublicPageMetadata(input: PublicPageMetadataInput): Metadata {
  const description = compactDescription(input.description);
  const images = openGraphImages(input.image);

  return {
    title: input.title,
    description,
    alternates: {
      canonical: input.path
    },
    openGraph: {
      title: input.title,
      description,
      url: input.path,
      siteName,
      images,
      locale: 'ru_RU',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description,
      images: images.map((image) => image.url)
    }
  };
}

export function buildPrivatePageMetadata(input: Omit<PublicPageMetadataInput, 'path' | 'image'>): Metadata {
  return {
    title: input.title,
    description: compactDescription(input.description),
    robots: {
      index: false,
      follow: false
    }
  };
}

export function buildMissingPublicContentMetadata(input: MissingContentMetadataInput): Metadata {
  return {
    title: input.title,
    description: compactDescription(input.description),
    robots: {
      index: false,
      follow: false
    }
  };
}

export function buildPublicContentMetadata(input: {
  detail: PublicContentDetail;
  path: string;
}): Metadata {
  return buildPublicPageMetadata({
    title: input.detail.title,
    description: input.detail.summary,
    path: input.path,
    image: input.detail.imageUrl
      ? {
          url: input.detail.imageUrl.src,
          alt: input.detail.imageUrl.alt
        }
      : undefined
  });
}
