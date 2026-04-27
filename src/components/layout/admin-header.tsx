import { Badge } from '@/components/ui/badge';

export function AdminHeader() {
  return (
    <header className="flex flex-col gap-3 rounded-lg border border-[var(--line)] bg-white p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Admin foundation</p>
        <p className="mt-1 font-semibold">BARSYNERGY CMS shell</p>
      </div>
      <Badge>Phase 2 readiness</Badge>
    </header>
  );
}
