# BARSYNERGY Project Status

Last updated: 2026-06-20

## Current Branch

- Active branch: `dev`
- Production branch: `prod`
- Work mode: `QA` / deploy

## Current Phase

Phase 1-4 MVP foundation implemented.

Public personal-data forms remain disabled by default in production until `APPLICATION_FORMS_ENABLED=true`.

## Validation Snapshot

- `npm run lint` — pass (2 pre-existing unused-import errors fixed);
- `./node_modules/.bin/prisma validate` — pass;
- `npm test` — 338/343 pass (5 pre-existing failures: auth-registration, cookie-notice, home-feature-card, public-search-listing);
- known pre-existing failures unchanged from prior batches.

## Deployed 2026-06-20

UI polish batch + prod → dev sync deployed to `prod`:

### UI Polish

1. **Contacts page** — workflow section collapsed from cards to compact inline list; added heading before form.
2. **General sponsors** — packages reordered (Seasonal after General); cards redesigned with integrated CTA, recommended badge as floating pill, placements moved below CTA.
3. **Consulting** — removed per-direction action labels, unified CTA «Оставить заявку»; dropped «Для кого» section.
4. **Vacancies specialists** — `SpecialistFilters` extracted to standalone component; `SpecialistListSection` replaced with `PublishedContentSectionSpecialist`.
5. **DirectContactLinks** — extracted from `vacancy-direct-contacts`, generalized for master/supplier/vacancy detail pages.
6. **Homepage hero** — compressed stats section, removed audience route cards.
7. **Master detail** — wired contact fields (telegram, phone, email).
8. Various alignment fixes, CSS tweaks, admin form adjustments.

### Sync & Deploy

- `prod → dev` merge (backfilled 11 commits missing from dev);
- `dev → prod` fast-forward;
- both branches pushed to `origin`.

### VPS

Pull `prod` on VPS and restart:

```bash
git pull origin prod
npm run build
npm run prisma:migrate:deploy
npm run start    # or restart process manager
```

## SEO Audit Fixes (2026-06-19)

Applied from Semrush + live HTTP audit findings:

### Changes

1. **Canonical for specialist detail pages** — `generateMetadata` in `/specialists/cv/[handle]` and `/specialists/svc/[slug]` now sets `alternates.canonical` with the full URL. Previously inherited root layout's canonical (homepage), causing Semrush «Incorrect pages found in sitemap.xml».

2. **/legal index page** — Created `src/app/(public)/legal/page.tsx` to resolve the 404. Breadcrumbs in `document-header.tsx` referenced `/legal` («Юридический раздел») but no route existed. The index page lists all 4 legal documents with descriptions and links.

3. **Long page titles** — Root layout `title.default` and homepage metadata shortened from 70 to 59 chars: «BARSYNERGY — кофейная индустрия СКФО: вакансии, поставщики, обучение» → «BARSYNERGY — вакансии, поставщики, обучение для кофеен СКФО».

4. **Broken external link** — Removed 4 `baristahustle.com` references from `scripts/seed-demo-screens.mjs` (403 response for audit checks). Perfect Daily Grind links kept as working alternatives.

### New files

- `src/app/(public)/legal/page.tsx` — legal documents index

### Changed files

- `src/app/(public)/specialists/cv/[handle]/page.tsx` — added canonical URL
- `src/app/(public)/specialists/svc/[slug]/page.tsx` — added canonical URL
- `src/app/layout.tsx` — shortened `title.default`
- `src/app/(public)/page.tsx` — shortened homepage metadata title
- `scripts/seed-demo-screens.mjs` — removed baristahustle.com references

### Not changed (documented)

- HSTS — requires nginx/proxy-level config, not in code
- No other external links were found broken beyond baristahustle.com
- `/llms.txt` 404 — low SEO priority, deferred

### Validation

- `npm run typecheck` — pass
- `npm run lint` — pass
- `node --test tests/seo-metadata-sitemap.test.mjs tests/site-header-navigation.test.mjs` — 7/7 pass

## Active Blockers / Risks

- Owner/legal review required before production personal-data collection;
- Production SMTP/Telegram credentials needed for real notifications;
- Production ingress needs real-host sign-off (HTTP→HTTPS, X-Real-IP, header rejection);
- `references/` is gitignored moodboard material — not to be merged to `prod`;
- Production deploy needs a release checkpoint commit pushed to `dev` and fast-forwarded into `prod`.

## Next Recommended Steps

1. Start Phase 5 only from a fresh implementation batch with its own mini-spec.
2. Before release work, create a clean checkpoint and keep `dev -> prod` flow explicit.

## Historical Notes

Detailed prior status logs archived to:

- `docs/archive/project-status-history-2026-05-22.md`
- `docs/archive/project-status-history-2026-06-18.md`

Those archives are historical context only, not the active task queue.
