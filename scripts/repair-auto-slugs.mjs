import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mirrors src/lib/utils/slugify.ts exactly
const cyrillicMap = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
  з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
  я: 'ya',
};

function transliterate(value) {
  return value.split('').map((ch) => cyrillicMap[ch] ?? ch).join('');
}

function slugify(value) {
  return transliterate(value.trim().toLowerCase().normalize('NFKC'))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function hasNonAscii(slug) {
  return /[^\x20-\x7E]/.test(slug) || /[^a-z0-9-]/.test(slug);
}

async function findUniqueSlug(baseSlug, exists) {
  let candidate = baseSlug;
  let suffix = 2;
  while (await exists(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

async function repairModel({ label, findMany, exists, update, titleField = 'title' }) {
  const rows = await findMany();
  let updated = 0;

  for (const row of rows) {
    const source = row[titleField];

    if (typeof source !== 'string' || source.trim().length === 0) continue;
    if (!hasNonAscii(row.slug)) continue;

    const target = slugify(source);
    if (!target || target === row.slug) continue;

    const uniqueSlug = await findUniqueSlug(target, (candidate) => exists(candidate, row.id));
    await update(row.id, uniqueSlug);
    updated += 1;
    console.log(`[repair] ${label} ${row.id}: "${row.slug}" -> "${uniqueSlug}"`);
  }

  return updated;
}

try {
  const totals = await Promise.all([
    repairModel({
      label: 'article',
      findMany: () => prisma.article.findMany({ select: { id: true, title: true, slug: true } }),
      exists: (slug, id) => prisma.article.findFirst({ where: { slug, id: { not: id } }, select: { id: true } }).then(Boolean),
      update: (id, slug) => prisma.article.update({ where: { id }, data: { slug } }),
    }),
    repairModel({
      label: 'course',
      findMany: () => prisma.course.findMany({ select: { id: true, title: true, slug: true } }),
      exists: (slug, id) => prisma.course.findFirst({ where: { slug, id: { not: id } }, select: { id: true } }).then(Boolean),
      update: (id, slug) => prisma.course.update({ where: { id }, data: { slug } }),
    }),
    repairModel({
      label: 'event',
      findMany: () => prisma.event.findMany({ select: { id: true, title: true, slug: true } }),
      exists: (slug, id) => prisma.event.findFirst({ where: { slug, id: { not: id } }, select: { id: true } }).then(Boolean),
      update: (id, slug) => prisma.event.update({ where: { id }, data: { slug } }),
    }),
    repairModel({
      label: 'vacancy',
      findMany: () => prisma.vacancy.findMany({ select: { id: true, title: true, slug: true } }),
      exists: (slug, id) => prisma.vacancy.findFirst({ where: { slug, id: { not: id } }, select: { id: true } }).then(Boolean),
      update: (id, slug) => prisma.vacancy.update({ where: { id }, data: { slug } }),
    }),
    repairModel({
      label: 'supplier',
      findMany: () => prisma.supplier.findMany({ select: { id: true, title: true, slug: true } }),
      exists: (slug, id) => prisma.supplier.findFirst({ where: { slug, id: { not: id } }, select: { id: true } }).then(Boolean),
      update: (id, slug) => prisma.supplier.update({ where: { id }, data: { slug } }),
    }),
    repairModel({
      label: 'partner',
      findMany: () => prisma.partner.findMany({ select: { id: true, title: true, slug: true } }),
      exists: (slug, id) => prisma.partner.findFirst({ where: { slug, id: { not: id } }, select: { id: true } }).then(Boolean),
      update: (id, slug) => prisma.partner.update({ where: { id }, data: { slug } }),
    }),
    repairModel({
      label: 'generalSponsor',
      titleField: 'name',
      findMany: () => prisma.generalSponsor.findMany({ select: { id: true, name: true, slug: true } }),
      exists: (slug, id) => prisma.generalSponsor.findFirst({ where: { slug, id: { not: id } }, select: { id: true } }).then(Boolean),
      update: (id, slug) => prisma.generalSponsor.update({ where: { id }, data: { slug } }),
    }),
    repairModel({
      label: 'businessAccount',
      titleField: 'companyName',
      findMany: () => prisma.businessAccount.findMany({ select: { id: true, companyName: true, slug: true } }),
      exists: (slug, id) => prisma.businessAccount.findFirst({ where: { slug, id: { not: id } }, select: { id: true } }).then(Boolean),
      update: (id, slug) => prisma.businessAccount.update({ where: { id }, data: { slug } }),
    }),
  ]);

  const total = totals.reduce((sum, n) => sum + n, 0);
  console.log(`[repair] Done. Updated: ${total} row(s).`);
} finally {
  await prisma.$disconnect();
}
