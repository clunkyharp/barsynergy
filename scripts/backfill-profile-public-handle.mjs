import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

async function main() {
  const profiles = await prisma.profile.findMany({
    where: {
      isPublic: true,
      publicHandle: null,
    },
  });

  let updated = 0;

  for (const profile of profiles) {
    if (!profile.fullName) continue;

    const baseHandle = slugify(profile.fullName);
    if (!baseHandle) continue;

    let candidate = baseHandle;
    let suffix = 2;

    while (await prisma.profile.findFirst({
      where: { publicHandle: candidate, id: { not: profile.id } },
      select: { id: true },
    })) {
      candidate = `${baseHandle}-${suffix}`;
      suffix += 1;
    }

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        publicHandle: candidate,
        publishedAt: profile.updatedAt,
      },
    });

    updated += 1;
    console.log(`[backfill] Profile ${profile.id}: publicHandle="${candidate}"`);
  }

  console.log(`[backfill] Done. Updated: ${updated} profile(s).`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
