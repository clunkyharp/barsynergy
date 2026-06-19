'use client';

import Image from 'next/image';
import { useState } from 'react';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { cn } from '@/lib/utils';

type ConsultingCase = {
  image: string;
  title: string;
  task: string;
  result: string;
};

type ConsultingPriceItem = {
  title: string;
  price: string;
  description: string;
};

type ConsultingTabsProps = {
  cases: readonly ConsultingCase[];
  prices: readonly ConsultingPriceItem[];
};

export function ConsultingTabs({ cases, prices }: ConsultingTabsProps) {
  const [activeTab, setActiveTab] = useState<'cases' | 'prices'>('cases');

  return (
    <section className="background-zone background-zone-gray border-b border-[var(--line)] py-12 md:py-16">
      <div className="container">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(18rem,0.5fr)] lg:items-end">
          <div className="min-w-0">
            <PublicEyebrow>Задачи</PublicEyebrow>
            <PublicDisplayTitle className="mt-4">Типовые задачи и стоимость</PublicDisplayTitle>
          </div>
          <PublicBodyText className="max-w-2xl lg:justify-self-end" size="md">
            Сначала выберите тип задачи.
          </PublicBodyText>
        </div>

        <div aria-label="Раздел консалтинга" className="mt-8 flex flex-wrap gap-2" role="tablist">
          {[
            { id: 'cases' as const, label: 'Типовые задачи' },
            { id: 'prices' as const, label: 'Пакеты' }
          ].map((tab) => (
            <button
              aria-controls={`consulting-${tab.id}`}
              aria-selected={activeTab === tab.id}
              className={cn(
                'inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border px-4 text-sm font-semibold transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
                activeTab === tab.id
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]'
                  : 'border-[var(--border-default)] bg-[var(--surface-wash)] text-[var(--text)] hover:border-[var(--accent)]/35'
              )}
              id={`consulting-tab-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          aria-labelledby="consulting-tab-cases"
          className={cn('mt-6 grid gap-4 md:grid-cols-2', activeTab !== 'cases' && 'hidden')}
          id="consulting-cases"
          role="tabpanel"
        >
          {cases.map((item) => (
            <article className="public-card-shell overflow-hidden" key={item.title}>
              <div className="relative aspect-[16/9] bg-[var(--surface-wash)]">
                <Image alt="" className="object-cover" fill sizes="(min-width: 768px) 50vw, 100vw" src={item.image} />
              </div>
              <div className="p-5 md:p-6">
                <h3 className="text-xl font-semibold leading-7 text-[var(--text)]">{item.title}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="public-meta-label">Задача</span>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.task}</p>
                  </div>
                  <div>
                    <span className="public-meta-label">Результат</span>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text)]">{item.result}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div
          aria-labelledby="consulting-tab-prices"
          className={cn('mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]', activeTab !== 'prices' && 'hidden')}
          id="consulting-prices"
          role="tabpanel"
        >
          {prices.map((item) => (
            <article className="grid gap-3 py-5 md:grid-cols-[minmax(0,0.34fr)_minmax(0,0.2fr)_minmax(0,0.46fr)] md:items-start md:gap-5 md:px-3" key={item.title}>
              <h3 className="text-lg font-semibold leading-7 text-[var(--text)]">{item.title}</h3>
              <p className="text-base font-semibold leading-7 text-[var(--accent)]">{item.price}</p>
              <p className="text-sm leading-6 text-[var(--muted)]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
