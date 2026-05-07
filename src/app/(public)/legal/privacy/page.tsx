import type { Metadata } from 'next';
import { LegalDraftPage } from '@/components/public/legal-draft-page';
import { buildLegalMetadata, getPrivacyDocument } from '@/lib/legal/legal-documents';

const privacyDocument = getPrivacyDocument();
export const metadata: Metadata = buildLegalMetadata(privacyDocument);

export default function PrivacyPage() {
  return <LegalDraftPage document={privacyDocument} />;
}
