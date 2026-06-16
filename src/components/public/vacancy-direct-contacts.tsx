import { AppLink } from '@/components/ui/app-link';

type VacancyDirectContactsProps = {
  telegram?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
};

function normalizeTelegram(value: string): { type: 'link'; href: string; label: string } | null {
  const v = value.trim();
  if (!v) return null;

  let username: string;

  if (v.startsWith('http://') || v.startsWith('https://')) {
    const u = new URL(v);
    if (u.hostname === 't.me') {
      username = u.pathname.replace(/^\//, '');
    } else {
      return null;
    }
  } else if (v.startsWith('t.me/')) {
    username = v.replace('t.me/', '');
  } else if (v.startsWith('@')) {
    username = v.slice(1);
  } else {
    username = v;
  }

  if (!username) return null;
  return { type: 'link' as const, href: `tg://resolve?domain=${encodeURIComponent(username)}`, label: `@${username}` };
}

function normalizePhone(value: string): { href: string; label: string } | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 7) return null;
  return { href: `tel:+${digits}`, label: value.trim() };
}

function normalizeEmail(value: string): { href: string; label: string } | null {
  const v = value.trim();
  if (!v.includes('@')) return null;
  return { href: `mailto:${v}`, label: v };
}

function normalizeWhatsapp(value: string): { href: string; label: string } | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 7) return null;
  return { href: `https://wa.me/${digits}`, label: `WhatsApp ${value.trim()}` };
}

export function VacancyDirectContacts({ telegram, phone, email, whatsapp }: VacancyDirectContactsProps) {
  const links: { href: string; label: string }[] = [];

  if (telegram) {
    const t = normalizeTelegram(telegram);
    if (t) links.push(t);
  }
  if (whatsapp) {
    const w = normalizeWhatsapp(whatsapp);
    if (w) links.push(w);
  }
  if (phone) {
    const p = normalizePhone(phone);
    if (p) links.push(p);
  }
  if (email) {
    const e = normalizeEmail(email);
    if (e) links.push(e);
  }

  if (links.length === 0) return null;

  return (
    <div className="space-y-2">
      {links.map((link) => (
        <AppLink
          className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-4 py-2.5 text-sm font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]"
          href={link.href}
          key={link.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {link.label}
        </AppLink>
      ))}
    </div>
  );
}
