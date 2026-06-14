import { PublicBodyText } from '@/components/public/public-primitives';
import { AppLink } from '@/components/ui/app-link';
import { Panel } from '@/components/ui/panel';

export type LogoGridItem = {
  name: string;
  label?: string;
  href?: string;
};

export function LogoGrid({ items, emptyText }: { items: LogoGridItem[]; emptyText: string }) {
  if (items.length === 0) {
    return (
      <Panel className="border-dashed border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
        <PublicBodyText>{emptyText}</PublicBodyText>
      </Panel>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => {
        const content = (
              <span className="flex min-h-[104px] items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-5 text-center transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:border-[var(--accent)]/25 group-hover:bg-[var(--surface-wash-strong)] motion-reduce:transition-none">
            <span>
              <span className="block text-lg font-semibold tracking-normal text-[var(--text)]">{item.name}</span>
              {item.label ? <span className="mt-2 block text-xs uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">{item.label}</span> : null}
            </span>
          </span>
        );

        return item.href ? (
          <AppLink className="group rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]" href={item.href} key={item.name}>
            {content}
          </AppLink>
        ) : (
          <div key={item.name}>{content}</div>
        );
      })}
    </div>
  );
}
