import { Quote } from 'lucide-react';
import { accentFont, bodyFont, displayFont } from '@/lib/fonts';
import type { HomepageData } from '@/lib/public/home';

export function HomeTestimonials({ testimonials }: { testimonials: HomepageData['testimonials'] }) {
  if (testimonials.length === 0) {
    return null;
  }

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
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {testimonials.map((testimonial) => (
            <li
              className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]"
              key={`${testimonial.author}-${testimonial.city}`}
            >
              <Quote aria-hidden="true" className="text-[var(--accent)]" size={26} strokeWidth={2} />
              <blockquote className={`${bodyFont.className} mt-4 flex-1 text-[0.95rem] leading-7 text-[var(--text)]`}>
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-5 border-t border-[var(--border-default)] pt-4">
                <p className="text-sm font-semibold text-[var(--text)]">{testimonial.author}</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  {testimonial.role} · {testimonial.city}
                </p>
              </figcaption>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
