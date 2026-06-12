import type { Metadata } from 'next';
import { CostCalculatorClient } from '@/components/public/cost-calculator-client';
import { PageHero } from '@/components/public/page-hero';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { JsonLd } from '@/components/seo/json-ld';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Калькулятор себестоимости напитка',
  description: 'Рассчитайте себестоимость напитка, установите оптимальную цену и контролируйте прибыль. Ингредиенты, дополнительные расходы, наценка и рентабельность.',
  path: '/tools/cost-calculator'
});

export default function CostCalculatorPage() {
  return (
    <>
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/tools/cost-calculator', 'Калькулятор себестоимости')} />

      <PageHero
        breadcrumbs={[
          { href: '/', label: 'Главная' },
          { href: '/tools', label: 'Инструменты' },
          { label: 'Калькулятор себестоимости' }
        ]}
        eyebrow="Инструменты"
        title="Калькулятор себестоимости"
        subtitle="Рассчитайте себестоимость напитка, установите оптимальную цену и контролируйте прибыль."
        tone="light-editorial"
        density="compact"
      />

      <div className="scroll-mt-4" id="calculator">
        <CostCalculatorClient />
      </div>
    </>
  );
}
