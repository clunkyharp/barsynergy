import { GraduationCap, Star, Users, Award } from 'lucide-react';
import { displayFont } from '@/lib/fonts';

const benefits = [
  {
    icon: GraduationCap,
    text: 'Проверенные программы'
  },
  {
    icon: Star,
    text: 'Практическая польза'
  },
  {
    icon: Users,
    text: 'Сообщество'
  },
  {
    icon: Award,
    text: 'Сертификаты'
  }
] as const;

export function EducationBenefitsStrip() {
  return (
    <section className="border-b border-[var(--line)] bg-[var(--editorial-dark-surface)] py-10 md:py-14" data-theme="dark">
      <div className="container">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--editorial-dark-border)] bg-[var(--editorial-dark-surface-muted)] px-4 py-6 text-center md:px-5 md:py-7"
                key={benefit.text}
              >
                <span className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon size={24} strokeWidth={1.5} />
                </span>
                <span className={`${displayFont.className} text-[15px] font-semibold leading-tight text-[var(--editorial-dark-text)]`}>
                  {benefit.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
