import { PrismaClient, ContentStatus } from '@prisma/client';

const prisma = new PrismaClient({ log: ['error'] });

async function dumpTable(model, include) {
  const rows = await prisma[model].findMany({ include });
  return rows;
}

async function main() {
  const data = {
    articles: await dumpTable('article', { category: true, tags: { include: { tag: true } } }),
    events: await dumpTable('event', { category: true }),
    suppliers: await dumpTable('supplier', { category: true }),
    generalSponsors: await dumpTable('generalSponsor', {}),
    homepageHero: await dumpTable('homepageHero', {}),
    homepageAudienceCards: await dumpTable('homepageAudienceCard', {}),
    homepageSocialBlocks: await dumpTable('homepageSocialBlock', {}),
    homepageCtaBlock: await dumpTable('homepageCtaBlock', {}),
    homepageCalculatorTeaser: await dumpTable('homepageCalculatorTeaser', {}),
    homepageTestimonials: await dumpTable('homepageTestimonial', {}),
    homepageSteps: await dumpTable('homepageHowItWorksStep', {}),
  };

  console.log(JSON.stringify(data, (key, value) => {
    if (key === 'id') return undefined;
    if (key === 'createdAt') return undefined;
    if (key === 'updatedAt') return undefined;
    if (key === 'createdById') return undefined;
    if (key === 'updatedById') return undefined;
    if (key === 'coverImageId') return undefined;
    if (key === 'imageId') return undefined;
    if (key === 'categoryId') return undefined;
    if (key === 'cityId') return undefined;
    if (key === 'sponsorId') return undefined;
    if (key === 'articleId') return undefined;
    if (key === 'tagId') return undefined;
    if (key === 'category') return value ? value.name : undefined;
    if (key === 'tag') return value ? value.name : undefined;
    if (key === 'tags') return Array.isArray(value) ? value.map(t => t.tag.name) : undefined;
    if (key === 'city') return value ? value.name : undefined;
    if (key === 'article') return undefined;
    if (key === 'coverImage') return undefined;
    if (key === 'image') return undefined;
    if (key === 'createdBy') return undefined;
    if (key === 'updatedBy') return undefined;
    return value;
  }, 2));
}

main()
  .catch(e => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
