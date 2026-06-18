import { PrismaClient, ContentStatus } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

const testimonials = [
  {
    quote:
      'Нашли двух бариста через платформу за неделю — раньше на это уходил месяц объявлений. Отклики приходят от людей, которые реально в индустрии.',
    author: 'Марьям А.',
    role: 'Управляющая кофейней',
    city: 'Махачкала',
    priority: 0
  },
  {
    quote:
      'Каталог поставщиков закрыл вопрос с зерном и расходниками по региону. Контакты живые, отвечают быстро — это сильно экономит время на закупках.',
    author: 'Тимур К.',
    role: 'Совладелец бара',
    city: 'Грозный',
    priority: 1
  },
  {
    quote:
      'Прошла интенсив и попала в команду через вакансию здесь же. Удобно, что обучение, события и работа собраны в одном месте для СКФО.',
    author: 'Алина С.',
    role: 'Бариста',
    city: 'Ставрополь',
    priority: 2
  }
];

const steps = [
  {
    title: 'Найдите нужное',
    description: 'Вакансии, поставщики, обучение и события барной индустрии СКФО — собраны в одном месте.',
    priority: 0
  },
  {
    title: 'Свяжитесь напрямую',
    description: 'Отклик на вакансию, заявка поставщику или запись на обучение — без посредников и лишних шагов.',
    priority: 1
  },
  {
    title: 'Работайте и растите',
    description: 'Нанимайте команду, закрывайте закупки, обучайтесь и развивайте заведение в своём регионе.',
    priority: 2
  }
];

async function main() {
  const now = new Date();

  const existingTestimonials = await prisma.homepageTestimonial.count();
  if (existingTestimonials === 0) {
    for (const item of testimonials) {
      await prisma.homepageTestimonial.create({
        data: { ...item, status: ContentStatus.PUBLISHED, publishedAt: now }
      });
    }
    console.log(`Seeded ${testimonials.length} homepage testimonials.`);
  } else {
    console.log(`Testimonials already present (${existingTestimonials}), skipping.`);
  }

  const existingSteps = await prisma.homepageHowItWorksStep.count();
  if (existingSteps === 0) {
    for (const item of steps) {
      await prisma.homepageHowItWorksStep.create({
        data: { ...item, status: ContentStatus.PUBLISHED, publishedAt: now }
      });
    }
    console.log(`Seeded ${steps.length} homepage how-it-works steps.`);
  } else {
    console.log(`Steps already present (${existingSteps}), skipping.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
