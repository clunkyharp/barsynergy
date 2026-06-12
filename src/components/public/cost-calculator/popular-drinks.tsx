'use client';

import { displayFont } from '@/lib/fonts';

type PopularDrink = {
  name: string;
  costEstimate: string;
  priceRange: string;
  foodCostRange: string;
};

const POPULAR_DRINKS: PopularDrink[] = [
  { name: 'Эспрессо',   costEstimate: '35–55 ₽',  priceRange: '120–200 ₽', foodCostRange: '25–30%' },
  { name: 'Капучино',   costEstimate: '55–85 ₽',  priceRange: '200–320 ₽', foodCostRange: '25–28%' },
  { name: 'Латте',      costEstimate: '60–95 ₽',  priceRange: '220–350 ₽', foodCostRange: '25–28%' },
  { name: 'Флэт уайт', costEstimate: '55–80 ₽',  priceRange: '210–300 ₽', foodCostRange: '25–27%' },
  { name: 'Фильтр',    costEstimate: '30–50 ₽',  priceRange: '150–220 ₽', foodCostRange: '20–25%' },
  { name: 'Раф',       costEstimate: '70–110 ₽', priceRange: '250–400 ₽', foodCostRange: '26–30%' },
];

export function PopularDrinks() {
  return (
    <div>
      <h3 className="text-base font-bold leading-tight text-[var(--text)]">Ориентиры по напиткам</h3>
      <p className="mt-1 max-w-lg text-xs leading-5 text-[var(--muted)]">
        Средние показатели себестоимости и цен. Используйте как отправную точку, а не как точную норму.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {POPULAR_DRINKS.map((drink) => (
          <div
            key={drink.name}
            className="flex flex-col rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-4 py-3"
          >
            {/* Name */}
            <h4 className={`${displayFont.className} text-[1.1rem] font-semibold leading-tight text-[var(--text)]`}>
              {drink.name}
            </h4>

            {/* 3 metrics in one row */}
            <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-[var(--line)] pt-3">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--muted)]">Себест.</dt>
                <dd className="mt-1 text-[13px] font-bold tabular-nums text-[var(--text)]">{drink.costEstimate}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--muted)]">Цена</dt>
                <dd className="mt-1 text-[13px] font-bold tabular-nums text-[var(--text)]">{drink.priceRange}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--muted)]">Food cost</dt>
                <dd className="mt-1 text-[13px] font-bold tabular-nums text-[var(--accent)]">{drink.foodCostRange}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
