import type { Metadata } from 'next';
import { CostCalculatorClient } from '@/components/public/cost-calculator-client';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { buildPublicPageMetadata } from '@/lib/public/metadata';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Сколько стоит ваш напиток',
  description: 'Считайте себестоимость эспрессо, фильтра, альтернативы или коктейля.',
  path: '/tools/cost-calculator'
});

export default function CostCalculatorPage() {
  return (
    <>
      <EditorialPublicPage
        breadcrumbLabel="Калькулятор себестоимости"
        description="Считайте себестоимость эспрессо, фильтра, альтернативы или коктейля: введите ингредиенты и получите цену продажи."
        eyebrow="Инструменты"
        path="/tools/cost-calculator"
        metrics={[]}
        rows={[]}
        summary="Подходит, если нужно быстро проверить цену, подготовить меню или разобрать расчёт с командой."
        summaryHeading="Для меню и обучения"
        title="Рассчитайте себестоимость напитка"
      />
      <div className="scroll-mt-24 md:scroll-mt-28" id="calculator">
        <CostCalculatorClient />
      </div>
    </>
  );
}
