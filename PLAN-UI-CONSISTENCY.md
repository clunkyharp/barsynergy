# UI Consistency & Visual Upgrade Plan

## Context
Screenshots from production show several visual inconsistencies and weak spots.
This plan is for an implementation agent to execute sequentially.

---

## Task 1: Upgrade "О проекте" CTA block on homepage

**Problem:** The CTA at `#home-about` (the dark panel with "Присоединяйтесь к платформе...") has weak secondary link — plain muted text "О проекте ↗" with no visual weight. It looks like an afterthought.

**File:** `src/components/public/homepage-client.tsx:93-139`

**Current state:**
- Dark panel with `bg-[var(--editorial-dark-surface)]`, 2-col grid on md
- Primary button: accent-colored, good
- Secondary link (lines 115-131): plain `text-sm font-semibold text-[var(--editorial-dark-muted)]` — too weak

**Fix:**
1. Wrap secondary link in a ghost/outline button style instead of bare link:
   - Add `rounded-[var(--radius-md)] border border-[var(--editorial-dark-border)] px-5 min-h-11 hover:border-[var(--accent)]/40 hover:text-[var(--editorial-dark-text)]`
   - This gives it proper visual weight matching the primary without competing
2. Increase `max-w-[17rem]` on primary to `w-full` inside the flex col (both buttons same width on mobile)
3. Both links in secondary position (lines 117 and 125) need same treatment — they have identical markup

**Verify:** Both ctaBlock.secondaryHref path and fallback "/contacts" path get the same styling.

---

## Task 2: Make sponsorship package cards visually stronger

**Problem:** Cards are functional but visually flat. Non-recommended cards are plain white with thin border. User wants them "visually stronger."

**File:** `src/app/(public)/general-sponsors/page.tsx:233-321`

**Changes:**

### 2a. Non-recommended cards — add visual depth
Current (line 250): `border-[var(--border-default)] bg-[var(--surface-card)]`

Change to:
```
border-[var(--border-default)] bg-[var(--surface-card)] shadow-[var(--shadow-card)] hover:border-[var(--accent)]/20 hover:shadow-[var(--shadow-panel)] transition-[border-color,box-shadow] duration-[var(--motion-duration-base)]
```

### 2b. Recommended card — intensify the glow
Current (line 249): `border-[var(--accent)]/40 bg-gradient-to-b from-[var(--accent)]/[0.05] to-transparent shadow-[0_0_12px_-8px_var(--accent)]`

Change to:
```
border-[var(--accent)]/50 bg-gradient-to-b from-[var(--accent)]/[0.08] via-[var(--accent)]/[0.02] to-transparent shadow-[0_0_24px_-6px_var(--accent)]
```

### 2c. Non-recommended buttons — use secondary variant instead of hack
Current (lines 309-314): `!border-[var(--text)] !bg-[var(--text)] !text-[var(--background)] hover:opacity-80`

Replace with: `variant="secondary"` on the Button component (or `variant="inverse"` if available). The `!important` overrides are bad practice. If no suitable variant exists, use:
```
border-[var(--border-strong)] bg-transparent text-[var(--text)] hover:bg-[var(--surface-wash)] hover:border-[var(--accent)]/30
```
This makes them clearly clickable outline buttons, while recommended stays primary filled.

### 2d. Add subtle top accent line to recommended card
After the opening `<article>` tag for recommended, add:
```tsx
{pkg.recommended && (
  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 rounded-t-[var(--radius-lg)] bg-[var(--accent)]" />
)}
```

### 2e. Check icon styling
Current (line 289): `text-[var(--text)]` — plain text color
Change to: `text-[var(--accent)]` for recommended card's check icons (conditional)

---

## Task 3: Apply sponsorship-style card treatment to consulting page

**Problem:** Consulting page has direction cards using `.home-service-card` CSS pattern. These are already visually rich. The user wants something equivalent to the upgraded sponsorship cards.

