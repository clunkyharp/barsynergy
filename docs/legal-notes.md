# Legal Notes

## MVP Pages

Required legal pages:

- `/legal/privacy`
- `/legal/personal-data-consent`
- `/legal/terms`
- `/legal/cookies`

Future payment pages:

- `/legal/offer`
- `/legal/refund-policy`

## Forms

Every public form must include consent:

```txt
Согласен с политикой обработки персональных данных и даю согласие на обработку персональных данных.
```

The form must not submit without consent. The visible checkbox text must link to both `/legal/privacy` and `/legal/personal-data-consent`.

Vacancy response forms must also make the transfer purpose clear:

```txt
Согласен на передачу отклика работодателю по выбранной вакансии после проверки.
```

Candidate responses and resume files must not be sent to an employer automatically. Admin review is required before transfer.

## Cookies

The public site must show a clear technical-cookie notice with links to:

- `/legal/cookies`;
- `/legal/privacy`.

Current code does not connect a separate analytics counter. If analytics is added later, update `/legal/cookies`, `/legal/privacy`, env docs and the production readiness checklist before enabling it.

## Operator And RKN Readiness

Before `APPLICATION_FORMS_ENABLED=true` in production:

- fill `LEGAL_OPERATOR_NAME`;
- fill `LEGAL_OPERATOR_EMAIL`;
- fill `LEGAL_OPERATOR_ADDRESS`;
- fill `LEGAL_OPERATOR_TAX_ID`;
- fill `LEGAL_OPERATOR_REGISTRATION_ID`;
- confirm whether the operator notification in the Roskomnadzor personal-data operator registry is required or already filed;
- confirm processor contracts or instructions for hosting, storage, email, notification and admin-operation providers.

The app now has fail-closed production flags for these decisions:

- `LEGAL_OPERATOR_CONFIRMED=true`;
- `PERSONAL_DATA_LEGAL_REVIEW_APPROVED=true`;
- `PERSONAL_DATA_RKN_NOTIFICATION_CONFIRMED=true`;
- `PERSONAL_DATA_PROCESSOR_AGREEMENTS_CONFIRMED=true`;
- `PERSONAL_DATA_RETENTION_RULE_APPROVED=true`.

Do not set these flags to `true` as a technical workaround. Each flag must match a real owner/legal decision.

## Production Review

Legal page text must be checked before public launch by the owner or a lawyer.
The current repository pages are implemented for the active MVP flows: public contact forms, applications, vacancy responses, auth and business-access scenarios.
Operator details are now expected from env so the public legal pages can switch between `legal_entity` and `individual_entrepreneur` without rewriting the routes. Production startup blocks enabling public personal-data forms until operator name, email, address, INN, registration ID and all personal-data readiness confirmations are filled.

## Sources Checked In The 2026-05-03 Batch

- Tilda Education article on 152-FZ website requirements: policy page, footer link, form consent, cookie notice, RKN notification and processor instructions.
- Tochka article on privacy policy structure: operator details, legal basis, data categories, user rights, retention, transfer, open publication and legal review.
- Roskomnadzor personal-data portal notification form: operator data, purposes, data categories, legal basis, actions, processing methods, security measures, retention condition, cross-border transfer flag and database location.
