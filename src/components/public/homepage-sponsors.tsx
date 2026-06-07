import Image from 'next/image';
import Link from 'next/link';
import { accentFont, displayFont } from '@/lib/fonts';
import type { HomepageData } from '@/lib/public/home';

export function HomeSponsorLogoStrip({ sponsors }: { sponsors: HomepageData['generalSponsors'] }) {
  return (
    <section className="background-zone background-zone-sponsor render-deferred-section border-t border-[var(--line)] py-14" aria-labelledby="home-sponsors-title">
      <div className="container">
        <div className="mx-auto max-w-[860px]">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <span className="h-px bg-[rgba(168,124,56,0.38)]" aria-hidden="true" />
            <h2 className={`${accentFont.className} text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]`} id="home-sponsors-title">
              Генеральные спонсоры сезона
            </h2>
            <span className="h-px bg-[rgba(168,124,56,0.38)]" aria-hidden="true" />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {sponsors.map((sponsor) => (
              <article
                className="grid min-w-0 justify-items-center rounded-[10px] border border-[var(--editorial-dark-border)] bg-[rgb(255_255_255_/_0.035)] px-5 py-7 text-center"
                key={sponsor.id}
              >
                <div className="flex min-h-[10rem] w-full items-center justify-center">
                  {sponsor.logoSrc ? (
                    <Image
                      alt={sponsor.logoAlt}
                      className="h-auto max-h-36 w-auto max-w-[18rem] object-contain"
                      height={160}
                      sizes="288px"
                      src={sponsor.logoSrc}
                      width={288}
                    />
                  ) : (
                    <span className={`${displayFont.className} text-center text-3xl font-semibold leading-none text-[var(--editorial-dark-text)]`}>
                      {sponsor.name}
                    </span>
                  )}
                </div>
                <div className="mt-5 min-w-0">
                  <h3 className="text-base font-semibold text-[var(--editorial-dark-text)]">{sponsor.name}</h3>
                  <p className="mx-auto mt-2 max-w-[24rem] text-sm leading-6 text-[var(--editorial-dark-muted)]">
                    {sponsor.shortDescription}
                  </p>
                  <Link className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]" href={`/general-sponsors#general-sponsor-${sponsor.slug}`}>
                    Смотреть профиль →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
