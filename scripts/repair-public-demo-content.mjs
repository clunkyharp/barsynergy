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

  console.log(
    JSON.stringify(
      {
        deletedVacancies: deletedVacancies.count,
        updatedEvents: publishedEventUpdates.map((event) => event.slug)
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
