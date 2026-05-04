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
        description="Быстрый расчёт себестоимости напитка или позиции меню: ингредиенты, итоговая себестоимость и рекомендованная цена продажи."
        eyebrow="Инструменты"
        metrics={[
          { value: 'Быстрый расчёт', label: 'без сохранения данных' },
          { value: '₽', label: 'расчёт в рублях' },
          { value: '%', label: 'целевая доля себестоимости' }
        ]}
        primaryLink={{ label: 'Перейти к расчёту', href: '#calculator' }}
        rows={[
          {
            label: '1',
            title: 'Ингредиенты',
            description: 'Добавьте цену упаковки, размер упаковки и количество ингредиента в рецепте.'
          },
          {
            label: '2',
            title: 'Себестоимость',
            description: 'Калькулятор сразу считает стоимость каждого ингредиента и итоговую сумму.'
          },
          {
            label: '3',
            title: 'Цена продажи',
            description: 'Укажите желаемую долю себестоимости, чтобы получить ориентир по продаже.'
          }
        ]}
        rowsHeading="Как считать"
        secondaryLink={{ label: 'К знаниям', href: '/articles' }}
        summary="Инструмент работает на странице и не требует регистрации. Сохранение расчётов, база ингредиентов и экспорт остаются для следующих этапов."
        summaryHeading="Для меню и обучения"
        title="Калькулятор себестоимости"
      />
      <div id="calculator">
        <CostCalculatorClient />
      </div>
    </>
  );
}
