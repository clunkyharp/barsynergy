import { revalidatePath } from 'next/cache';
import { revalidateHomepageCache } from '@/lib/public/home';

type DetailRevalidationInput = {
  detailBasePath: string;
  currentSlug?: string | null;
  previousSlug?: string | null;
};

function revalidateDetailPaths({ detailBasePath, currentSlug, previousSlug }: DetailRevalidationInput) {
  if (previousSlug) {
    revalidatePath(`${detailBasePath}/${previousSlug}`);
  }

  if (currentSlug && currentSlug !== previousSlug) {
    revalidatePath(`${detailBasePath}/${currentSlug}`);
  }
}

type PublicContentRevalidationInput = {
  listingPath: string;
  detailBasePath?: string;
  currentSlug?: string | null;
  previousSlug?: string | null;
  revalidateSearch?: boolean;
  revalidateHome?: boolean;
};

function revalidatePublicContentPaths({
  listingPath,
  detailBasePath,
  currentSlug,
  previousSlug,
  revalidateSearch = true,
  revalidateHome = true
}: PublicContentRevalidationInput) {
  revalidatePath(listingPath);

  if (detailBasePath) {
    revalidateDetailPaths({ detailBasePath, currentSlug, previousSlug });
  }

  if (revalidateSearch) {
    revalidatePath('/search');
  }

  if (revalidateHome) {
    revalidateHomepageCache();
    revalidatePath('/');
  }
}

export function revalidateArticlePublicPaths(currentSlug?: string | null, previousSlug?: string | null) {
  revalidatePublicContentPaths({
    listingPath: '/articles',
    detailBasePath: '/articles',
    currentSlug,
    previousSlug
  });
}

export function revalidateCoursePublicPaths(currentSlug?: string | null, previousSlug?: string | null) {
  revalidatePublicContentPaths({
    listingPath: '/education',
    detailBasePath: '/education',
    currentSlug,
    previousSlug
  });
}

export function revalidateEventPublicPaths(currentSlug?: string | null, previousSlug?: string | null) {
  revalidatePublicContentPaths({
    listingPath: '/events',
    detailBasePath: '/events',
    currentSlug,
    previousSlug
  });
}

export function revalidatePartnerPublicPaths(currentSlug?: string | null, previousSlug?: string | null) {
  revalidatePublicContentPaths({
    listingPath: '/partners',
    detailBasePath: '/partners',
    currentSlug,
    previousSlug
  });
}

export function revalidateSupplierPublicPaths(currentSlug?: string | null, previousSlug?: string | null) {
  revalidatePublicContentPaths({
    listingPath: '/suppliers',
    detailBasePath: '/suppliers',
    currentSlug,
    previousSlug
  });
}

export function revalidateMasterPublicPaths(currentSlug?: string | null, previousSlug?: string | null) {
  revalidatePublicContentPaths({
    listingPath: '/masters',
    detailBasePath: '/masters',
    currentSlug,
    previousSlug
  });
}

export function revalidateVacancyPublicPaths(currentSlug?: string | null, previousSlug?: string | null) {
  revalidatePublicContentPaths({
    listingPath: '/vacancies',
    detailBasePath: '/vacancies',
    currentSlug,
    previousSlug
  });
}

export function revalidateGeneralSponsorPublicPaths() {
  revalidatePublicContentPaths({
    listingPath: '/general-sponsors',
    revalidateSearch: false
  });
}
