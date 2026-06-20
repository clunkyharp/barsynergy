import { Quote } from 'lucide-react';
import { accentFont, bodyFont, displayFont } from '@/lib/fonts';
import type { HomepageData } from '@/lib/public/home';

export function HomeTestimonials({ testimonials }: { testimonials: HomepageData['testimonials'] }) {
  if (testimonials.length === 0) {
    return null;
  }

  const [featured, ...rest] = testimonials;
  const hasRest = rest.length > 0;

  return (
    <section
      aria-labelledby="home-testimonials-title"
      className="background-zone background-zone-beige render-deferred-section border-b border-[var(--line)] py-10 md:py-14"
      id="home-testimonials"
    >
      <div className="container">
        <div className="mb-8 max-w-[42rem]">
          <p className={`${accentFont.className} text-[10px] font-bold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]`}>
            Отзывы индустрии
          </p>
          <h2
            className={`${displayFont.className} mt-2 text-[2rem] font-semibold leading-none text-[var(--text)] md:text-[2.6rem]`}
            id="home-testimonials-title"
          >
            Платформой пользуются заведения и специалисты СКФО
          </h2>
        </div>
        <div className={`grid gap-4 md:gap-5 ${hasRest ? 'lg:grid-cols-[1.5fr_1fr]' : ''}`}>
          <figure
            className="relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[color-mix(in_oklab,var(--accent)_30%,var(--border-default))] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--surface-card)_80%,var(--accent)),var(--surface-card))] p-7 shadow-[var(--shadow-card)] md:p-8"
            key={`${featured.author}-${featured.city}`}
          >
            <Quote
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-4 -right-2 text-[color-mix(in_oklab,var(--accent)_16%,transparent)]"
              size={140}
              strokeWidth={1.5}
            />
            <Quote aria-hidden="true" className="relative text-[var(--accent)]" size={34} strokeWidth={2} />
            <blockquote className={`${bodyFont.className} relative mt-5 flex-1 text-[1.15rem] leading-8 text-[var(--text)] md:text-[1.25rem]`}>
              {featured.quote}
            </blockquote>
            <figcaption className="relative mt-6 border-t border-[color-mix(in_oklab,var(--accent)_22%,var(--border-default))] pt-5">
              <p className="text-[0.95rem] font-semibold text-[var(--text)]">{featured.author}</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                {featured.role} · {featured.city}
              </p>
            </figcaption>
          </figure>

          {hasRest && (
            <ul className="grid content-start gap-4">
              {rest.map((testimonial) => (
                <li
                  className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)]"
                  key={`${testimonial.author}-${testimonial.city}`}
                >
                  <blockquote className={`${bodyFont.className} flex-1 text-[0.9rem] leading-6 text-[var(--text)]`}>
                    <Quote aria-hidden="true" className="mr-2 inline-block align-[-0.2em] text-[var(--accent)]" size={18} strokeWidth={2} />
                    {testimonial.quote}
                  </blockquote>
                  <figcaption className="mt-4 border-t border-[var(--border-default)] pt-3">
                    <p className="text-sm font-semibold text-[var(--text)]">{testimonial.author}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      {testimonial.role} · {testimonial.city}
                    </p>
                  </figcaption>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
