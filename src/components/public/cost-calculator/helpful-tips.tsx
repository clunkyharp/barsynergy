'use client';

const TIPS = [
  {
    title: 'Обновляйте цены',
    body: 'Регулярно проверяйте актуальные цены на зерно, молоко и расходники. Себестоимость меняется вместе с рынком.',
  },
  {
    title: 'Учитывайте потери',
    body: 'Зерно теряет вес при обжарке, молоко остаётся в питчере. Добавьте 3–5% к норме расхода как запас.',
  },
  {
    title: 'Food cost — не всё',
    body: 'Кроме ингредиентов учитывайте аренду, зарплаты, налоги и амортизацию. Без них картина неполная.',
  },
  {
    title: 'Сравнивайте напитки',
    body: 'Капучино и флэт уайт могут иметь разную себестоимость даже с одинаковыми ингредиентами. Считайте каждый отдельно.',
  },
  {
    title: 'Цена — не только цифры',
    body: 'Итоговая цена в меню зависит ещё и от позиционирования, конкурентов и локации. Калькулятор — ориентир, а не догма.',
  },
  {
    title: 'Сохраняйте рецепты',
    body: 'Сохраните базовые рецепты в шаблоны, чтобы быстро пересчитывать их при изменении цен поставщиков.',
  },
];

export function HelpfulTips() {
  return (
    <section className="border-t border-[var(--line)] py-10">
      <div className="container">
        <h3 className="text-base font-bold leading-tight text-[var(--text)]">Полезные советы</h3>
        <p className="mt-1 max-w-lg text-xs leading-5 text-[var(--muted)]">
          Практические рекомендации для точного расчёта себестоимости и управления ценами в кофейне.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TIPS.map((tip) => (
            <div
              key={tip.title}
              className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4"
            >
              <h4 className="text-[13px] font-bold leading-snug text-[var(--text)]">{tip.title}</h4>
              <p className="mt-1.5 text-[13px] leading-[1.55] text-[var(--muted)]">{tip.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
