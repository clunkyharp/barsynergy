import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';

export function AdminHeader() {
  return (
    <Panel className="backdrop-blur" padding="md" tone="elevated">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Админка BARSYNERGY</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Контент, заявки, бизнес-доступы и справочники собраны в одной рабочей области.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <MetaChip variant="filter">Заявки</MetaChip>
          <MetaChip variant="filter">Контент</MetaChip>
          <MetaChip variant="filter">Доступы</MetaChip>
        </div>
      </div>
    </Panel>
  );
}
