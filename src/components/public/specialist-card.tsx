'use client';

import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { ArrowRight, BadgeCheck, Briefcase, MapPin, Search } from 'lucide-react';
import type { SpecialistCardItem } from '@/lib/public/content';
import { AppLink } from '@/components/ui/app-link';

type SpecialistCardProps = {
  item: SpecialistCardItem;
  rowActionLabel?: string;
};

function metaGroupValue(item: SpecialistCardItem, label: string) {
  return item.metaGroups?.find((entry) => entry.label === label)?.value;
}

function isCompensationMeta(value: string, rate?: string) {
  return value === rate || value.includes('₽');
}

export function SpecialistCard({ item, rowActionLabel }: SpecialistCardProps) {
  const isSeeking = item.mode === 'seeking';
  const city = metaGroupValue(item, 'Город');
  const rate = metaGroupValue(item, 'Зарплата') ?? metaGroupValue(item, 'Стоимость');
  const skillTags = item.meta.filter((entry) => entry !== city && !isCompensationMeta(entry, rate)).slice(0, 4);

  return (
    <article className="specialist-directory-card">
      <div className="specialist-directory-main">
        <div className="specialist-directory-person">
          {item.imageUrl ? (
            <div className="specialist-directory-avatar">
              <img
                alt=""
                className="size-full object-cover"
                src={item.imageUrl}
              />
            </div>
          ) : (
            <div className="specialist-directory-avatar specialist-directory-avatar-empty">
              <span aria-hidden="true">
                {isSeeking ? <Search size={24} /> : <Briefcase size={24} />}
              </span>
            </div>
          )}

          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 className={cn(displayFont.className, 'specialist-directory-title')}>
                {item.title}
              </h3>
              {item.isVerified ? (
                <BadgeCheck
                  aria-label="Проверено"
                  className="shrink-0 text-[var(--accent)]"
                  size={18}
                  strokeWidth={2}
                />
              ) : null}
            </div>
            {item.subtitle ? (
              <p className="mt-1 text-sm leading-5 text-[var(--muted)]">{item.subtitle}</p>
            ) : null}
            {city ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm leading-5 text-[var(--muted)]">
                <MapPin aria-hidden="true" size={15} strokeWidth={1.8} />
                {city}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {skillTags.map((m, i) => (
                <span className="specialist-directory-chip" key={`${m}-${i}`}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="specialist-directory-offer">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn(
            'specialist-directory-mode',
            isSeeking
              ? 'specialist-directory-mode-seeking'
              : 'specialist-directory-mode-offering'
          )}>
            {isSeeking ? <Search size={11} strokeWidth={2.4} /> : <Briefcase size={11} strokeWidth={2.4} />}
            {isSeeking ? 'Ищу работу' : 'Предлагаю услуги'}
          </span>
          {item.isNew ? (
            <span className="specialist-directory-new">Новое</span>
          ) : null}
        </div>

        {rate ? (
          <div>
            <p className="text-lg font-semibold leading-6 text-[var(--text)] tabular-nums [overflow-wrap:anywhere]">{rate}</p>
          </div>
        ) : null}

        <AppLink
          className="specialist-directory-action"
          href={item.detailUrl}
        >
          {rowActionLabel ?? (isSeeking ? 'Смотреть резюме' : 'Подробнее')}
          <ArrowRight aria-hidden="true" size={16} strokeWidth={1.8} />
        </AppLink>
      </div>
    </article>
  );
}
