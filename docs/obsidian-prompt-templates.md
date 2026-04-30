# Obsidian Prompt Templates

These templates are meant to be copied into Obsidian notes and used as the first message for a new Codex batch.

Use them to reduce context drift, keep work scoped, and make validation explicit.

## 1. Resume By Plan: Delta Contract

Use when work should continue from an existing plan, phase, or checkpoint.

```text
Mode: IMPLEMENTATION
Artifact: implementation batch

Current phase:
Last completed checkpoint:

In scope now:
- 

Out of scope now:
- 

Done when:
- 

Validation:
- 
```

Example:

```text
Mode: IMPLEMENTATION
Artifact: implementation batch

Current phase: business account
Last completed checkpoint: business layout and requests page are in place

In scope now:
- add request creation form
- connect server action
- show success and error states

Out of scope now:
- admin changes
- global redesign
- SEO cleanup

Done when:
- a business request can be submitted from the page

Validation:
- npm run typecheck
- manual form submission check
```

## 2. Large Audit: Discovery First, Then Remediation Board

Use when a broad audit is needed. This template forces the result into actionable slices instead of a vague long report.

```text
Mode: REVIEW
Intent: discovery audit
Artifact: audit report + remediation board

Scope:
- in scope:
- out of scope:

Goal:
- find real risks, not cosmetic comments

Output format:
1. executive summary
2. prioritized findings
3. remediation board

Remediation board format:
- Finding:
- Risk:
- Owner slice:
- Files/surfaces:
- Fix batch:
- Control audit check:

Done when:
- the most important issues are prioritized
- each issue is converted into a bounded remediation slice
```

## 3. Commit Task: Checkpoint Only

Use when the goal is to checkpoint current work. Do not combine this with continued implementation.

```text
Mode: QA
Artifact: git checkpoint

Goal:
- review the current dirty tree
- classify related and unrelated changes
- create one scoped commit if safe

Do not do:
- continue feature work
- start a new refactor
- mix unrelated fixes into the checkpoint

Done when:
- commit scope is explicit
- checkpoint is created or blocker is stated

Output:
- what is included
- what is excluded
- current git status
```

## 4. UI Polish: Browser Comment Driven

Use when the issue is already visible in the browser and does not need a full redesign pass.

```text
Mode: IMPLEMENTATION
Artifact: UI polish patch

Observed issue:
Page URL:
Target element:
Expected correction:

Validation viewport:
- desktop:
- mobile:

Out of scope:
- unrelated redesign
- global restyling
- copy rewrite outside the affected surface
```

Example:

```text
Mode: IMPLEMENTATION
Artifact: UI polish patch

Observed issue: the card still shows technical helper text and feels overloaded
Page URL: http://localhost:3000/account
Target element: hero card at the top of the page
Expected correction: remove technical helper copy and return to user-facing content

Validation viewport:
- desktop: 1440
- mobile: 390

Out of scope:
- redesign of the whole account page
- header/footer changes
```

## 5. Redesign / Rebuild: Foundation -> One Screen -> Extension

Use when the request is large and visual. This prevents immediate uncontrolled expansion.

```text
Mode: IMPLEMENTATION
Artifact: staged redesign batch

Stage 1: foundation
- color direction
- typography
- spacing
- component rules
- motion rules

Stage 2: one screen
- implement one key screen only

Stage 3: extension
- continue to other screens only after approval

Current stage:

In scope now:
- 

Out of scope now:
- 

Done when:
- 

Validation:
- 
```

Example:

```text
Mode: IMPLEMENTATION
Artifact: staged redesign batch

Stage 1: foundation
- define colors, typography, spacing, buttons, cards, form inputs

Stage 2: one screen
- rebuild the homepage hero and first two sections

Stage 3: extension
- continue to inner pages after approval

Current stage: Stage 1 + Stage 2 for homepage only

In scope now:
- visual foundation
- homepage hero
- two sections below the fold

Out of scope now:
- auth pages
- admin pages
- business account pages

Done when:
- the foundation is visible in code
- the homepage first screen is coherent and reviewable

Validation:
- npm run typecheck
- browser check on desktop and mobile
```

## Quick Rule

If the first message does not define scope, out of scope, done when, and validation, the batch is probably too vague and should be rewritten before execution.
