# Security

## Phase 0 Rules

- Passwords are stored only as hashes.
- Sessions are stored in PostgreSQL.
- Main user session is not JWT.
- Cookies must be `httpOnly`; production cookies must be `secure`.
- Login and public business-access registration must be protected by persistent rate limits.
- Admin pages must be protected by role checks before real data is added.
- Do not log passwords or full personal data.
- Do not send full personal data to Telegram.
- Do not automatically send vacancy responses or resume files to employers before admin review and explicit candidate consent.
- Validate env with Zod.
- Validate future form input with Zod on the server.
- Validate uploads by mime type, extension, size, file signature, auth and permissions.

## Current Security Controls

- Login and business-access registration use `AuthAttemptThrottle` for persistent per-email and per-IP throttling.
- Login performs a dummy bcrypt comparison for unknown emails to reduce timing-based email enumeration.
- Public application forms use a separate `ApplicationSubmissionThrottle`.
- Public content image uploads require matching MIME type, filename extension and image signature.
- Private resume uploads require matching MIME type, filename extension and document signature.
- Local `/uploads/...` serving is allowed only for local storage, path-contained files and public `UploadedFile` records.
- Production Nginx sets baseline security headers, including CSP, clickjacking protection, `nosniff`, referrer policy and permissions policy.
- Nginx overwrites `X-Forwarded-For` with `$remote_addr` before forwarding to the app, so app-level throttles do not trust spoofed inbound forwarding chains from direct clients.

## Production Data

User personal data must be stored on Russia-compatible infrastructure.

Google Forms is allowed only for anonymous surveys and research forms without personal data.
It is not allowed for applications, contacts, files, registration, vacancy responses, partners, suppliers or any personal-data collection.
