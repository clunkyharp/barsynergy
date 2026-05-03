import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

const variantStyles = {
  telegram: {
    surfaceClassName:
      'border-white/12 bg-[linear-gradient(145deg,#59acee_0%,#2a8bd9_52%,#176ec0_100%)] shadow-[0_24px_56px_rgba(7,53,95,0.3)]',
    overlayClassName:
      'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_38%)]',
    glowClassName: 'bg-white/18',
    logoWrapClassName:
      'h-[168px] w-[168px] sm:h-[184px] sm:w-[184px] md:h-[202px] md:w-[202px] lg:h-[216px] lg:w-[216px] xl:h-[228px] xl:w-[228px]',
    logoClassName: 'opacity-[0.32]'
  },
  whatsapp: {
    surfaceClassName:
      'border-white/12 bg-[linear-gradient(145deg,#6fd26f_0%,#30b35b_50%,#17924b_100%)] shadow-[0_24px_56px_rgba(11,80,39,0.3)]',
    overlayClassName:
      'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_40%)]',
    glowClassName: 'bg-white/16',
    logoWrapClassName:
      'h-[184px] w-[184px] sm:h-[198px] sm:w-[198px] md:h-[218px] md:w-[218px] lg:h-[232px] lg:w-[232px] xl:h-[246px] xl:w-[246px]',
    logoClassName: 'opacity-[0.26]'
  },
  instagram: {
    surfaceClassName:
      'border-white/12 bg-[linear-gradient(140deg,#f39b48_0%,#df5f62_28%,#c4398a_62%,#6f57c8_100%)] shadow-[0_24px_56px_rgba(85,31,95,0.32)]',
    overlayClassName:
      'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_42%)]',
    glowClassName: 'bg-white/16',
    logoWrapClassName:
      'h-[186px] w-[186px] sm:h-[200px] sm:w-[200px] md:h-[220px] md:w-[220px] lg:h-[236px] lg:w-[236px] xl:h-[248px] xl:w-[248px]',
    logoClassName: 'opacity-[0.24]'
  }
} as const;

export type SocialCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
  logoSrc: string;
  variant: keyof typeof variantStyles;
};

export function SocialCard({ title, description, buttonLabel, href, logoSrc, variant }: SocialCardProps) {
  const styles = variantStyles[variant];

  return (
    <article
      aria-label={title}
      className={cn(
        'group relative min-h-[360px] overflow-hidden rounded-[28px] border text-white',
        styles.surfaceClassName
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/images/grain.svg')] opacity-[0.08]" />
      <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0', styles.overlayClassName)} />
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute right-4 top-1/2 z-[1] -translate-y-1/2 sm:right-5 md:right-6 xl:right-7',
          styles.logoWrapClassName
        )}
      >
        <div className={cn('absolute inset-[14%] rounded-full blur-3xl', styles.glowClassName)} />
        <Image
          alt=""
          aria-hidden="true"
          className={cn(
            'pointer-events-none relative h-full w-full select-none object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]',
            styles.logoClassName
          )}
          height={256}
          sizes="(max-width: 767px) 168px, (max-width: 1279px) 220px, 248px"
          src={logoSrc}
          width={256}
        />
      </div>

      <div className="relative z-[2] flex h-full flex-col justify-between gap-8 p-6 sm:p-7 md:p-8">
        <div className="relative z-[2] max-w-[calc(100%-10.75rem)] sm:max-w-[calc(100%-12rem)] md:max-w-[calc(100%-13.75rem)] lg:max-w-[54%] xl:max-w-[56%]">
          <h3 className={`${displayFont.className} display-tight text-[34px] leading-[0.92] sm:text-[38px] md:text-[36px]`}>
            {title}
          </h3>
          <p className="mt-4 text-sm leading-7 text-white/82 md:text-[15px]">{description}</p>
        </div>

        <div className="relative z-[2] max-w-[calc(100%-10.75rem)] sm:max-w-[calc(100%-12rem)] md:max-w-[calc(100%-13.75rem)] lg:max-w-[54%] xl:max-w-[56%]">
          <a
            className="inline-flex min-h-12 w-full max-w-[220px] items-center justify-center gap-2 rounded-full border border-white/68 bg-white/10 px-5 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:w-auto sm:min-w-[198px]"
            href={href}
            rel="noreferrer"
            target="_blank"
          >
            <span>{buttonLabel}</span>
            <ArrowUpRight className="shrink-0" size={16} />
          </a>
        </div>
      </div>
    </article>
  );
}
