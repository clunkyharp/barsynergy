# BARSYNERGY UI flow research QA

Date: 2026-05-03
Mode: QA
Scope: public pages, current preview branch.

## Goal

Check whether the redesigned public pages explain the main user actions through the interface itself, not through excessive helper copy. Use popular public products as pattern references, then map current BARSYNERGY user flows and identify unclear or over-explained areas before the next implementation batch.

## External pattern scan

### Platform homepage

References: Eater, PUNCH, SevenFifty Daily, Skift-style industry media.

Observed pattern:
- top navigation gives the main sections immediately;
- the homepage is an index of current content, not a long explanation of every capability;
- strong modules answer "what is new now", "where do I go", and "what action can I take";
- newsletter/contact/social are secondary modules, not primary explanation blocks.

Implication for BARSYNERGY:
- homepage should act as a role/action router plus current platform index;
- reduce generic explanatory blocks where a role card, content row, or direct CTA already explains the action.

### Events

References: Eventbrite and Meetup-style event discovery.

Observed pattern:
- search and filters sit before the event list;
- events are date-led rows/cards with title, location, format, date, price/status, and one clear next action;
- registration usually happens from a specific event detail or ticket/registration flow;
- list pages help users find events, detail pages help users decide and register.

Implication:
- keep agenda layout;
- avoid sending every event "Записаться" to a generic contacts page;
- registration should be tied to a specific event detail or event-specific form/link.

### Articles / knowledge

References: Eater, PUNCH, Medium, SevenFifty Daily.

Observed pattern:
- article index has featured story, categories, cards/rows, author/date/read time;
- article detail has category, title, author/date/read time, cover, readable body, related/next;
- empty editorial sections avoid pretending content exists.

Implication:
- if articles are not published, the page should behave as a prelaunch/editorial request page;
- if articles exist, it needs a real featured item and list, not mostly future-rubric explanation.

### Vacancies

References: LinkedIn, Indeed, Greenhouse job boards.

Observed pattern:
- list page is for search/filter/browse;
- application starts inside a specific vacancy detail;
- detail page has clear "Apply" action near the title and again near job details;
- employer posting is a separate flow from candidate application.

Implication:
- current latest fix matches this direction: list no longer has a vacancy select response form, detail has the response form tied to hidden vacancyId;
- next step is visual polish and reducing duplicated instruction text.

### Suppliers / directory

References: Yelp, Tripadvisor, Stripe partner directory.

Observed pattern:
- search input + location/category filters are the main mental model;
- result cards show name, category, geography, verification/trust signal, short description, and direct action;
- detail pages contain contact methods and proof, not only generic "contact us".

Implication:
- supplier list direction is correct;
- provider cards should make "open profile" and "contact supplier" visible without a long explanatory preface.

### Education

References: Coursera, edX, Udemy.

Observed pattern:
- course catalog supports search/filter by topic, level, format, duration;
- course/program detail carries the enrollment/enquiry action;
- when no live courses exist, platforms show upcoming formats or waitlist, not an empty catalog with heavy filters.

Implication:
- BARSYNERGY should split "programs available" from "custom training request";
- each format card should have an obvious next action: request, view details, or notify me.

### Partners

References: Stripe partner directory and B2B partnership pages.

Observed pattern:
- partnership pages separate formats/use cases from commercial sponsorship;
- logo grids show proof after the proposition;
- one primary CTA starts partnership inquiry.

Implication:
- current partner/sponsor split is right;
- reduce repeated explanation and make partnership formats act like selectable paths into the form.

### Sponsors

References: SXSW/Web Summit/TED-style sponsorship pages and conference sponsor prospectus pages.

Observed pattern:
- sponsorship pages sell outcomes: audience, visibility, placements, event/content options;
- packages are compared as tiers;
- "request sponsorship information" is the primary action;
- existing sponsor logos/cards act as proof and should not be mixed with package cards.

Implication:
- keep general sponsor card frozen;
- add a clear package comparison and a sponsor-specific inquiry route/form around it.

### Calculator

References: recipe costing and SaaS calculator patterns.

Observed pattern:
- calculators work best when the input/result relationship is visible immediately;
- result panel should be persistent or visually dominant;
- labels must include units, invalid states, and safe defaults;
- adding/removing rows must not change layout unexpectedly on mobile.

Implication:
- current MVP has the right core;
- next improvement is error prevention, units, empty states, and mobile rhythm rather than more explanatory text.

