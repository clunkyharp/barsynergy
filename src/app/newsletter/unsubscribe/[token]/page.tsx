import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { unsubscribeEmailSubscription } from '@/lib/notifications/email-subscription/service';

export const metadata: Metadata = {
  title: 'Отписка от рассылки',
  robots: { index: false, follow: false }
};

type NewsletterUnsubscribePageProps = {
  params: Promise<{ token: string }>;
};

export default async function NewsletterUnsubscribePage({ params }: NewsletterUnsubscribePageProps) {
  const { token } = await params;
  const unsubscribed = token ? await unsubscribeEmailSubscription(token) : false;

  return (
    <main className="bg-[var(--background)] py-16 text-[var(--text)]">
      <div className="container max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">BARSYNERGY — рассылка</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight">
          {unsubscribed ? 'Вы отписались от рассылки' : 'Ссылка не сработала'}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          {unsubscribed
            ? 'Мы больше не будем отправлять дайджест на этот email.'
            : 'Ссылка уже использована или была изменена.'}
        </p>
        <div className="mt-7">
          <Button href="/" variant="secondary">На главную</Button>
        </div>
      </div>
    </main>
  );
}
