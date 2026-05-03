# Personal Data Launch Checklist

This checklist must be completed before setting `APPLICATION_FORMS_ENABLED=true` in production.

## Technical State

Already handled in the repository:

- public legal pages exist at `/legal/privacy`, `/legal/personal-data-consent`, `/legal/terms` and `/legal/cookies`;
- public forms require a consent checkbox in server-side validation;
- accepted consent text is saved with application records;
- vacancy response forwarding is an admin-reviewed action, not automatic delivery to an employer;
- private resume files are served through an admin-only route;
- public pages show a technical-cookie notice;
- production startup fails if personal-data forms are enabled without required legal/operator readiness flags.

## Required Production Env

Fill real operator details:

```txt
LEGAL_OPERATOR_TYPE=legal_entity
LEGAL_OPERATOR_NAME=
LEGAL_OPERATOR_EMAIL=
LEGAL_OPERATOR_ADDRESS=
LEGAL_OPERATOR_TAX_ID=
LEGAL_OPERATOR_REGISTRATION_ID=
```

Then set these only after the real decision is complete:

```txt
LEGAL_OPERATOR_CONFIRMED=true
PERSONAL_DATA_LEGAL_REVIEW_APPROVED=true
PERSONAL_DATA_RKN_NOTIFICATION_CONFIRMED=true
PERSONAL_DATA_PROCESSOR_AGREEMENTS_CONFIRMED=true
PERSONAL_DATA_RETENTION_RULE_APPROVED=true
APPLICATION_FORMS_ENABLED=true
```

Do not set readiness flags to `true` just to bypass startup validation.

## Owner / Legal Decisions

The owner or legal reviewer must confirm:

- final operator identity and public contacts;
- whether the Roskomnadzor operator notification is already filed or must be filed before launch;
- which providers process personal data: hosting, object storage, email, Telegram/admin notifications, maintenance access and backups;
- whether processor agreements or written instructions are enough for each provider;
- final retention rule for applications and uploaded resumes;
- whether current legal pages are acceptable for the actual production entity and launch scenario.

## Verification Before Launch

Run:

```bash
npm run lint
npm test
npm run typecheck
npm run build
./node_modules/.bin/prisma validate
```

Then verify in browser:

- footer links open all legal pages;
- cookie notice appears on public pages;
- public forms cannot submit without consent;
- forms are hidden or disabled while `APPLICATION_FORMS_ENABLED=false`;
- production-like startup fails if `APPLICATION_FORMS_ENABLED=true` but readiness flags are missing.

## Keep Out Of Production Until Approved

- Foreign form builders, CRM, spreadsheets or file storage for personal-data collection.
- Analytics counters that are not described in `/legal/cookies` and `/legal/privacy`.
- Automatic employer forwarding of candidate responses.
- Public URLs for resume files.
- Publication of personal contact fields from submissions without separate publication consent.
