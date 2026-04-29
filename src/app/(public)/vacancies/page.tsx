import { ArrowUpRight } from 'lucide-react';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { VacancyApplicationForms } from '@/components/public/vacancy-application-forms';
import { Button } from '@/components/ui/button';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { getPublishedVacancies, getVacancyApplicationFormOptions, type PublicContentSearchParams } from '@/lib/public/content';
import { displayFont } from '@/lib/fonts';
import { getEnv } from '@/lib/validation/env';

type VacanciesPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function stripApplicationResultParams(params: PublicContentSearchParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([key]) => key !== 'applicationSuccess' && key !== 'applicationError')
  );
}

export default async function VacanciesPage({ searchParams }: VacanciesPageProps) {
  const params = (await searchParams) ?? {};
  const [content, applicationFormOptions] = await Promise.all([
    getPublishedVacancies(stripApplicationResultParams(params)),
    getVacancyApplicationFormOptions()
  ]);
  const applicationSuccess = firstParam(params.applicationSuccess);
  const applicationError = firstParam(params.applicationError);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());
  const vacancyCount = content.total;
  const hasVacancies = applicationFormOptions.vacancies.length > 0;

  return (
    <>
      <section className="relative overflow-hidden border-b border-black/20 py-10 md:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(153,44,38,0.1),transparent_18%),radial-gradient(circle_at_82%_22%,rgba(255,255,255,0.62),transparent_18%),radial-gradient(circle_at_76%_84%,rgba(20,20,18,0.06),transparent_24%)]"
        />
        <div className="container relative grid gap-6 xl:grid-cols-[1.12fr_0.88fr] xl:items-end">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Вакансии</p>
            <h1 className={`${displayFont.className} display-tight mt-3 max-w-6xl text-[clamp(2.7rem,5vw,5.5rem)]`}>
              Открытые роли и заявки без лишних шагов
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)]">
              Экран разделён по задачам. Кандидатам нужен список опубликованных позиций и прямой отклик, заведениям —
              короткая заявка на размещение без лишних шагов.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button className="min-h-12 rounded-full px-6 tracking-[0.08em]" href="#vacancy-list">
                Смотреть позиции
                <ArrowUpRight size={18} />
              </Button>
              <Button className="min-h-12 rounded-full px-6 tracking-[0.08em]" href="#vacancy-forms" variant="secondary">
                Перейти к форме
              </Button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[1.5rem] border border-black/10 bg-white/80 p-5 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Сейчас в разделе</p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">{vacancyCount}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {hasVacancies
                  ? 'Опубликованные роли доступны сразу в списке ниже, без лишнего вступительного контента.'
                  : 'Новых ролей пока нет, но заявка на размещение вакансии уже доступна.'}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/10 bg-[var(--graphite)] p-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Маршрут</p>
              <div className="mt-3 grid gap-2 text-sm font-semibold sm:grid-cols-3 xl:grid-cols-1">
                <span>1. Список</span>
                <span>2. Сценарий</span>
                <span>3. Отправка</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Основное действие начинается сразу: сначала список ролей, затем нужная форма.
              </p>
            </div>
          </div>
        </div>
      </section>
      <PublishedContentSection
        basePath="/vacancies"
        content={content}
        emptyAction={{ href: '#vacancy-submission', label: 'Разместить вакансию' }}
        emptyDescription="Пока опубликованных позиций нет. Если вы нанимаете, отправьте вакансию сразу ниже. Если ищете работу, вернитесь позже или оставьте контакт через раздел связи."
        emptyTitle="Вакансий пока нет"
        sectionId="vacancy-list"
        title="Актуальные позиции"
      />
      <VacancyApplicationForms
        enabled={applicationFormsEnabled}
        options={applicationFormOptions}
        result={
          applicationError
            ? { type: 'error', message: applicationError }
            : applicationSuccess
              ? { type: 'success', message: applicationSuccess }
              : undefined
        }
        utm={{
          source: firstParam(params.utm_source),
          medium: firstParam(params.utm_medium),
          campaign: firstParam(params.utm_campaign)
        }}
      />
    </>
  );
}
