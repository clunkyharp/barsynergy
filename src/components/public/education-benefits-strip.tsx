import { SectionIcon, type SectionIconType } from '@/components/public/section-icon';
import { displayFont } from '@/lib/fonts';

const benefits: { icon: SectionIconType; text: string }[] = [
  { icon: 'education',  text: 'Проверенные программы' },
  { icon: 'coffee',     text: 'Практическая польза' },
  { icon: 'handshake',  text: 'Сообщество' },
  { icon: 'sponsor',    text: 'Сертификаты' },
];

export function EducationBenefitsStrip() {
  return (
    <section className="border-b border-[var(--line)] bg-[var(--editorial-dark-surface)] py-10 md:py-14" data-theme="dark">
      <div className="container">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
          {benefits.map((benefit) => {
            return (
              <div
                className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--editorial-dark-border)] bg-[var(--editorial-dark-surface-muted)] px-4 py-6 text-center md:px-5 md:py-7"
                key={benefit.text}
              >
                <SectionIcon size={48} type={benefit.icon} />
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
