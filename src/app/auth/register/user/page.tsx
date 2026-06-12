import type { Metadata } from 'next';
import { BookOpen, BriefcaseBusiness, Check, CheckCircle, Mail, PackageCheck } from 'lucide-react';
import { AuthSplitLayout } from '@/components/auth/auth-split-layout';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { RegisterUserForm } from '@/components/public/register-user-form';
import { registerUserAction } from '@/app/auth/register/actions';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

type RegisterUserPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Регистрация участника',
  description: 'Регистрация специалиста в сообществе BARSYNERGY.'
});

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const onboardingSteps = [
  { label: 'Аккаунт создан', done: true },
  { label: 'Подтвердите email', done: false, active: true },
  { label: 'Войдите и исследуйте платформу', done: false },
];

const platformHighlights = [
  {
    icon: BriefcaseBusiness,
    title: 'Вакансии',
    description: 'Открытые позиции в барах и кофейнях СКФО',
    href: '/vacancies',
  },
  {
    icon: BookOpen,
    title: 'Обучение',
    description: 'Интенсивы и курсы для специалистов',
    href: '/education',
  },
  {
    icon: PackageCheck,
    title: 'Поставщики',
    description: 'Проверенные компании для вашего бизнеса',
    href: '/suppliers',
  },
];

function RegisterSuccessOnboarding() {
  return (
    <div className="w-full space-y-8">
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-soft)]">
          <CheckCircle aria-hidden className="text-[var(--accent)]" size={36} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className={cn(displayFont.className, 'text-[1.75rem] font-semibold leading-tight text-[var(--text)]')}>
            Аккаунт создан!
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
            Осталось один шаг — подтвердите email, чтобы войти.
          </p>
        </div>
      </div>

      {/* Email check CTA */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-contrast)]">
            <Mail aria-hidden size={16} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[var(--text)]">Проверьте почту</p>
            <p className="mt-0.5 text-[12px] leading-5 text-[var(--muted)]">
              Мы отправили письмо со ссылкой для подтверждения. Если не видите — проверьте папку «Спам».
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Следующие шаги</p>
        <ol className="space-y-1.5">
          {onboardingSteps.map((step, i) => (
            <li
              className={cn(
                'flex items-center gap-3 rounded-[var(--radius-md)] border px-3.5 py-2.5',
                step.done
                  ? 'border-[var(--accent)]/20 bg-[var(--accent-soft)]'
                  : step.active
                  ? 'border-[var(--border-default)] bg-[var(--surface-card)]'
                  : 'border-[var(--border-subtle)] bg-transparent opacity-50'
              )}
              key={i}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                  step.done
                    ? 'bg-[var(--accent)] text-[var(--accent-contrast)]'
                    : step.active
                    ? 'border-2 border-[var(--accent)] bg-transparent text-[var(--accent)]'
                    : 'border-2 border-[var(--border-default)] bg-transparent text-[var(--muted)]'
                )}
              >
                {step.done ? <Check aria-hidden size={11} strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn('text-[13px]', step.active ? 'font-semibold text-[var(--text)]' : 'text-[var(--muted)]')}>
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Platform highlights */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Что вас ждёт на платформе</p>
        <div className="grid grid-cols-3 gap-2">
          {platformHighlights.map((item) => (
            <AppLink
              className="group flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 text-center transition-colors hover:border-[var(--accent)]/35 hover:bg-[var(--accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              href={item.href}
              key={item.href}
            >
              <item.icon aria-hidden className="text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]" size={20} strokeWidth={1.5} />
              <span className="text-[11px] font-semibold leading-4 text-[var(--text)]">{item.title}</span>
            </AppLink>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2.5">
        <Button className="w-full rounded-[var(--radius-md)]" href="/auth/login">
          Войти после подтверждения
        </Button>
        <Button className="w-full rounded-[var(--radius-md)]" href="/" variant="secondary">
          Посмотреть платформу
        </Button>
      </div>
    </div>
  );
}

export default async function RegisterUserPage({ searchParams }: RegisterUserPageProps) {
  const params = (await searchParams) ?? {};
  const success = firstParam(params.success);
  const isSuccess = success === 'registered';

  return (
    <AuthSplitLayout>
      {isSuccess ? (
        <RegisterSuccessOnboarding />
      ) : (
        <>
          <h1 className="text-[28px] font-bold leading-[1.18] tracking-normal text-[var(--text)]">
            Регистрация участника
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Для специалистов бара, барменов и всех, кто работает в индустрии
          </p>
          <div className="mt-5 w-full">
            <RegisterUserForm action={registerUserAction} />
            <p className="mt-5 text-center text-sm text-[var(--muted)]">
              Уже есть аккаунт?{' '}
              <AppLink className="font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]" href="/auth/login">
                Войти
              </AppLink>
            </p>
          </div>
        </>
      )}
    </AuthSplitLayout>
  );
}
