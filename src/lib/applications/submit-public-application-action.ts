import { ApplicationType } from '@prisma/client';
import {
  type CreatePublicApplicationInput,
  createPublicApplication
} from '@/lib/applications/create-public-application';
import {
  getString,
  type PublicApplicationResult,
  resolvePublicApplicationActionError
} from '@/lib/applications/public-form-helpers';
import {
  assertPublicApplicationFormsEnabled,
  assertPublicApplicationSubmissionAllowed,
  hasHoneypotValue
} from '@/lib/applications/public-submission-guards';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { assertTurnstilePassed } from '@/lib/security/turnstile';

type SubmitPublicApplicationActionInput<TParsed> = {
  actionName: string;
  applicationType: ApplicationType;
  formData: FormData;
  parse: (formData: FormData) => TParsed | Promise<TParsed>;
  buildApplication: (parsed: TParsed) => CreatePublicApplicationInput | Promise<CreatePublicApplicationInput>;
  successMessage: string;
};

export async function submitPublicApplicationAction<TParsed>({
  actionName,
  applicationType,
  formData,
  parse,
  buildApplication,
  successMessage
}: SubmitPublicApplicationActionInput<TParsed>): Promise<PublicApplicationResult> {
  try {
    await assertSameOriginServerAction();
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      return { type: 'success', message: successMessage };
    }

    const turnstileToken = getString(formData, 'turnstileToken');
    if (turnstileToken) {
      await assertTurnstilePassed(turnstileToken);
    }

    const parsed = await parse(formData);
    await assertPublicApplicationSubmissionAllowed(applicationType);
    const application = await createPublicApplication(await buildApplication(parsed));

    return { type: 'success', message: successMessage, applicationId: application.id };
  } catch (error) {
    return { type: 'error', message: resolvePublicApplicationActionError(actionName, error) };
  }
}
