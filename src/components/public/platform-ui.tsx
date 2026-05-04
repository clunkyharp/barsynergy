import type { ComponentType, ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { CardActionRow, IconBadge } from '@/components/public/public-ui-adaptation';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import { displayFont } from '@/lib/fonts';
import type { PublishedContentList } from '@/lib/public/content';
import { cn } from '@/lib/utils';

type LinkAction = {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'inverse';
};

export type PlatformActionCardProps = {
  eyebrow: string;
  title: string;
  description?: string;
  steps: string[];
  action: LinkAction;
  secondaryAction?: LinkAction;
  className?: string;
};

export function PlatformActionCard({
  eyebrow,
  title,
  description,
  steps,
  action,
  secondaryAction,
  className
}: PlatformActionCardProps) {
  return (
    <Panel className={cn('overflow-hidden border-[var(--border-default)] bg-[var(--surface-wash)] p-0', className)}>
      <div className="grid gap-6 p-5 md:p-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(18rem,0.58fr)] xl:p-7">
        <div className="min-w-0">
          <PublicEyebrow>{eyebrow}</PublicEyebrow>
          <h3 className={`${displayFont.className} mt-4 max-w-2xl text-[2rem] font-semibold leading-none text-[var(--text)] md:text-[2.6rem]`}>
            {title}
          </h3>
          {description ? (
            <PublicBodyText className="mt-4 max-w-xl" size="md">
              {description}
            </PublicBodyText>
          ) : null}
        </div>

        <div className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Как это работает</p>
          <ol className="mt-4 grid gap-3">
            {steps.map((step, index) => (
              <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3" key={step}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/8 text-[11px] font-semibold tabular-nums text-[var(--accent)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="pt-1 text-sm leading-6 text-[var(--text)]">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button className="rounded-[var(--radius-md)] px-5" href={action.href} size="sm" variant={action.variant ?? 'primary'}>
              {action.label}
              <ArrowUpRight size={16} />
            </Button>
            {secondaryAction ? (
              <Button
                className="rounded-[var(--radius-md)] px-5"
                href={secondaryAction.href}
                size="sm"
                variant={secondaryAction.variant ?? 'secondary'}
              >
                {secondaryAction.label}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Panel>
  );
}

export type PlatformFormatCardProps = {
  label: string;
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  audience?: string;
  outcome?: string;
  meta?: readonly string[];
  action?: LinkAction;
  className?: string;
};

export function PlatformFormatCard({
  label,
  title,
  description,
  icon,
  audience,
  outcome,
  meta = [],
  action,
  className
}: PlatformFormatCardProps) {
  return (
    <Panel
      className={cn('flex min-h-[236px] flex-col justify-between border-[var(--border-default)] bg-[var(--surface-wash)]', className)}
      padding="lg"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <PublicEyebrow>{label}</PublicEyebrow>
          {icon ? <IconBadge icon={icon} size="sm" tone="soft" /> : null}
        </div>
        <h3 className={`${displayFont.className} mt-5 text-[1.7rem] font-semibold leading-none text-[var(--text)]`}>{title}</h3>
        <PublicBodyText className="mt-4 max-w-[34ch]">{description}</PublicBodyText>
        {(audience || outcome) ? (
          <div className="mt-5 grid gap-3">
            {audience ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Для кого</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text)]">{audience}</p>
              </div>
            ) : null}
            {outcome ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Что даёт</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text)]">{outcome}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="mt-7">
        {meta.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {meta.map((item) => (
              <MetaChip className="border-[var(--border-default)] bg-transparent text-[var(--muted)]" key={item} variant="filter">
                {item}
              </MetaChip>
            ))}
          </div>
        ) : null}
        {action ? (
          <CardActionRow className="mt-5 pt-4">
            <Button className="px-0 text-[11px] tracking-[0.14em]" href={action.href} size="sm" variant={action.variant ?? 'ghost'}>
              {action.label}
              <ArrowUpRight size={14} />
            </Button>
          </CardActionRow>
        ) : null}
      </div>
    </Panel>
  );
}

export type LogoGridItem = {
  name: string;
  label?: string;
  href?: string;
};

export function LogoGrid({ items, emptyText }: { items: LogoGridItem[]; emptyText: string }) {
  if (items.length === 0) {
    return (
      <Panel className="border-dashed border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
        <PublicBodyText>{emptyText}</PublicBodyText>
      </Panel>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => {
        const content = (
              <span className="flex min-h-[104px] items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-5 text-center transition-colors duration-200 group-hover:border-[var(--accent)]/25 group-hover:bg-[var(--surface-wash-strong)]">
            <span>
              <span className="block text-lg font-semibold tracking-normal text-[var(--text)]">{item.name}</span>
              {item.label ? <span className="mt-2 block text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{item.label}</span> : null}
            </span>
          </span>
        );

        return item.href ? (
          <a className="group rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]" href={item.href} key={item.name}>
            {content}
          </a>
        ) : (
          <div key={item.name}>{content}</div>
        );
      })}
    </div>
  );
}

export function DateBlock({ date }: { date: string }) {
  const value = new Date(date);
  const isValid = Number.isFinite(value.getTime());
  const day = isValid ? value.toLocaleDateString('ru-RU', { day: '2-digit' }) : date;
  const month = isValid ? value.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '') : '';
  const weekday = isValid ? value.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '') : '';

  return (
    <div className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-3 text-center md:w-20">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{weekday}</span>
      <span className="mt-1 block text-[2rem] font-semibold leading-none text-[var(--text)]">{day}</span>
      {month ? <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{month}</span> : null}
    </div>
  );
}

export function ToolTeaser() {
  return (
    <section className="editorial-grid border-b border-[var(--line)] py-10 md:py-14">
      <div className="container grid gap-8 xl:grid-cols-[minmax(16rem,0.58fr)_minmax(0,1.42fr)]">
        <div className="min-w-0">
          <PublicEyebrow>Инструменты</PublicEyebrow>
          <PublicDisplayTitle className="mt-3 max-w-[22rem] !text-[clamp(2rem,3vw,2.85rem)] [overflow-wrap:normal] [word-break:normal]">
            Калькулятор себестоимости
          </PublicDisplayTitle>
        </div>
        <PlatformActionCard
          action={{ href: '/tools/cost-calculator', label: 'Открыть калькулятор' }}
          description="Быстрый расчёт себестоимости напитка или позиции меню без регистрации и сохранения данных."
          eyebrow="Практический инструмент"
          steps={['Введите ингредиенты и цену упаковки', 'Укажите количество в рецепте', 'Получите себестоимость и рекомендованную цену']}
          title="Для меню, обучения и расчётов по экономике бара"
        />
      </div>
    </section>
  );
}

function pageHref(content: PublishedContentList, basePath: string, page: number) {
  const params = new URLSearchParams();

  Object.entries(content.params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    if (value) {
      params.set(key, value);
    }
  });

  if (page > 1) {
    params.set('page', String(page));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function monthLabel(dateIso?: string) {
  if (!dateIso) {
    return 'Без даты';
  }

  const value = new Date(dateIso);

  if (!Number.isFinite(value.getTime())) {
    return 'Без даты';
  }

  return value.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

export function EventAgendaSection({
  content,
  filters
}: {
  content: PublishedContentList;
  filters: ReactNode;
}) {
  const groups = content.items.reduce<Array<{ label: string; items: typeof content.items }>>((acc, item) => {
    const label = monthLabel(item.dateIso);
    const currentGroup = acc.find((group) => group.label === label);

    if (currentGroup) {
      currentGroup.items.push(item);
      return acc;
    }

    acc.push({ label, items: [item] });
    return acc;
  }, []);

  return (
    <section className="editorial-grid border-b border-[var(--line)] py-10 md:py-14" id="events-list">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <PublicDisplayTitle className="max-w-sm">Афиша</PublicDisplayTitle>
            <div className="mt-4 flex flex-wrap gap-2">
              <MetaChip className="border-[var(--border-default)] bg-[var(--surface-wash)] text-[var(--text)]" variant="filter">
                Найдено событий: {content.total}
              </MetaChip>
            </div>
          </div>
          <p className="text-sm font-medium text-[var(--muted)]">Сначала ближайшие</p>
        </div>

        <div className="mt-6">{filters}</div>

        {content.items.length === 0 ? (
          <Panel className="mt-8 space-y-4 border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
            <PublicEyebrow tone="muted">Афиша</PublicEyebrow>
            <h3 className="text-2xl font-semibold leading-8">По этим параметрам ничего не найдено</h3>
            <PublicBodyText>Сбросьте фильтры или предложите событие через форму ниже.</PublicBodyText>
            <div className="flex flex-wrap gap-3">
              <Button href="/events" variant="secondary">
                Сбросить фильтры
              </Button>
              <Button href="/events?intent=proposal#applications">Предложить событие</Button>
            </div>
          </Panel>
        ) : (
          <div className="mt-8 grid gap-10">
            {groups.map((group) => (
              <div key={group.label}>
                <div className="mb-4 flex items-center gap-4">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{group.label}</h2>
                  <span className="h-px flex-1 bg-[var(--line)]" />
                </div>

                <div className="grid gap-4">
                  {group.items.map((item) => (
                    <article
                      className="grid gap-4 border-b border-[var(--line)] bg-transparent py-6 md:grid-cols-[6rem_minmax(0,1fr)_minmax(13rem,0.34fr)_9rem] md:items-center"
                      key={item.id}
                    >
                      <DateBlock date={item.dateIso ?? ''} />
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                          {item.label ?? 'Событие'}
                        </p>
                        <h3 className={`${displayFont.className} mt-2 text-[1.65rem] font-semibold leading-none text-[var(--text)] md:text-[2.2rem]`}>
                          {item.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(item.meta ?? []).slice(0, 4).map((entry) => (
                            <MetaChip className="border-[var(--border-default)] bg-transparent text-[var(--muted)]" key={entry} variant="filter">
                              {entry}
                            </MetaChip>
                          ))}
                        </div>
                        <PublicBodyText className="mt-3 max-w-2xl">{item.summary}</PublicBodyText>
                      </div>
                      <a
                        aria-label={`Открыть событие: ${item.title}`}
                        className="group relative min-h-[150px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[rgba(20,20,18,0.08)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                        href={`/events/${item.slug}`}
                      >
                        {item.imageUrl ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 bg-cover bg-center grayscale-[0.18] transition-transform duration-700 group-hover:scale-[1.04]"
                            style={{ backgroundImage: `url("${item.imageUrl}")` }}
                          />
                        ) : (
                          <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(135deg,rgba(153,44,38,0.14),rgba(20,20,18,0.08))]" />
                        )}
                      </a>
                      <div className="flex flex-col gap-3">
                        <Button className="rounded-[var(--radius-md)] px-5" href={`/events/${item.slug}`} size="sm">
                          Подробнее
                        </Button>
                        <Button className="rounded-[var(--radius-md)] px-5" href={`/events/${item.slug}#applications`} size="sm" variant="secondary">
                          Записаться
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
              <MetaChip className="border-[var(--border-default)] bg-transparent text-[var(--muted)]" variant="default">
                Страница {content.page} из {content.totalPages}
              </MetaChip>
              {content.totalPages > 1 ? (
                <div className="flex flex-wrap gap-3">
                  <Button disabled={content.page <= 1} href={pageHref(content, '/events', content.page - 1)} variant="secondary">
                    Назад
                  </Button>
                  <Button disabled={content.page >= content.totalPages} href={pageHref(content, '/events', content.page + 1)} variant="secondary">
                    Дальше
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