**File:** `src/app/(public)/consulting/page.tsx:338-353` (direction cards section)
**CSS:** `src/app/styles/public.css:453-600` (`.home-service-card` styles)

**Assessment:** Consulting direction cards already have tone-specific colors, hover effects, tags, icons. They're different from sponsorship (pricing cards vs service cards). The main ask is making consulting's CTA section (lines 355-372) match the upgraded sponsorship treatment.

**Changes:**
1. The consulting CTA section (lines 355-372) uses plain buttons with no panel styling. Wrap it in a dark panel matching the homepage CTA pattern:
   - Add `rounded-[var(--radius-xl)] border border-[var(--editorial-dark-border)] bg-[var(--editorial-dark-surface)] p-6 md:p-8 shadow-[0_24px_72px_rgba(0,0,0,0.22)]` to the inner container
   - This makes it consistent with homepage CTA block

2. If the consulting page lacks a sponsorship-like packages section (it doesn't — it has direction cards), no changes needed to the direction cards themselves. They serve a different purpose.

---

## Task 4: Unify contact channel cards — use contacts page style everywhere

**Problem:** Two different UIs for social/channel cards:
- **Contacts page** (`src/components/public/contact-channels.tsx`): Rich cards with colored top border, icon box, display-font title, descriptor, helper text, copy button
- **Homepage** (`src/components/public/homepage-community.tsx` → `src/components/public/social-card.tsx`): Uses `FramedSpotlightCard` with background images, much simpler

User says: "окна с соц сетями и почтой надо сделать по аналогии того как они сделаны на главном экране" — wants contacts page to match homepage style.

**Wait — re-read:** "по аналогии того как они сделаны на главном экране" means make them LIKE the homepage version. So homepage social cards are the reference, contacts page cards should adopt that style.

**BUT** the homepage social cards use `FramedSpotlightCard` with generated background images and minimal text. The contacts page cards have MORE useful info (copy button, response times, descriptor). Simply replacing would lose functionality.

**Recommended approach:** Keep the contacts page ChannelCard structure but adopt the homepage's visual style:
1. In `contact-channels.tsx` ChannelCard, replace the flat `bg-[var(--surface-wash)]` + thin border with:
   - Dark background: `bg-[var(--editorial-dark-surface)]`
   - Add a gradient overlay or subtle background image per channel
   - Change text colors to editorial-dark variants
   - Keep copy button, helper text, descriptor (they're useful)
2. Wrap the entire ContactChannels section in a dark zone (`background-zone-graphite` or equivalent)
3. Style the section header to use editorial-dark tokens

**Alternative (simpler, recommended):** Since user explicitly said "по аналогии" — adopt the FramedSpotlightCard pattern from homepage. Replace the 4-card grid in contact-channels with the same `SocialLinkCard` component used on homepage. This loses copy button and response times, but achieves UI consistency.

**Decision for agent:** Go with the simpler approach — replace ContactChannels grid with SocialLinkCard instances. Move the response time info to tooltips or small text below. The copy button functionality can be preserved with a small overlay. BUT first confirm: the homepage `SocialLinkCard` only supports telegram/whatsapp/instagram (no email). Since email is being removed (Task 5), this works perfectly — 3 social channels rendered as `SocialLinkCard`.

**Files to modify:**
- `src/components/public/contact-channels.tsx` — replace ChannelCard grid with SocialLinkCard instances
- `src/components/public/contact-application-form-constants.ts` — remove email from `contactMethods` array
- May need to pass helper text as subtitle to `SocialLinkCard` or extend its props

---

## Task 5: Remove email (почта) mentions

**Problem:** User says "убери почту и ее упоминание, в будущем будет другая почта."

**Scope:** Remove email channel card and references to `Rushgroupbar@gmail.com` from public-facing UI. Keep the `SUPPORT_EMAIL` constant and backend references (they'll be updated later).

### 5a. Remove email from contactMethods array
**File:** `src/components/public/contact-application-form-constants.ts:16-26`
Delete the email entry (mark: 'EM', first item in array).

### 5b. Remove email channel card from contacts page
**File:** `src/components/public/contact-channels.tsx`
- Remove `Mail` from lucide imports
- Remove `email` from `toneIcons` object
- Remove email-specific logic (`isEmail`, `onEmailClick`, `EmailActionDialog`)
- Grid changes from `sm:grid-cols-2` (4 cards, 2×2) to `sm:grid-cols-3` (3 cards, 1 row)

### 5c. Remove EmailActionDialog import and usage
**File:** `src/components/public/contact-channels.tsx:6-7, 131`
Remove `EmailActionDialog` import and `<EmailActionDialog>` component.
The component file `src/components/public/email-action-dialog.tsx` can be left (not deleted) — it may be reused later.

### 5d. Remove email from fallback text in forms (lower priority)
Files that show email in disabled-form fallback messages:
- `src/components/public/application-form-section.tsx:272,306` — text says "напишите нам на {SUPPORT_EMAIL}"
- `src/components/public/contact-application-form.tsx:182` — mailto button
- `src/components/public/vacancy-application-forms.tsx:65` — mailto button
- `src/components/messaging/supplier-inquiry-form.tsx:69` — mailto button
- `src/components/ui/submission-result-dialog.tsx:75` — mailto button
- `src/app/auth/register/page.tsx:21,127,140` — registration disabled messages

**For these:** Replace email references with Telegram contact link. Change text from "напишите на {email}" to "напишите в Telegram @barsynergy" and update href from `mailto:` to `https://t.me/barsynergy`. Use `SUPPORT_TELEGRAM` constant from `src/lib/contact-info.ts`.

### 5e. Remove email from channel-accent.ts
**File:** `src/components/public/channel-accent.ts`
Remove `email` variant from the accent map (or leave it as unused — won't hurt).

---

## Task 6: Audit and fix duplicate UI patterns

**Problem:** User asked to check "все места где может быть два разных ui для одинаковых элемента, там где это ломает ux."

**Known duplicates found:**

### 6a. Social/channel cards (addressed in Task 4)
- Homepage: `SocialLinkCard` via `FramedSpotlightCard`
- Contacts: `ChannelCard` in `contact-channels.tsx`
→ Fixed by Task 4

### 6b. CTA blocks across pages
Three different CTA block styles:
1. **Homepage** (`homepage-client.tsx:93`): Dark panel, 2-col, displayFont title
2. **Homepage FAQ** (`home-cta-faq-section.tsx`): Dark gradient panel + FAQ accordion
3. **Consulting** (`consulting/page.tsx:355`): Plain `background-zone-cta` with no panel

→ Task 3 partially addresses this. After Task 3, consulting CTA will match homepage pattern.

Check these additional pages for CTA consistency:
- `src/app/(public)/general-sponsors/page.tsx` — has sponsor CTA sections
- `src/app/(public)/business/page.tsx` — may have CTA blocks
- `src/app/(public)/education/page.tsx` — may have CTA blocks

For each: if there's a bottom CTA section, it should use the dark-panel pattern (rounded card with editorial-dark-surface) or the plain background-zone-cta pattern consistently. Don't mix.

### 6c. Sponsorship package card buttons
Current: recommended uses `variant="primary"`, others use `!important` overrides.
→ Fixed by Task 2c

### 6d. `displayFont` vs `bodyFont` in card titles
Some card components use `displayFont.className` for titles, others use inline font-weight. Ensure all card-level titles (h3) in public pages use `displayFont` consistently.

Spot-check these files:
- `src/components/public/public-prelaunch-section.tsx` — card titles
- `src/components/public/homepage-current.tsx` — EditorialSupportCard titles
- `src/app/(public)/general-sponsors/page.tsx` — package card titles
- `src/app/(public)/consulting/page.tsx` — direction card titles

---

## Task 7: Homepage cards missing images

**Problem:** Some of the 6 cards in "Разделы для работы" section show gradient instead of image.

**File:** `src/lib/public/home.ts:172-177` (image overrides)
**File:** `src/components/public/homepage-current.tsx:108-112` (fallback gradient)

**Root cause:** Cards are populated from published DB content. When no content exists for a category, a fallback card is used with `isFallback: true`. Image overrides exist only for: `featuredArticle`, `vacancy`, `secondaryArticle`, `supplier`. Missing overrides for: `event`, `course` (education).

**Fix:**
1. Add hardcoded image overrides for `event` and `course` to `homepageEditorialImageOverrides` in `src/lib/public/home.ts:172-177`
2. Need actual images. Check what exists in `/public/images/home/` and `/public/images/generated/`
3. If no suitable images exist, generate or source them. As interim fix, reuse existing images:
   - `event`: could use `/images/home/current-event-card.png` (already assigned to `secondaryArticle`)
   - `course`: could use `/images/home/professional-education.webp`

**Admin fix (preferred):** Ensure admin publishes at least one item per category so real data populates instead of fallbacks. This is a content issue, not a code issue. The gradient fallback is intentional for empty categories.

---

## Execution Order

1. **Task 5** (email removal) — standalone, no deps
2. **Task 4** (unify channel cards) — depends on Task 5 (email gone = 3 channels = clean SocialLinkCard usage)
3. **Task 2** (sponsorship cards) — standalone
4. **Task 1** (CTA upgrade) — standalone
5. **Task 3** (consulting CTA) — after Task 1 (consistent CTA pattern)
6. **Task 6** (audit) — last, validates everything
7. **Task 7** (homepage images) — standalone, content-level fix

---

## Task 8: Translate raw English technical names in admin

**Problem:** Admin application detail page shows raw payload keys (`fullName`, `entityType`, `specializations`) and raw enum values (`INDIVIDUAL`, `MASTER_SUBMISSION`) instead of Russian labels.

### 8a. Add missing payload field labels
**File:** `src/lib/admin/application-utils.ts:113-152`

The `applicationPayloadFieldLabels` map is missing these keys (visible in screenshot):
```ts
fullName: 'Полное имя',
entityType: 'Тип профиля',
specializations: 'Специализации',
masterTitle: 'Название услуги',
serviceType: 'Тип услуги',
projectDetails: 'Описание проекта',
contactName: 'Имя контакта',
contactPhone: 'Телефон контакта',
contactEmail: 'Email контакта',
```

Add them to the `applicationPayloadFieldLabels` object.

### 8b. Translate enum values in payload display
**File:** `src/lib/admin/application-utils.ts:154-159`

The `applicationPayloadValueLabels` map only translates `source`. Add:
```ts
entityType: {
  INDIVIDUAL: 'Физическое лицо',
  BUSINESS: 'Юридическое лицо / ИП',
},
```

Also in `formatApplicationPayloadValue` (line 165), add a case for `entityType` similar to how `employmentType` is handled (line 190).

### 8c. Fix raw type in conversation contextLabel
**File:** `src/app/admin/applications/[applicationId]/page.tsx:58`

Current:
```ts
const contextLabel = application.vacancy?.title ?? application.supplier?.title ?? application.master?.title ?? application.type;
```

Fix — fall through to translated label instead of raw enum:
```ts
const contextLabel = application.vacancy?.title ?? application.supplier?.title ?? application.master?.title ?? applicationTypeLabels[application.type];
```

`applicationTypeLabels` is already imported at line 10.

### 8d. Full audit — grep for other raw enum renders
Search for patterns where `.type` is rendered directly:
```bash
grep -rn "application\.type\b" src/app/admin/ --include="*.tsx" | grep -v "===\|!==\|import\|where\|parse\|applicationTypeLabels\|selectedType"
```
Any hit that renders `.type` directly in JSX needs wrapping with `applicationTypeLabels[...]`.

---

## Task 9: Add delete action for applications

**Problem:** No way to delete applications from admin. User needs this on all application pages.

### 9a. Create delete server action
**File:** `src/app/admin/applications/actions.ts` (add to existing)

Add `deleteApplication(applicationId: string)` action:
- Require admin access via `requireAdminSectionAccess('applications')`
- Use `prisma.application.delete({ where: { id: applicationId } })`
- Handle cascade: check if messages exist in conversation — delete those first or cascade
- Redirect to `/admin/applications` after delete
- Add revalidation

### 9b. Add delete button to detail page
**File:** `src/app/admin/applications/[applicationId]/page.tsx`

Add a delete button in the header area (near the back link). Use a confirmation pattern:
- Red ghost button: "Удалить заявку"
- On click → confirm dialog: "Вы уверены? Заявка и все сообщения будут удалены."
- On confirm → call deleteApplication action

### 9c. Add delete button to list page (optional)
**File:** `src/app/admin/applications/page.tsx`

Add a small delete icon button in the actions column of each row, or add it as a dropdown menu action.

### 9d. Check cascade constraints
Before implementing, verify Prisma schema for `Application` model relations:
- `ConversationMessage` likely has `applicationId` FK — need `onDelete: Cascade` or manual delete
- `resumeFile` — check if it's a separate relation
- Check for other dependent records

---

## Task 10: Simplify processing workflow + publication button

**Problem:** The processing panel (status select + note + save) and the publication button ("Опубликовать мастера") are separate cards. User wants them simplified.

### 10a. Merge processing + publication into one panel
**Files:**
- `src/app/admin/applications/[applicationId]/_forms/processing-form.tsx`
- `src/app/admin/applications/[applicationId]/_forms/publication-form.tsx`
- `src/app/admin/applications/[applicationId]/page.tsx`

Current flow: two separate cards — "Обработка" (status + note) and "Мастер из заявки" (publish button).

Merge into single card:
1. Status select at top
2. Internal note textarea below
3. "Сохранить обработку" as secondary button
4. Divider
5. "Опубликовать мастера" as primary button (shown only when `canPublish` is true)

This reduces from 2 cards to 1, making the workflow clearer.

### 10b. Add quick status shortcuts
Instead of just a select dropdown, add quick-action buttons for common transitions:
- "На проверку" (→ IN_REVIEW)
- "Одобрить" (→ APPROVED)
- "Отклонить" (→ REJECTED)

These appear as small chips/buttons above the select, saving a click.

---

## Task 11: Auto-resize all textareas

**Problem:** All textareas use `resize-y` (manual drag handle). User wants: auto-resize based on content, no drag handle, good initial size.

### 11a. Update Textarea component
**File:** `src/components/ui/textarea.tsx`

Add auto-resize behavior using `field-sizing: content` CSS property (supported in Chrome 123+, Firefox 128+, Safari 18.2+). Fallback: JS-based auto-resize.

**Preferred approach (CSS-first):**
```css
field-sizing: content;
```

Add to textarea className: `field-sizing-content` (Tailwind v4 utility) or inline style.

**Fallback approach (JS):**
Add `useEffect` + `onInput` handler that sets `style.height = 'auto'` then `style.height = scrollHeight + 'px'`.

### 11b. Update field-styles.ts
**File:** `src/components/ui/field-styles.ts:3`

Change:
```ts
export const textareaFieldClassName = 'field-base min-h-36 resize-y px-4 py-3.5 text-[15px] leading-7';
```
To:
```ts
export const textareaFieldClassName = 'field-base min-h-36 resize-none px-4 py-3.5 text-[15px] leading-7';
```

Key changes:
- `resize-y` → `resize-none` (remove drag handle)
- Keep `min-h-36` (good initial size — 9rem ≈ ~5 lines)

### 11c. Add auto-resize logic to Textarea component
**File:** `src/components/ui/textarea.tsx`

Add auto-resize in the component:
```tsx
const adjustHeight = useCallback(() => {
  const el = innerRef.current;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}, []);

useEffect(() => {
  adjustHeight();
}, [adjustHeight, value]);

// In return:
<textarea
  ...
  onInput={adjustHeight}
/>
```

### 11d. Compose box textarea
**File:** `src/components/messaging/compose-box.tsx:96`

Current: `className="min-h-[72px] resize-y text-[14px]"`
Change to: `className="min-h-[72px] resize-none text-[14px]"`

The auto-resize from the component will handle growth. Initial `min-h-[72px]` (~3 lines) is fine for messaging.

### 11e. Affected files (42+ textarea usages)
Since the change is in the base `Textarea` component and `textareaFieldClassName`, all usages auto-inherit. Just verify no file overrides `resize-y` explicitly:

```bash
grep -rn "resize-y\|resize: vertical" src/ --include="*.tsx" --include="*.ts" --include="*.css"
```

Remove any `resize-y` overrides found.

---

## Task 12: Verify messaging system

**Problem:** User asks to check messaging works. The conversation thread shows "Сообщений пока нет" with compose box.

### 12a. Verify message sending works
**File:** `src/lib/messaging/send-message.ts`

Check:
- Server action validates input
- Message gets created in DB with correct `applicationId`, `senderRole`, `body`
- Page revalidates after send
- Optimistic UI in compose-box works

### 12b. Verify messages render correctly
**File:** `src/components/messaging/message-bubble.tsx`

Check:
- Admin messages show on right (platform sender)
- User messages show on left
- Timestamps render correctly
- Long messages wrap properly

### 12c. Verify compose box states
- Disabled state for closed applications (COMPLETED, REJECTED, ARCHIVED)
- Character count shows correctly
- Over-limit prevention works

This is a manual verification task — the agent should send a test message from admin on a test application and confirm it appears.

---

## Task 13: Verify "О проекте" / "About" sections work logically

**Problem:** User asks to check "о нас" works logically everywhere.

### 13a. Find all "О проекте" / "О нас" links
```bash
grep -rn "О проекте\|о проекте\|/about\|/project" src/ --include="*.tsx" -l
```

Check each renders, links to correct page, and the target page exists.

### 13b. Verify /about page
Check if `/about` or `/project` page exists and renders correctly. If it redirects, verify the redirect target.

### 13c. Verify footer "О проекте" link
Check the site footer has a working link and it goes to the right destination.

---

## Updated Execution Order

**Phase 1 — Admin fixes (Tasks 8-12):**
1. **Task 8** — translate raw English names in admin
2. **Task 11** — textarea auto-resize (global)
3. **Task 9** — application delete
4. **Task 10** — simplify processing workflow
5. **Task 12** — verify messaging (manual)
6. **Task 13** — verify "О проекте" links

**Phase 2 — Public UI (Tasks 1-7 from original plan):**
7. **Task 5** — email removal
8. **Task 4** — unify channel cards
9. **Task 2** — sponsorship cards
10. **Task 1** — CTA upgrade
11. **Task 3** — consulting CTA
12. **Task 6** — duplicate UI audit
13. **Task 7** — homepage images

## Validation

After all tasks:
- `npx tsc --noEmit` — must pass clean
- Visual check: `/contacts`, `/general-sponsors`, `/consulting`, homepage
- Visual check: `/admin/applications/[id]` — all fields in Russian, no raw enum values
- Grep: `SUPPORT_EMAIL` should NOT appear in any public-facing rendered text (keep in fallback disabled-form messages until replaced)
- Grep: `!important` should not appear in sponsorship card styles
- All CTA blocks should use consistent panel or zone treatment
- All textareas should auto-resize and have no drag handle
- Application delete works from detail page
- Messaging send/receive works in admin
