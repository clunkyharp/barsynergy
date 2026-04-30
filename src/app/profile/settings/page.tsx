import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Аккаунт"
        description="Управление вашими персональными данными и настройками аккаунта."
        title="Настройки"
      />
      
      <Panel className="flex h-[300px] flex-col items-center justify-center text-center" padding="lg" tone="elevated">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Скоро здесь</p>
        <p className="mt-3 text-lg font-semibold tracking-[-0.02em]">Раздел в разработке</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Здесь вы сможете изменить свое имя, город, контактные данные и биографию.
        </p>
      </Panel>
    </div>
  );
}
