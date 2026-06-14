import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { confirmEmailSubscription } from '@/lib/notifications/email-subscription/service';

export const metadata: Metadata = {
  title: 'Подтверждение подписки',
  robots: { index: false, follow: false }
};

type NewsletterConfirmPageProps = {
  params: Promise<{ token: string }>;
};

export default async function NewsletterConfirmPage({ params }: NewsletterConfirmPageProps) {
  const { token } = await params;
  const confirmed = token ? await confirmEmailSubscription(token) : false;

  return (
    <main className="bg-[var(--background)] py-16 text-[var(--text)]">
      <div className="container max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">BARSYNERGY — рассылка</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight">
          {confirmed ? 'Подписка подтверждена' : 'Ссылка не сработала'}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          {confirmed
            ? 'Теперь мы сможем присылать еженедельную подборку по выбранным темам.'
            : 'Ссылка уже использована, устарела или была изменена. Попробуйте подписаться ещё раз.'}
        </p>
        <div className="mt-7">
          <Button href="/articles">Перейти к материалам</Button>
        </div>
      </div>
    </main>
  );
}
