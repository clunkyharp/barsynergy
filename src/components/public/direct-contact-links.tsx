import { AppLink } from '@/components/ui/app-link';

type DirectContactLinksProps = {
  telegram?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
};

function normalizeTelegram(value: string): { href: string; label: string } | null {
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
  return { href: `tg://resolve?domain=${encodeURIComponent(username)}`, label: `@${username}` };
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

function splitField(value: string, pattern: RegExp): string[] {
  return value.split(pattern).map((s) => s.trim()).filter(Boolean);
}

export function DirectContactLinks({ telegram, phone, email, whatsapp }: DirectContactLinksProps) {
  const links: { href: string; label: string }[] = [];

  if (telegram) {
    for (const t of splitField(telegram, /[;,\n]/)) {
      const r = normalizeTelegram(t);
      if (r) links.push(r);
    }
  }
  if (whatsapp) {
    for (const w of splitField(whatsapp, /[/;,\n]/)) {
      const r = normalizeWhatsapp(w);
      if (r) links.push(r);
    }
  }
  if (phone) {
    for (const p of splitField(phone, /[/;,\n]/)) {
      const r = normalizePhone(p);
      if (r) links.push(r);
    }
  }
  if (email) {
    for (const e of splitField(email, /[;,\n]/)) {
      const r = normalizeEmail(e);
      if (r) links.push(r);
    }
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
