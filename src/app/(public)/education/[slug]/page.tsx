import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { JsonLd } from '@/components/seo/json-ld';
import { getPublishedCourses } from '@/lib/public/content';
import { getPublishedCourseDetail } from '@/lib/public/content-details';
import { buildMissingPublicContentMetadata, buildPublicContentMetadata } from '@/lib/public/metadata';
import { buildBreadcrumbJsonLd, buildPublicContentJsonLd } from '@/lib/public/structured-data';

type CourseDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublishedCourseDetail(slug);

  if (!course) {
    return buildMissingPublicContentMetadata({
      title: 'Программа не найдена',
      description: 'Программа удалена или еще не опубликована.'
    });
  }

  return buildPublicContentMetadata({
    detail: course,
    path: `/education/${course.slug}`
  });
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const [course, related] = await Promise.all([getPublishedCourseDetail(slug), getPublishedCourses({ pageSize: '4' })]);

  if (!course) {
    notFound();
  }
  const detailPath = `/education/${course.slug}`;
  const relatedItems = related.items.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: 'Главная', path: '/' },
            { name: 'Обучение', path: '/education' },
            { name: course.title, path: detailPath }
          ]),
          buildPublicContentJsonLd({ detail: course, path: detailPath, kind: 'course' })
        ]}
      />
      <PublicContentDetailPage
        backHref="/education"
        backLabel="Ко всем программам"
        body={course.body}
        eyebrow="Обучение"
        facts={course.facts}
        imageUrl={course.imageUrl}
        label={course.label}
        meta={course.meta}
        primaryLink={{ href: `/contacts?topic=education-program&topicTitle=${encodeURIComponent(course.title)}#contact-form`, label: 'Записаться на программу' }}
        secondaryLink={{ href: '/education', label: 'Вернуться в каталог' }}
        sections={course.sections}
        summary={course.summary}
        title={course.title}
      />
      <PublicRelatedContentSection
        basePath="/education"
        items={relatedItems}
        title="Другие программы"
      />
    </>
  );
}
