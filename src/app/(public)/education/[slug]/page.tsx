import { notFound } from 'next/navigation';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { getPublishedCourses } from '@/lib/public/content';
import { getPublishedCourseDetail } from '@/lib/public/content-details';

type CourseDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const [course, related] = await Promise.all([getPublishedCourseDetail(slug), getPublishedCourses({ pageSize: '4' })]);

  if (!course) {
    notFound();
  }
  const relatedItems = related.items.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <PublicContentDetailPage
        backHref="/education"
        backLabel="Ко всем программам"
        body={course.body}
        eyebrow="Образование"
        facts={course.facts}
        imageUrl={course.imageUrl}
        label={course.label}
        meta={course.meta}
        primaryLink={{ href: '/contacts', label: 'Подать заявку' }}
        secondaryLink={{ href: '/education', label: 'Вернуться в каталог' }}
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
