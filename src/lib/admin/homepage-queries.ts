import { prisma } from '@/lib/db/prisma';

export type HomepageCmsData = {
  heroes: Awaited<ReturnType<typeof getHomepageCmsData>>['heroes'];
  audienceCards: Awaited<ReturnType<typeof getHomepageCmsData>>['audienceCards'];
  socialBlocks: Awaited<ReturnType<typeof getHomepageCmsData>>['socialBlocks'];
  ctaBlocks: Awaited<ReturnType<typeof getHomepageCmsData>>['ctaBlocks'];
  calculatorTeasers: Awaited<ReturnType<typeof getHomepageCmsData>>['calculatorTeasers'];
  generalSponsors: Awaited<ReturnType<typeof getHomepageCmsData>>['generalSponsors'];
};

export async function getHomepageCmsData() {
  const [heroes, audienceCards, socialBlocks, ctaBlocks, calculatorTeasers, generalSponsors] = await Promise.all([
    prisma.homepageHero.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.homepageAudienceCard.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.homepageSocialBlock.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.homepageCtaBlock.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.homepageCalculatorTeaser.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.generalSponsor.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }], take: 6 })
  ]);

  return { heroes, audienceCards, socialBlocks, ctaBlocks, calculatorTeasers, generalSponsors };
}
