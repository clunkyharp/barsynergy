import { ArticleBodyContent } from '@/components/public/article-body-content';
import { EditorialShell } from '@/components/ui/editorial-shell';
import type { PublicContentDetailFact } from '@/modules/content/shared/detail-helpers';
import { DirectContactLinks } from './direct-contact-links';

type SupplierContactRow = {
  typeLabel: string;
  serviceName: string;
  descriptor?: string;
  href?: string;
  actionLabel?: string;
};

type SupplierDetailBodyProps = {
  body?: string;
  facts: PublicContentDetailFact[];
  contactLabel?: string;
  contactTelegram?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  contactRail: React.ReactNode;
};

function normalizePhoneHref(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7 ? `tel:+${digits}` : undefined;
}

function normalizeWhatsappHref(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7 ? `https://wa.me/${digits}` : undefined;
}

function normalizeTelegramHref(value: string) {
  const raw = value.trim();
  if (!raw) return undefined;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const username = raw.startsWith('t.me/')
    ? raw.replace('t.me/', '')
    : raw.startsWith('@')
      ? raw.slice(1)
      : raw;
  return username ? `https://t.me/${encodeURIComponent(username)}` : undefined;
}

function normalizeEmailHref(value: string) {
  const raw = value.trim();
  return raw.includes('@') && !raw.startsWith('@') ? `mailto:${raw}` : undefined;
}

function parseContactPart(part: string): SupplierContactRow | null {
  const raw = part.trim();
  if (!raw) return null;

  const [maybeName, ...rest] = raw.split(':');
  const hasNamedValue = rest.length > 0;
  const typeLabel = hasNamedValue ? maybeName.trim() : 'Контакт';
  const value = hasNamedValue ? rest.join(':').trim() : raw;

  const emailHref = normalizeEmailHref(value);
  if (emailHref) {
    return { typeLabel, serviceName: 'Email', descriptor: value, href: emailHref, actionLabel: 'Написать' };
  }

  if (value.startsWith('@') || value.includes('t.me')) {
    return { typeLabel, serviceName: 'Telegram', descriptor: value, href: normalizeTelegramHref(value), actionLabel: 'Открыть' };
  }

  const phoneHref = normalizePhoneHref(value);
  if (phoneHref) {
    return { typeLabel, serviceName: 'Телефон', descriptor: value, href: phoneHref, actionLabel: 'Позвонить' };
  }

  return { typeLabel, serviceName: 'Контакт', descriptor: value };
}

function normalizeToDigits(value: string) {
  return value.replace(/\D/g, '');
}

function parseSupplierContactRows({
  contactLabel,
  contactPhone,
  contactTelegram,
  contactWhatsapp
}: Pick<SupplierDetailBodyProps, 'contactLabel' | 'contactPhone' | 'contactTelegram' | 'contactWhatsapp'>): SupplierContactRow[] {
  const rows = contactLabel
    ?.split(/[;\n/]+/)
    .map(parseContactPart)
    .filter((row): row is SupplierContactRow => Boolean(row)) ?? [];
  const labelDigits = normalizeToDigits(contactLabel ?? '');

  if (contactTelegram && !contactLabel?.toLocaleLowerCase('ru')?.includes(contactTelegram.toLocaleLowerCase('ru'))) {
    rows.push({ typeLabel: 'Telegram', serviceName: 'Telegram', descriptor: contactTelegram, href: normalizeTelegramHref(contactTelegram), actionLabel: 'Открыть' });
  }

  if (contactWhatsapp && !contactLabel?.toLocaleLowerCase('ru')?.includes(contactWhatsapp.toLocaleLowerCase('ru'))) {
    rows.push({ typeLabel: 'WhatsApp', serviceName: 'WhatsApp', descriptor: contactWhatsapp, href: normalizeWhatsappHref(contactWhatsapp), actionLabel: 'Написать' });
  }

  if (contactPhone && !labelDigits.includes(normalizeToDigits(contactPhone))) {
    rows.push({ typeLabel: 'Телефон', serviceName: 'Телефон', descriptor: contactPhone, href: normalizePhoneHref(contactPhone), actionLabel: 'Позвонить' });
  }

  return rows;
}

export function SupplierDetailBody({
  body,
  facts,
  contactLabel,
  contactTelegram,
  contactPhone,
  contactWhatsapp,
  contactRail,
}: SupplierDetailBodyProps) {
  const hasBody = Boolean(body?.trim());
  const infoFacts = facts.filter((f) => !['Компания', 'Статус', 'Условия', 'Категория', 'Город', 'География', 'Контакты'].includes(f.label));
  const hasRail = Boolean(contactRail);
  const contactRows = parseSupplierContactRows({ contactLabel, contactPhone, contactTelegram, contactWhatsapp });
  const hasDirectContacts = contactRows.length > 0;

  return (
    <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-9 md:py-12">
      <div className="container">
        <div className={`grid gap-8 ${hasRail ? 'xl:grid-cols-[1fr_minmax(18rem,0.38fr)] xl:gap-12' : ''}`}>
          <div className="min-w-0">
            {hasBody ? (
              <div className="max-w-[70ch]">
                <ArticleBodyContent markdown={body!} />
              </div>
            ) : null}

            {infoFacts.length > 0 ? (
              <div className="mt-10 max-w-[70ch]">
                <h2 className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">
                  Информация о компании
                </h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  {infoFacts.map((fact) => (
                    <div className="border-b border-[var(--line)] pb-3" key={fact.label}>
                      <dt className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">
                        {fact.label}
                      </dt>
                      <dd className="mt-1.5 text-sm leading-6 text-[var(--text)]">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>

          {hasRail ? (
            <aside
              className="xl:self-start scroll-mt-24"
              id="supplier-contact-rail"
            >
              <EditorialShell className="overflow-hidden">
                {hasDirectContacts ? (
                  <div className="border-b border-[var(--line)] px-5 pb-5 pt-5">
                    <p className="text-[11px] font-bold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">
                      Контакты поставщика
                    </p>
                    {contactLabel ? (
                      <p className="mt-2 text-sm leading-6 text-[var(--text)]">{contactLabel}</p>
                    ) : null}
                    <DirectContactLinks
                      telegram={contactTelegram}
                      phone={contactPhone}
                      whatsapp={contactWhatsapp}
                    />
                  </div>
                ) : null}
                <div className="border-b border-[var(--line)] px-5 pb-4 pt-5">
                  <p className="text-[11px] font-bold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">
                    Запрос поставщику
                  </p>
                </div>
                {contactRail}
                {hasDirectContacts ? (
                  <div className="border-t border-[var(--line)] px-5 py-4">
                    <a
                      className="inline-flex min-h-10 w-full items-center justify-center rounded-[var(--radius-sm)] border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-4 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                      href="#supplier-contact-rail"
                    >
                      Запросить условия
                    </a>
                  </div>
                ) : null}
              </EditorialShell>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
