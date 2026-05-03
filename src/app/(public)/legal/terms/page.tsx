import type { Metadata } from 'next';
import { LegalDraftPage } from '@/components/public/legal-draft-page';
import { buildLegalMetadata, getTermsDocument } from '@/lib/legal/legal-documents';

const termsDocument = getTermsDocument();
export const metadata: Metadata = buildLegalMetadata(termsDocument);

export default function TermsPage() {
  return <LegalDraftPage document={termsDocument} />;
}
