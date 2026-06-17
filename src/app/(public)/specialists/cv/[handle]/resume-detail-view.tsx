import type { getPublishedResumeDetail } from '@/lib/public/content';
import { Panel } from '@/components/ui/panel';
import { AppLink } from '@/components/ui/app-link';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Briefcase, Globe, MapPin, Phone, Search, Send, type LucideIcon } from 'lucide-react';

type ResumeDetail = NonNullable<Awaited<ReturnType<typeof getPublishedResumeDetail>>>;

function formatDate(d: Date): string {
  return d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

function formatDuration(start: Date, end: Date | null): string {
  const startStr = formatDate(start);
  if (!end) return `${startStr} — настоящее время`;
  return `${startStr} — ${formatDate(end)}`;
}

function employmentTypeLabel(type: string): string {
  if (type === 'FULL_TIME') return 'Полная занятость';
  if (type === 'PART_TIME') return 'Частичная занятость';
  if (type === 'FREELANCE') return 'Фриланс';
  if (type === 'REMOTE') return 'Удалённая работа';
  return type;
}

function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function ResumeDetailView({ resume }: { resume: ResumeDetail }) {
  const contactItems = [
    resume.phone ? { href: phoneHref(resume.phone), label: resume.phone, icon: Phone } : null,
    resume.telegram ? { href: `https://t.me/${resume.telegram.replace(/^@/, '')}`, label: resume.telegram, icon: Send } : null,
    resume.website ? { href: resume.website, label: resume.website, icon: Globe } : null,
  ].filter(Boolean) as Array<{ href: string; label: string; icon: LucideIcon }>;
  const statusLabel = resume.jobSearchStatus === 'ACTIVE' ? 'Активно ищет работу' : 'Открыт к предложениям';

  return (
    <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-8 md:py-12">
      <div className="container">
        <div className="mx-auto max-w-5xl">
          <Panel className="border-[var(--border-default)] bg-[var(--surface-card)] text-center" padding="lg" tone="elevated">
            <h1 className={cn(displayFont.className, 'text-[clamp(1.75rem,3.5vw,2.6rem)] font-semibold leading-none text-[var(--text)])')}>
              {resume.fullName ?? 'Специалист'}
            </h1>
            {resume.headline || resume.profession ? (
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {resume.headline ?? resume.profession}
              </p>
            ) : null}

            <div className="mt-6 flex justify-center">
              {resume.imageUrl ? (
                <div className="size-24 overflow-hidden rounded-full border-2 border-[var(--border-default)] bg-[var(--surface-wash)] md:size-32">
                  <img
                    alt={resume.fullName ?? ''}
                    className="size-full object-cover"
                    src={resume.imageUrl}
                  />
                </div>
              ) : (
                <div className="grid size-24 place-items-center rounded-full border-2 border-[var(--border-default)] bg-[var(--surface-wash)] text-[var(--muted)] md:size-32">
                  <Briefcase aria-hidden="true" size={32} strokeWidth={1.8} />
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {resume.cityName ? (
                <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-1 text-sm text-[var(--muted)]">
                  <MapPin aria-hidden="true" size={14} />
                  {resume.cityName}
                </span>
              ) : null}
              {resume.profession ? (
                <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-1 text-sm text-[var(--muted)]">
                  <Briefcase aria-hidden="true" size={14} />
                  {resume.profession}
                </span>
              ) : null}
              {resume.desiredSalary ? (
                <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--accent)]/30 px-3 py-1 text-sm font-semibold text-[var(--accent)]">
                  от {resume.desiredSalary.toLocaleString('ru-RU')} ₽
                  {resume.desiredSalaryMax ? ` до ${resume.desiredSalaryMax.toLocaleString('ru-RU')} ₽` : ''}
                </span>
              ) : null}
            </div>

            {resume.jobSearchStatus ? (
              <span className={cn(
                'mt-5 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1 text-sm font-semibold',
                resume.jobSearchStatus === 'ACTIVE'
                  ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                  : 'bg-[var(--surface-wash)] text-[var(--muted)]'
              )}>
                {statusLabel}
              </span>
            ) : null}
          </Panel>

          <div className="mt-8 flex flex-col gap-6">
            {resume.bio && (
              <Panel className="border-[var(--border-default)] bg-[var(--surface-card)]" padding="lg" tone="elevated">
                <h2 className={cn(displayFont.className, 'mb-3 text-lg font-semibold')}>О себе</h2>
                <p className="text-sm leading-6 text-[var(--editorial-dark-muted)] whitespace-pre-line">{resume.bio}</p>
              </Panel>
            )}

            {resume.workExperiences.length > 0 ? (
              <div>
                <h2 className={cn(displayFont.className, 'mb-4 text-xl font-semibold')}>Опыт работы</h2>
                <div className="flex flex-col gap-4">
                  {resume.workExperiences.map((exp, i) => (
                    <Panel key={i} padding="lg" tone="elevated">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-semibold text-[var(--text)]">{exp.position}</span>
                          <span className="text-xs text-[var(--muted)]">{formatDuration(exp.startDate, exp.endDate)}</span>
                        </div>
                        <span className="text-sm text-[var(--muted)]">{exp.companyName}</span>
                        {exp.description && (
                          <p className="mt-1 text-sm leading-5 text-[var(--editorial-dark-muted)]">{exp.description}</p>
                        )}
                      </div>
                    </Panel>
                  ))}
                </div>
              </div>
            ) : (
              <Panel className="border-[var(--border-default)] bg-[var(--surface-card)] py-8 text-center" tone="elevated">
                <div className="flex flex-col items-center gap-2">
                  <Search className="text-[var(--muted)]" size={24} strokeWidth={1.8} />
                  <p className="text-sm text-[var(--muted)]">Опыт работы не указан.</p>
                </div>
              </Panel>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resume.skills.length > 0 && (
                <Panel className="border-[var(--border-default)] bg-[var(--surface-card)]" padding="lg" tone="elevated">
                  <h2 className={cn(displayFont.className, 'mb-3 text-lg font-semibold')}>Навыки</h2>
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-[var(--radius-pill)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-1 text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </Panel>
              )}

              {resume.employmentTypes.length > 0 && (
                <Panel className="border-[var(--border-default)] bg-[var(--surface-card)]" padding="lg" tone="elevated">
                  <h2 className={cn(displayFont.className, 'mb-3 text-lg font-semibold')}>Желаемая занятость</h2>
                  <div className="flex flex-wrap gap-2">
                    {resume.employmentTypes.map((type) => (
                      <span key={type} className="rounded-[var(--radius-pill)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-1 text-sm">
                        {employmentTypeLabel(type)}
                      </span>
                    ))}
                  </div>
                </Panel>
              )}

              {contactItems.length > 0 ? (
                <Panel className="border-[var(--border-default)] bg-[var(--surface-card)]" padding="lg" tone="elevated">
                  <h2 className={cn(displayFont.className, 'mb-3 text-lg font-semibold')}>Контакты</h2>
                  <div className="flex flex-col gap-4 text-sm">
                    {contactItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <AppLink className="inline-flex min-w-0 items-center gap-2 text-[var(--accent)] hover:underline" href={item.href} key={item.href}>
                          <Icon aria-hidden="true" className="shrink-0" size={14} />
                          <span className="break-all">{item.label}</span>
                        </AppLink>
                      );
                    })}
                  </div>
                </Panel>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
