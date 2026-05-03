import type { Metadata } from 'next';
import { LegalDraftPage } from '@/components/public/legal-draft-page';
import { buildLegalMetadata, getCookiesDocument } from '@/lib/legal/legal-documents';

const cookiesDocument = getCookiesDocument();
export const metadata: Metadata = buildLegalMetadata(cookiesDocument);

export default function CookiesPage() {
  return <LegalDraftPage document={cookiesDocument} />;
}
