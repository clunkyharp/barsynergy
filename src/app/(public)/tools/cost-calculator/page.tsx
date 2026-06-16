import type { Metadata } from 'next';
import { CostCalculatorClient } from '@/components/public/cost-calculator-client';
import { PageHero } from '@/components/public/page-hero';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { JsonLd } from '@/components/seo/json-ld';
import { buildStaticPageBreadcrumbJsonLd, buildWebApplicationJsonLd } from '@/lib/public/structured-data';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Калькулятор себестоимости кофе и напитков для кофейни',
  description: 'Рассчитайте себестоимость капучино, латте, эспрессо и других напитков. Food cost, наценка, рентабельность — бесплатный онлайн-калькулятор для кофеен.',
  path: '/tools/cost-calculator'
});

export default function CostCalculatorPage() {
  return (
    <>
      <JsonLd data={[
        buildStaticPageBreadcrumbJsonLd('/tools/cost-calculator', 'Калькулятор себестоимости'),
        buildWebApplicationJsonLd({
          name: 'Калькулятор себестоимости напитка',
          description: 'Бесплатный онлайн-калькулятор себестоимости кофе и напитков для кофеен: ингредиенты, food cost, наценка и рентабельность.',
          path: '/tools/cost-calculator'
        })
      ]} />

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
