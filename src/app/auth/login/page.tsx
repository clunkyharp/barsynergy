import { PageHeader } from '@/components/ui/page-header';

export default function LoginPage() {
  return (
    <PageHeader
      eyebrow="Auth"
      title="Вход"
      description="Email/password авторизация будет реализована в Phase 4 на PostgreSQL sessions и httpOnly cookies."
    />
  );
}
