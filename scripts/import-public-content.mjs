import { PrismaClient, ContentStatus } from '@prisma/client';
import { readFileSync } from 'fs';

const prisma = new PrismaClient({ log: ['error'] });
const data = JSON.parse(readFileSync(new URL('./public-content-import.json', import.meta.url), 'utf-8'));

let imported = 0;
let skipped = 0;

async function upsertArticle(item) {
  const existing = await prisma.article.findUnique({ where: { slug: item.slug } });
  if (existing) { skipped++; return; }
  const catSlug = item.category;
  const category = catSlug ? await prisma.category.findUnique({ where: { slug_type: { slug: catSlug, type: 'ARTICLE' } } }) : null;
  const tagNames = item.tags || [];
  const tagIds = [];
  for (const name of tagNames) {
    const slug = name.toLowerCase().replace(/[^a-zа-яё0-9]+/g, '-').replace(/^-|-$/g, '');
    let tag = await prisma.tag.findUnique({ where: { slug_type: { slug, type: 'ARTICLE' } } });
    if (!tag) tag = await prisma.tag.create({ data: { name, slug, type: 'ARTICLE' } });
    tagIds.push(tag.id);
  }
  await prisma.article.create({
    data: {
      title: item.title, slug: item.slug, summary: item.summary, body: item.body,
      status: item.status || 'PUBLISHED', coverImageAlt: item.coverImageAlt,
      sortOrder: item.sortOrder ?? 0, publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
      readingTimeMinutes: item.readingTimeMinutes, authorName: item.authorName,
      sourceLabel: item.sourceLabel, sourceReferences: item.sourceReferences,
      categoryId: category?.id,
      tags: { create: tagIds.map(tagId => ({ tagId })) }
    }
  });
  imported++;
}

async function upsertEvent(item) {
  const existing = await prisma.event.findUnique({ where: { slug: item.slug } });
  if (existing) { skipped++; return; }
  const catSlug = item.category;
  const category = catSlug ? await prisma.category.findUnique({ where: { slug_type: { slug: catSlug, type: 'EVENT' } } }) : null;
  await prisma.event.create({
    data: {
      title: item.title, slug: item.slug, summary: item.summary,
      status: item.status || 'PUBLISHED', coverImageAlt: item.coverImageAlt,
      sortOrder: item.sortOrder ?? 0, publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
      startsAt: new Date(item.startsAt), endsAt: item.endsAt ? new Date(item.endsAt) : null,
      locationName: item.locationName, address: item.address, format: item.format,
      capacity: item.capacity, registrationMode: item.registrationMode, registrationUrl: item.registrationUrl,
      categoryId: category?.id
    }
  });
  imported++;
}

async function upsertSupplier(item) {
  const existing = await prisma.supplier.findUnique({ where: { slug: item.slug } });
  if (existing) { skipped++; return; }
  const catSlug = item.category;
  const category = catSlug ? await prisma.category.findUnique({ where: { slug_type: { slug: catSlug, type: 'SUPPLIER' } } }) : null;
  await prisma.supplier.create({
    data: {
      companyName: item.companyName, slug: item.slug, summary: item.summary, description: item.description,
      contactPerson: item.contactPerson, phone: item.phone, email: item.email,
      websiteUrl: item.websiteUrl, address: item.address,
      isVerified: item.isVerified ?? false, status: item.status || 'PUBLISHED',
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
      categoryId: category?.id,
      paymentMethods: item.paymentMethods, minOrder: item.minOrder, deliveryInfo: item.deliveryInfo
    }
  });
  imported++;
}

async function upsertSponsor(item) {
  const existing = await prisma.generalSponsor.findUnique({ where: { slug: item.slug } });
  if (existing) { skipped++; return; }
  await prisma.generalSponsor.create({
    data: {
      name: item.name, slug: item.slug, description: item.description,
      websiteUrl: item.websiteUrl, logoPath: item.logoPath,
      sortOrder: item.sortOrder ?? 0, isActive: item.isActive ?? true,
      publishedAt: new Date()
    }
  });
  imported++;
}

async function upsertHomepageItems(table, items, transform) {
  for (const item of items) {
    await prisma[table].create({ data: { ...transform(item), createdAt: new Date(), updatedAt: new Date() } });
    imported++;
  }
}

async function main() {
  for (const a of data.articles || []) await upsertArticle(a);
  for (const e of data.events || []) await upsertEvent(e);
  for (const s of data.suppliers || []) await upsertSupplier(s);
  for (const s of data.sponsors || []) await upsertSponsor(s);

  const hpModels = {
    homepageHero: { status: ContentStatus.PUBLISHED, publishedAt: new Date() },
    homepageAudienceCard: { status: ContentStatus.PUBLISHED, publishedAt: new Date() },
    homepageSocialBlock: { status: ContentStatus.PUBLISHED, publishedAt: new Date() },
    homepageCtaBlock: { status: ContentStatus.PUBLISHED, publishedAt: new Date() },
    homepageCalculatorTeaser: { status: ContentStatus.PUBLISHED, publishedAt: new Date() },
    homepageTestimonial: { status: ContentStatus.PUBLISHED, publishedAt: new Date() },
    homepageHowItWorksStep: { status: ContentStatus.PUBLISHED, publishedAt: new Date() },
  };

  for (const [model, defaults] of Object.entries(hpModels)) {
    const items = data[model === 'homepageHero' ? 'hero' :
      model === 'homepageAudienceCard' ? 'cards' :
      model === 'homepageSocialBlock' ? 'social' :
      model === 'homepageCtaBlock' ? 'cta' :
      model === 'homepageCalculatorTeaser' ? 'calc' :
      model === 'homepageTestimonial' ? 'testi' :
      model === 'homepageHowItWorksStep' ? 'steps' : model] || [];
    if (items.length === 0) continue;
    const count = await prisma[model].count();
    if (count === 0) {
      for (const item of items) {
        const { id, createdAt, updatedAt, createdById, updatedById, ...rest } = item;
        await prisma[model].create({ data: { ...defaults, ...rest } });
        imported++;
      }
    }
  }

  console.log(`Imported: ${imported}, skipped (existing): ${skipped}`);
}

main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