### Forms

References: GOV.UK Design System forms/errors, Baymard form label guidance, Typeform-style topic routing.

Observed pattern:
- labels are visible, placeholders are not the primary label;
- topic selection can route to different fields, but should be preselected when a user came from a specific CTA;
- errors should appear near the field and summarize at the top;
- success state should leave the user in the same task context.

Implication:
- keep universal contact form as fallback;
- specific flows should pass context into forms: event id, vacancy id, supplier/company topic, sponsor package.

## Current user flow map

### 1. Visitor wants orientation

Flow:
Home -> chooses role/section -> section page -> list/detail/form.

Current friction:
- homepage has many explanatory modules before and after the quick action area;
- some CTAs duplicate the same destination with different labels;
- user may read a lot before seeing concrete current content.

Recommendation:
- make homepage first viewport and next modules more like a platform dashboard: quick entries, "Сейчас", events/jobs/articles/suppliers, sponsor proof.
- remove or compress generic "what this platform does" blocks once the action grid is clear.

### 2. Visitor wants to attend an event

Flow:
Events -> search/filter -> event row -> event detail -> register/contact for that event.

Current friction:
- list row has "Записаться", but it goes to a generic contact topic, not a specific event;
- event application section is generic for event participation or proposal;
- event detail is not currently the clear registration hub.

Recommendation:
- list CTA "Подробнее" as main action, secondary "Записаться" only if it carries event context;
- detail page should include event-specific registration form or clear external registration link.

### 3. Visitor wants to read/use knowledge

Flow:
Knowledge -> categories/featured article -> article detail -> related/next or tool.

Current friction:
- page says materials are open, but much of the section behaves like future/prelaunch content;
- multiple CTAs compete: propose topic, become interview hero, get notification, jobs, calculator.

Recommendation:
- choose one state: live editorial index or prelaunch editorial request page.
- if live content is empty, show future rubrics plus two CTAs only.
- if content exists, add featured article and compact cards.

### 4. Candidate wants a job

Flow:
Vacancies -> search/filter -> vacancy detail -> apply form tied to vacancy.

Current state:
- now aligned after latest fix: application is on detail, no vacancy select on list.

Remaining friction:
- list and hero still explain the flow in text; the UI itself should make it obvious through row CTA and detail form.

Recommendation:
- keep candidate side minimal: search, filters, vacancy rows, apply on detail.

### 5. Employer wants to publish a vacancy

Flow:
Vacancies -> "Разместить вакансию" -> posting form.

Current friction:
- flow is present but shares visual territory with candidate guidance.

Recommendation:
- make "Для заведений" a compact action card near top and keep posting form at bottom or separate anchor.

### 6. Venue wants supplier

Flow:
Suppliers -> search/filter -> supplier card -> supplier profile -> contact supplier.

Current friction:
- list is close to expected pattern, but profile/contact flow should be stronger;
- "Связаться" should ideally happen on supplier profile or carry supplier context.

Recommendation:
- treat suppliers like a directory: result cards are scannable, profiles contain direct contact and trust info.

### 7. Team wants training

Flow:
Education -> pick program/format -> detail/request -> form.

Current friction:
- many format cards describe possibilities, but not all behave like selectable paths;
- if programs are not live, the page can feel like a catalog and prelaunch page at the same time.

Recommendation:
- split live programs from custom formats.
- make every format card's CTA route into a preselected training request.

### 8. Brand wants partnership

Flow:
Partners -> choose format -> proof/logos/examples -> partnership request.

Current friction:
- many explanatory blocks repeat the idea of formats;
- partner form is present, but selected format is not obviously carried into it.

Recommendation:
- make formats clickable and preselect the form topic/type.

### 9. Brand wants sponsorship

Flow:
Sponsors -> understand packages -> see proof -> request terms.

Current friction:
- current page has proof and package direction, but no dedicated sponsor inquiry form on the page;
- "Обсудить спонсорство" goes to generic contacts.

Recommendation:
- add sponsor-specific request form/anchor or preselected contact state.
- keep general sponsor card unchanged.

### 10. User wants calculator

Flow:
Home/Knowledge/Education -> calculator -> enter rows -> see result -> optionally contact/request training.

Current friction:
- calculation works, but empty/default row gives 0 result without enough error prevention;
- result could be more persistent while editing;
- mobile behavior should be checked after any layout change.

Recommendation:
- add better invalid/zero states, unit hints, and visual result persistence.

