import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { unsubscribeEmailSubscriptionById } from '@/lib/notifications/email-subscription/service';
import { verifyEmailUnsubscribeSig } from '@/lib/notifications/email-subscription/unsubscribe-url';

export const metadata: Metadata = {
  title: 'Отписка от рассылки',
  robots: { index: false, follow: false }
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sig?: string }>;
};

export default async function NewsletterUnsubscribeEmailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { sig } = await searchParams;

  const valid = id && sig && verifyEmailUnsubscribeSig(id, sig);
  const unsubscribed = valid ? await unsubscribeEmailSubscriptionById(id) : false;

  return (
    <main className="bg-[var(--background)] py-16 text-[var(--text)]">
      <div className="container max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">BARSYNERGY — рассылка</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight">
          {unsubscribed ? 'Вы отписались от рассылки' : 'Ссылка не сработала'}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          {unsubscribed
            ? 'Мы больше не будем отправлять уведомления на этот email.'
            : 'Ссылка недействительна или уже была использована.'}
        </p>
        <div className="mt-7">
          <Button href="/" variant="secondary">На главную</Button>
        </div>
      </div>
    </main>
  );
}
