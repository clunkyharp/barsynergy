# Homepage Data Source Audit

Last updated: 2026-05-05

Purpose: keep public homepage UI changes CMS/admin-first. New homepage content must name its data source and admin editing path before implementation.

| Public block | Model/source | Admin path | Public status filter | Fallback / remaining hardcode |
| --- | --- | --- | --- | --- |
| Hero title, intro copy and launch signals | `HomepageHero` | `/admin/homepage` | `status = PUBLISHED`; first by priority | Minimal `BARSYNERGY` fallback if no published hero exists |
| Main route index | Hardcoded route map in `homepage-client.tsx` | None | None | Needs menu/navigation settings editor |
| Audience cards | `HomepageAudienceCard` | `/admin/homepage` | `status = PUBLISHED`; ordered by priority | Hidden if no published cards exist |
| Course spotlight | `Course` | `/admin/courses` | `status = PUBLISHED` | No separate featured selector |
| Event spotlight | `Event` | `/admin/events` | `status = PUBLISHED` | No separate featured selector |
| Article spotlight | `Article` + active `ArticleTag` | `/admin/articles`, `/admin/tags` | `status = PUBLISHED`; tags require `isActive = true` | No separate featured selector |
| Vacancy spotlight | `Vacancy` | `/admin/vacancies` | `status = PUBLISHED` | No separate featured selector |
| Supplier spotlight | `Supplier` | `/admin/suppliers` | `status = PUBLISHED`; homepage prefers verified suppliers | No separate featured selector |
| Partner signal list | `Partner` | `/admin/partners` | `status = PUBLISHED`; featured flag can narrow lists | Fallback text and ordering are not editable |
| General sponsor block | `GeneralSponsor` | `/admin/general-sponsors` | `status = PUBLISHED` | No separate homepage placement settings |
| Taxonomy filters | `Category`, `City`, `Tag` | `/admin/categories`, `/admin/cities`, `/admin/tags` | Taxonomy options require `isActive = true` | Public menu/filter labels still partly depend on page code |
| Social cards | `HomepageSocialBlock` | `/admin/homepage` | `status = PUBLISHED`; ordered by priority | Section hidden if no published social cards exist; section heading still lives in component |
| Cost calculator teaser | `HomepageCalculatorTeaser` | `/admin/homepage` | `status = PUBLISHED`; first by priority | Hidden if no published teaser exists |
| Final/about CTA sections | `HomepageCtaBlock` | `/admin/homepage` | `status = PUBLISHED`; first by priority | Hidden if no published CTA exists |

Current rule:

- Public sponsor content is stored in `GeneralSponsor`; public pages read only `PUBLISHED` records.
- Homepage hero, audience cards, social cards, community CTA and calculator teaser are stored in homepage CMS models and read only `PUBLISHED` records.
- Public article tags are stored in `Tag`/`ArticleTag`; public article list/detail reads only active article tags.
- Admin taxonomy for categories, cities and tags is `ADMIN`-only and uses `isActive` instead of hard delete in the normal UI.
- Draft, review and archived sponsor/content records are not shown on public list/detail reads.
- If there is no published sponsor, the homepage sponsor block is not rendered; `/general-sponsors` shows an empty state.

Still hardcoded after this batch:

- main homepage route index and route map;
- social section heading copy;
- main menu/navigation settings;
- site settings, social links and legal operator display settings;
- homepage featured-content selectors;
- SEO management;
- full media library and page builder.

Recommended next admin batch:

1. Add site navigation/settings for the remaining route-map and menu hardcode.
2. Add homepage featured selectors if editorial control over the live spotlight cards becomes necessary.
3. Add SEO and legal text/settings management after the homepage data model is stable.