### 11. User wants generic contact

Flow:
Contacts -> topic -> fields -> submit.

Current friction:
- form is good as fallback, but many specific pages use it as primary action without passing enough context.

Recommendation:
- generic contact should stay fallback;
- section-specific actions should carry topic and entity context.

## Priority findings

### P1. Too many explanatory blocks are compensating for unclear flows

Impact: pages feel heavy and less obvious. Users must read text to understand what to do.

Fix direction: remove repeated "what this section is" blocks where direct search, cards, filters, or form context already explain the action.

Affected pages: home, knowledge, education, partners, sponsors, contacts.

### P1. Specific actions often fall back to generic contact

Impact: users lose context. Admins also receive weaker applications because event, supplier, sponsor package, or partnership format is not attached.

Fix direction: add entity-aware flows: event-specific registration, supplier-specific contact, sponsor-specific request, partnership format preselection.

Affected pages: events, suppliers, partners, sponsors, contacts.

### P1. Knowledge page mixes live editorial and prelaunch states

Impact: user cannot tell whether this is a readable media section or a future roadmap.

Fix direction: choose live index if articles exist; otherwise show clean empty/prelaunch state with fewer CTAs.

Affected pages: knowledge, homepage knowledge teaser.

### P2. Education mixes catalog, custom training, and future formats

Impact: user does not know whether they are buying/enrolling in a program or requesting a custom format.

Fix direction: separate "programs" from "custom request"; make format cards route to a preselected form.

Affected pages: education.

### P2. Sponsorship package flow is not concrete enough

Impact: commercial page can feel descriptive instead of actionable.

Fix direction: package comparison with concrete inclusions, then sponsor request form. General sponsor card stays frozen.

Affected pages: sponsors.

### P2. Directory details should own contact actions

Impact: supplier and partner cards open profiles, but contact intent can still drift to generic pages.

Fix direction: make detail pages the contact hub for the selected company/format.

Affected pages: suppliers, partners.

### P3. Calculator needs stronger input/result affordances

Impact: the tool works, but the empty state and zero values do not guide mistakes well.

Fix direction: unit labels, invalid hints, persistent result block, mobile card row check.

Affected pages: calculator.

## Recommended next implementation batch

1. Reduce helper-copy blocks on homepage, knowledge, education, partners, sponsors.
2. Add context-aware routing:
   - event detail registration;
   - supplier profile contact;
   - partnership format preselection;
   - sponsor request preselection/package.
3. Clean up knowledge state:
   - live editorial index if content exists;
   - otherwise compact prelaunch state.
4. Split education into:
   - live programs/list;
   - custom training formats/request.
5. Keep vacancy flow as currently fixed, then visually polish only.
6. Keep mobile menu unchanged.
7. Keep general sponsor card unchanged.

## Validation performed

- Browser Use in-app browser flow scan across:
  - `/`
  - `/events`
  - `/articles`
  - `/vacancies`
  - `/suppliers`
  - `/education`
  - `/partners`
  - `/general-sponsors`
  - `/tools/cost-calculator`
  - `/contacts`
- Playwright DOM scan for headings, CTAs, forms, explanatory copy markers, and horizontal overflow.
- No code implementation in this QA batch.

## Sources

- Nielsen Norman Group: 10 usability heuristics, especially recognition over recall and minimalist design: https://www.nngroup.com/articles/ten-usability-heuristics/
- Meetup event discovery and category/date/location patterns: https://www.meetup.com/find/
- Indeed job apply flow distinction between native apply and company-site apply: https://support.indeed.com/hc/en-us/articles/115002786323-About-Jobs-on-Indeed-What-You-Need-to-Know
- Eater editorial homepage/index structure: https://www.eater.com/
- PUNCH editorial/drinks media structure: https://punchdrink.com/
- Medium article platform baseline: https://medium.com/
- Yelp directory filters, category chips, result cards, and add-business empty/fallback action: https://www.yelp.com/search?find_desc=Restaurants&find_loc=New+York%2C+NY
- Stripe partner directory baseline: https://stripe.com/partners/directory
- Coursera course catalog baseline: https://www.coursera.org/courses
- GOV.UK form structure guidance: https://www.gov.uk/service-manual/design/form-structure
- GOV.UK error summary guidance: https://design-system.service.gov.uk/components/error-summary/
- Web Summit partner/sponsor inquiry and logo-proof pattern: https://websummit.com/partners/
