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
  redirectWithResult: (result: PublicApplicationResult) => never;
  successMessage: string;
};

export async function submitPublicApplicationAction<TParsed>({
  actionName,
  applicationType,
  formData,
  parse,
  buildApplication,
  redirectWithResult,
  successMessage
}: SubmitPublicApplicationActionInput<TParsed>) {
  let result: PublicApplicationResult;

  try {
    await assertSameOriginServerAction();
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      result = { type: 'success', message: successMessage };
      redirectWithResult(result);
    }

    await assertTurnstilePassed(getString(formData, 'turnstileToken'));

    const parsed = await parse(formData);
    await assertPublicApplicationSubmissionAllowed(applicationType);
    await createPublicApplication(await buildApplication(parsed));

    result = { type: 'success', message: successMessage };
  } catch (error) {
    result = { type: 'error', message: resolvePublicApplicationActionError(actionName, error) };
  }

  redirectWithResult(result);
}
