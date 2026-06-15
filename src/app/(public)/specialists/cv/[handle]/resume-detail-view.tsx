import type { getPublishedResumeDetail } from '@/lib/public/content';
import { PageHero } from '@/components/public/page-hero';
import { Panel } from '@/components/ui/panel';
import { AppLink } from '@/components/ui/app-link';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Briefcase, MapPin, Phone, Send, Globe } from 'lucide-react';

type ResumeDetail = NonNullable<Awaited<ReturnType<typeof getPublishedResumeDetail>>>;

function formatDate(d: Date): string {
  return d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

function formatDuration(start: Date, end: Date | null): string {
  const startStr = formatDate(start);
  if (!end) return `${startStr} — настоящее время`;
  return `${startStr} — ${formatDate(end)}`;
}

export function ResumeDetailView({ resume }: { resume: ResumeDetail }) {
  return (
    <>
      <PageHero
        title={resume.fullName ?? 'Специалист'}
        subtitle={resume.headline ?? resume.profession ?? undefined}
        tone="graphite"
      />

      <section className="public-section">
        <div className="public-section-inner">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-col gap-8">
              {resume.imageUrl && (
                <div className="flex justify-center">
                  <div className="size-24 overflow-hidden rounded-full border-2 border-[var(--border-default)] md:size-32">
                    <img
                      alt={resume.fullName ?? ''}
                      className="size-full object-cover"
                      src={resume.imageUrl}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                {resume.cityName && (
                  <span className="inline-flex items-center gap-1.5 text-[var(--muted)]">
                    <MapPin size={14} />
                    {resume.cityName}
                  </span>
                )}
                {resume.profession && (
                  <span className="inline-flex items-center gap-1.5 text-[var(--muted)]">
                    <Briefcase size={14} />
                    {resume.profession}
                  </span>
                )}
                {resume.desiredSalary && (
                  <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-sm font-semibold text-[var(--accent-strong)]">
                    от {resume.desiredSalary.toLocaleString('ru-RU')} ₽
                    {resume.desiredSalaryMax ? ` до ${resume.desiredSalaryMax.toLocaleString('ru-RU')} ₽` : ''}
                  </span>
                )}
              </div>

              {resume.jobSearchStatus && (
                <div className="flex justify-center">
                  <span className={cn(
                    'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1 text-sm font-semibold',
                    resume.jobSearchStatus === 'ACTIVE'
                      ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                      : 'bg-[var(--surface-wash)] text-[var(--muted)]'
                  )}>
                    {resume.jobSearchStatus === 'ACTIVE' ? 'Активно ищет работу' : 'Открыт к предложениям'}
                  </span>
                </div>
              )}

              {resume.bio && (
                <Panel tone="elevated">
                  <p className="text-sm leading-6 text-[var(--editorial-dark-muted)] whitespace-pre-line">{resume.bio}</p>
                </Panel>
              )}

              {resume.skills.length > 0 && (
                <div>
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
                </div>
              )}

              {resume.employmentTypes.length > 0 && (
                <div>
                  <h2 className={cn(displayFont.className, 'mb-3 text-lg font-semibold')}>Желаемая занятость</h2>
                  <div className="flex flex-wrap gap-2">
                    {resume.employmentTypes.map((type) => (
                      <span key={type} className="rounded-[var(--radius-pill)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-1 text-sm">
                        {type === 'FULL_TIME' ? 'Полная занятость' : type === 'PART_TIME' ? 'Частичная занятость' : type === 'FREELANCE' ? 'Фриланс' : type === 'REMOTE' ? 'Удалённая работа' : type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {resume.workExperiences.length > 0 && (
                <div>
                  <h2 className={cn(displayFont.className, 'mb-4 text-lg font-semibold')}>Опыт работы</h2>
                  <div className="flex flex-col gap-4">
                    {resume.workExperiences.map((exp, i) => (
                      <Panel key={i} tone="elevated">
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
              )}

              <Panel tone="elevated">
                <h2 className={cn(displayFont.className, 'mb-3 text-lg font-semibold')}>Контакты</h2>
                <div className="flex flex-col gap-3 text-sm">
                  {resume.phone && (
                    <AppLink className="inline-flex items-center gap-2 text-[var(--accent)] hover:underline" href={`tel:${resume.phone}`}>
                      <Phone size={14} />
                      {resume.phone}
                    </AppLink>
                  )}
                  {resume.telegram && (
                    <AppLink className="inline-flex items-center gap-2 text-[var(--accent)] hover:underline" href={`https://t.me/${resume.telegram.replace(/^@/, '')}`}>
                      <Send size={14} />
                      {resume.telegram}
                    </AppLink>
                  )}
                  {resume.website && (
                    <AppLink className="inline-flex items-center gap-2 text-[var(--accent)] hover:underline" href={resume.website}>
                      <Globe size={14} />
                      {resume.website}
                    </AppLink>
                  )}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
