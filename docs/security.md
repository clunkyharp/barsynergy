# Security

## Phase 0 Rules

- Passwords are stored only as hashes.
- Sessions are stored in PostgreSQL.
- Main user session is not JWT.
- Cookies must be `httpOnly`; production cookies must be `secure`.
- Admin pages must be protected by role checks before real data is added.
- Do not log passwords or full personal data.
- Do not send full personal data to Telegram.
- Do not automatically send vacancy responses or resume files to employers before admin review and explicit candidate consent.
- Validate env with Zod.
- Validate future form input with Zod on the server.
- Validate uploads by mime type, extension, size, auth and permissions.

## Production Data

User personal data must be stored on Russia-compatible infrastructure.

Google Forms is allowed only for anonymous surveys and research forms without personal data.
It is not allowed for applications, contacts, files, registration, vacancy responses, partners, suppliers or any personal-data collection.
