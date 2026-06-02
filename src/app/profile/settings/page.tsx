import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Аккаунт"
        description="Здесь будут имя, город, контакты и настройки аккаунта."
        title="Настройки"
      />
      <Panel className="max-w-2xl" padding="lg" tone="elevated">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Скоро здесь</p>
        <p className="mt-3 text-lg font-semibold tracking-normal">Раздел в разработке</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Позже здесь можно будет изменить имя, город, контакты и короткое описание профиля.
        </p>
      </Panel>
    </div>
  );
}
