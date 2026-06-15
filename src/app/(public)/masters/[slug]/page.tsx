import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { submitMasterInquiry } from '@/app/(public)/masters/actions';
import { JsonLd } from '@/components/seo/json-ld';
import { MasterInquiryForm } from '@/components/public/master-application-form';
import { MasterDetailBody } from '@/components/public/master-detail-body';
import { MasterDetailHero } from '@/components/public/master-detail-hero';
import { MasterRelatedSection } from '@/components/public/master-related-section';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { getPublicApplicationUtm } from '@/lib/applications/public-form-helpers';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getPublishedMasterDetail, getPublishedMasters } from '@/lib/public/content';
import { buildMissingPublicContentMetadata, buildPublicContentMetadata } from '@/lib/public/metadata';
import { buildBreadcrumbJsonLd, buildMasterJsonLd } from '@/lib/public/structured-data';
import { getEnv } from '@/lib/validation/env';

type MasterDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getMasterEntityLabel(entityType: string) {
  return entityType === 'BUSINESS' ? 'Компания' : 'Частный мастер';
}

function getMasterDisplayName(master: { entityType: string; companyName?: string; facts: Array<{ label: string; value: string }>; title: string }) {
  if (master.entityType === 'BUSINESS') {
    return master.companyName ?? master.title;
  }

  return master.facts.find((fact) => fact.label === 'Профиль')?.value ?? master.title;
}

export async function generateMetadata({ params }: MasterDetailPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const master = await getPublishedMasterDetail(slug);

  if (!master) {
    return buildMissingPublicContentMetadata({
      title: 'Мастер не найден',
      description: 'Профиль удалён или ещё не опубликован.'
    });
  }

  return buildPublicContentMetadata({
    detail: master,
    path: `/masters/${master.slug}`
  });
}

export default async function MasterDetailPage({ params, searchParams }: MasterDetailPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const [master, related] = await Promise.all([
    getPublishedMasterDetail(slug),
    getPublishedMasters({ pageSize: '4' })
  ]);

  if (!master) {
    notFound();
  }

  const sp = (await searchParams) ?? {};
  const detailPath = `/masters/${master.slug}`;
  const relatedItems = related.items.filter((item) => item.slug !== slug).slice(0, 3);
  const env = getEnv();
  const formsEnabled = arePublicApplicationFormsEnabled(env);
  const currentUser = await getCurrentUser();
  const showUserActions = !currentUser || currentUser.role === 'USER';
  const profile = currentUser ? {
    fullName: currentUser.profile?.fullName ?? undefined,
    email: currentUser.email ?? undefined
  } : undefined;
  const displayName = getMasterDisplayName(master);
  const contactLabel = master.facts.find((fact) => fact.label === 'Контакты')?.value;

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: 'Главная', path: '/' },
            { name: 'Мастера', path: '/masters' },
            { name: master.title, path: detailPath }
          ]),
          buildMasterJsonLd(master, detailPath)
        ]}
      />
      <MasterDetailHero
        cityName={master.cityName}
        contactLabel={contactLabel}
        displayName={displayName}
        entityLabel={getMasterEntityLabel(master.entityType)}
        image={master.imageUrl}
        isVerified={master.isVerified ?? false}
        label={master.label}
        serviceArea={master.serviceArea}
        summary={master.summary}
        title={master.title}
      />
      <MasterDetailBody
        body={master.body}
        contactRail={
          showUserActions ? (
            <MasterInquiryForm
              enabled={formsEnabled}
              masterId={master.id}
              masterTitle={master.title}
              profile={profile}
              submitAction={submitMasterInquiry}
              utm={getPublicApplicationUtm(sp)}
            />
          ) : null
        }
        facts={master.facts}
      />
      <MasterRelatedSection items={relatedItems} />
    </>
  );
}
