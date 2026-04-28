# Phase 3 Applications And Vacancy Flows Mini-Spec

Status: implemented at source level on 2026-04-28; owner decision captured on 2026-04-27.

This document freezes the Phase 3 application workflow before schema and form implementation starts.

Implementation note:

- The final implementation covers the unified `Application` schema, all planned public form types, public `vacancy_submission` and `vacancy_response` forms on `/vacancies`, admin list/detail review, status changes, internal notes, manual `forwarded_to_employer` metadata, private resume upload plus admin-only download, optional SMTP user confirmations, optional Telegram admin notifications and the shortcut that turns a `vacancy_submission` application into a draft `Vacancy`.
- Production form rendering still stays behind `APPLICATION_FORMS_ENABLED=false` until legal approval is complete.

## Goal

Build public application forms and admin processing without adding public profiles, employer cabinets, automatic matching, online payments or external form storage.

## Scope

In scope:

- unified `Application` model;
- public application forms;
- vacancy placement request from a business;
- vacancy response from a candidate;
- private resume/contact handling for vacancy responses;
- consent checkbox on every personal-data form;
- server-side validation;
- admin application list and detail view;
- application status changes;
- admin-reviewed employer forwarding for vacancy responses;
- admin notifications without full personal data;
- user confirmation notifications when an approved provider is configured;
- UTM capture.

Out of scope:

- user cabinet;
- saved reusable resume profile;
- public user profiles;
- employer self-service cabinet;
- automatic unreviewed forwarding to employers;
- automatic matching or ranking;
- external CRM or external form databases;
- online payment;
- subscriptions or premium access.

Owner decision on 2026-04-28:

- the first private cabinet should be for businesses only, but not inside the first Phase 3 public-form slice;
- general user profiles are deferred and should remain documented as a later product direction;
- Phase 3 forms must keep working for unauthenticated businesses and candidates;
- business account details are tracked separately in [Business account mini-spec](business-account-spec.md).

## Application Types

Recommended `ApplicationType` values:

```txt
course_application
event_application
vacancy_submission
vacancy_response
supplier_submission
partner_application
contact_message
corporate_training_application
certificate_order
```

All public forms must write to `Application`.

## Statuses

Recommended `ApplicationStatus` values:

```txt
new
in_review
contacted
forwarded_to_employer
payment_pending
paid_manually
approved
rejected
completed
archived
```

Status meaning:

- `new`: submitted and not reviewed yet;
- `in_review`: admin started processing;
- `contacted`: requester or candidate was contacted by the BARSYNERGY team;
- `forwarded_to_employer`: a vacancy response was reviewed and sent or manually transferred to the employer;
- `approved`: accepted for the next workflow step;
- `rejected`: declined or spam;
- `completed`: finished;
- `archived`: hidden from active admin queues.

Payment statuses are reserved for Phase 6 commercial flows and must not create online payment behavior in Phase 3.

## Vacancy Submission Flow

Businesses do not publish vacancies directly in MVP.

Flow:

```txt
Business submits vacancy request
-> Application(type = vacancy_submission, status = new)
-> admin reviews contact, role, city, terms and description
-> admin creates or updates a Vacancy record
-> admin publishes Vacancy when ready
```

The public form should collect only what is needed to review and rewrite the vacancy:

- company name;
- contact person;
- employer contact email and/or phone/Telegram;
- city;
- position;
- employment type;
- salary label;
- experience label;
- short description;
- full description or notes;
- consent to personal-data processing.

Employer contacts are private by default. Public display of contacts requires an explicit field or admin decision.

## Vacancy Response Flow

Candidates respond to a published vacancy through the site.

Flow:

```txt
Candidate submits response
-> Application(type = vacancy_response, status = new, vacancyId = published vacancy)
-> admin reviews response
-> admin forwards approved response to employer
-> Application status becomes forwarded_to_employer or rejected
```

The response must not be sent to the employer automatically before admin review.

The public response form should collect:

- candidate name;
- city;
- email and/or phone/Telegram;
- current role or experience summary;
- message to employer;
- optional resume file or resume URL;
- explicit consent to personal-data processing and transfer to the employer for this vacancy.

## Resume Handling

MVP resume data belongs to a specific `vacancy_response` application.

Do not build a reusable candidate profile or saved resume before Phase 4.

If resume files are implemented in Phase 3:

- store files through `StorageService`;
- persist them as `UploadedFile.visibility = private`;
- do not expose resume files through public URLs;
- allow only safe document formats and size limits;
- link files to the application through a dedicated field or relation;
- delete or archive according to the future retention policy.

The current implementation keeps both options: a private resume file upload and a fallback resume URL field.

## Employer Forwarding

Employer forwarding is an admin action, not a public automatic action.

The implementation must support one of these safe modes:

- automated email through an approved provider, then record `forwardedAt` and `forwardedById`;
- manual owner-approved contact outside the app, then admin marks the response as `forwarded_to_employer`.

Telegram admin notifications must not include full personal data or resume contents.

Employer-facing messages should include only the candidate data needed for this vacancy and only after explicit consent.

## Suggested Application Model Contract

Recommended fields:

- `id`;
- `type`;
- `status`;
- `subject`;
- `message`;
- `name`;
- `email`;
- `phone`;
- `telegram`;
- `cityId`;
- `vacancyId`;
- `resumeFileId`;
- `payload`;
- `consentAcceptedAt`;
- `consentText`;
- `utmSource`;
- `utmMedium`;
- `utmCampaign`;
- `forwardedAt`;
- `forwardedById`;
- `createdAt`;
- `updatedAt`.

Use `payload` only for type-specific fields that do not justify a first-class column yet. Frequently filtered fields should be real columns.

## Admin UX Contract

The admin applications area needs:

- paginated application list;
- filters by type and status;
- detail view;
- status controls;
- internal notes;
- spam/reject action;
- create vacancy from `vacancy_submission`;
- forward response to employer for `vacancy_response`;
- private file access for authorized admins only;
- table rows that do not expose full personal data.

## Legal And Data Rules

- Every public form with personal data must include an unchecked consent checkbox.
- Vacancy response consent must explicitly mention transfer of candidate data to the employer for the selected vacancy.
- Legal texts must be reviewed before forms collecting personal data are enabled in production.
- Production must keep public application forms behind `APPLICATION_FORMS_ENABLED=false` until legal approval is complete.
- Public application submissions must include at least a basic spam barrier: honeypot plus per-client rate limiting.
- `forwarded_to_employer` is allowed only for `vacancy_response` applications linked to a published vacancy context with accepted consent.
- Personal data and private files must stay on Russia-compatible infrastructure.
- Google Forms, Airtable, Notion, foreign CRM and foreign file storage must not be used for applications.

## Validation

Before Phase 3 is marked done:

```bash
npm run lint
npm test
npm run typecheck
npm run build
./node_modules/.bin/prisma validate
```

Additional expected checks:

- public forms cannot submit without consent;
- invalid application payloads fail server validation;
- vacancy responses are linked to published vacancies only;
- vacancy responses are not auto-forwarded to employers;
- production gate prevents personal-data form rendering unless explicitly enabled;
- spam honeypot submissions do not create `Application` records;
- repeated public submissions are rate-limited;
- invalid employer-forwarding status transitions are rejected;
- private resume files are not publicly reachable;
- admin can review, reject and forward a vacancy response;
- admin can turn a business vacancy request into a draft `Vacancy` without automatic publication;
- Telegram/admin notifications do not expose full personal data.
