import type { Metadata } from 'next';
import { CostCalculatorClient } from '@/components/public/cost-calculator-client';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';

export const metadata: Metadata = {
  title: 'Калькулятор себестоимости',
  description: 'Калькулятор себестоимости напитка или позиции меню для барной индустрии.'
};

export default function CostCalculatorPage() {
  return (
    <>
      <EditorialPublicPage
        breadcrumbLabel="Калькулятор себестоимости"
        description="Посчитайте себестоимость напитка или позиции меню: ингредиенты, итоговая себестоимость и цена продажи."
        eyebrow="Инструменты"
        metrics={[]}
        primaryLink={{ label: 'Рассчитать себестоимость', href: '#calculator' }}
        rows={[]}
        secondaryLink={{ label: 'К знаниям', href: '/articles' }}
        summary="Подходит, если нужно быстро проверить цену, подготовить меню или разобрать расчёт с командой."
        summaryHeading="Для меню и обучения"
        title="Калькулятор себестоимости"
      />
      <div className="scroll-mt-24 md:scroll-mt-28" id="calculator">
        <CostCalculatorClient />
      </div>
    </>
  );
}
