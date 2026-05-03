import type { Metadata } from 'next';
import { LegalDraftPage } from '@/components/public/legal-draft-page';
import { buildLegalMetadata, getPersonalDataConsentDocument } from '@/lib/legal/legal-documents';

const personalDataConsentDocument = getPersonalDataConsentDocument();
export const metadata: Metadata = buildLegalMetadata(personalDataConsentDocument);

export default function PersonalDataConsentPage() {
  return <LegalDraftPage document={personalDataConsentDocument} />;
}
