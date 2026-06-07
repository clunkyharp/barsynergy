import { ContentStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const publishedEventUpdates = [
  {
    slug: 'demo-regional-guest-shift',
    summary: 'Гостевая смена для команд региона: совместный бар, обмен сервисными практиками и открытая регистрация для специалистов.'
  },
  {
    slug: 'demo-coffee-service-intensive',
    summary: 'Практический интенсив по сервису, работе с гостем и координации смены для бариста, барменов и менеджеров.'
  }
];

async function main() {
  const deletedVacancies = await prisma.vacancy.deleteMany({
    where: {
      status: ContentStatus.PUBLISHED,
      OR: [
        { slug: 'dasdasd' },
        { title: { in: ['sxdasd', 'dasdasd'] } },
        { summary: { contains: '231dsdwqeeqweqwe' } },
        { employmentType: { contains: 'sdasd' } }
      ]
    }
  });

  for (const event of publishedEventUpdates) {
    await prisma.event.updateMany({
      where: { slug: event.slug, status: ContentStatus.PUBLISHED },
      data: {
        summary: event.summary
      }
    });
  }

  // Fix Hustle Brew supplier — wrong data (beer/cider) was added by an agent.
  // Hustle Brew actually supplies coffee, cocoa, and concentrated juices.
  const hustleBrewFix = await prisma.supplier.updateMany({
    where: {
      companyName: 'Hustle Brew',
      OR: [
        { summary: { contains: 'пиво' } },
        { summary: { contains: 'сидр' } },
        { description: { contains: 'пиво' } },
        { description: { contains: 'сидр' } }
      ]
    },
    data: {
      title: 'Кофе, какао и концентрированные соки для заведений',
      summary: 'Кофе, какао, концентрированные соки и рабочие поставки для кофеен, баров и HoReCa-команд.',
      description: 'Hustle Brew работает с кофейным и барным направлением: поставляет кофе, какао, концентрированные соки и позиции для ежедневной работы заведения. Команда представляет KOF и Vérle и помогает быстро собрать поставку под бар, кофейню или учебный формат.',
      isVerified: true,
      contactLabel: '@hustle.brew / 8 928 866 70 02 / 8 989 441 95 95',
      serviceArea: 'СКФО'
    }
  });

  // Also fix GeneralSponsor record if it was corrupted with wrong data
  const hustleBrewSponsorFix = await prisma.generalSponsor.updateMany({
    where: {
      slug: 'hustle-brew',
      OR: [
        { shortDescription: { contains: 'пиво' } },
        { shortDescription: { contains: 'сидр' } },
        { fullDescription: { contains: 'пиво' } },
        { fullDescription: { contains: 'сидр' } }
      ]
    },
    data: {
      shortDescription: 'Кофе, какао, концентрированные соки и рабочие поставки для кофеен, баров и HoReCa-команд.',
      fullDescription: 'Hustle Brew работает с кофейным и барным направлением: поставляет кофе, какао, концентрированные соки и позиции для ежедневной работы заведения. Команда представляет KOF и Vérle и помогает быстро собрать поставку под бар, кофейню или учебный формат.'
    }
  });

  console.log(
    JSON.stringify(
      {
        deletedVacancies: deletedVacancies.count,
        updatedEvents: publishedEventUpdates.map((event) => event.slug),
        hustleBrewSupplierFixed: hustleBrewFix.count,
        hustleBrewSponsorFixed: hustleBrewSponsorFix.count
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
