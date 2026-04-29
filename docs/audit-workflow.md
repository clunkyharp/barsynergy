# Project Audit Workflow

This document defines how to run deep project audits and convert findings into working remediation documents.

Use it for:

- code review;
- UX/UI audit;
- security audit;
- memory and performance audit;
- remediation planning;
- documentation alignment.

The goal is to find real problems, prioritize them, and produce a concrete fix plan. Do not produce a long undifferentiated checklist.

## Operating Rule

Run audits as separate passes. Do not combine all audit types in one pass unless the project owner explicitly asks for a mixed audit.

Recommended order:

1. Project map and critical zones.
2. Code review.
3. Security audit.
4. Memory/performance audit.
5. UX/UI audit from screenshots or the live app.
6. Documentation/remediation formatter.

After any large code batch, broad remediation pass, or cross-module backend/auth/data-flow change, run at least the Code Review audit pass before calling the slice stable.

Each audit pass must use its own bounded subagent on `gpt-5.3-codex` when subagent execution is available. The central agent remains responsible for scope, verification, integration, final prioritization and closeout.

## Universal Audit Header

Add this block before any audit-specific prompt:

```text
Mode: REVIEW
Goal: find real project risks, not cosmetic comments.
Depth: high.
Result format: detailed audit report.

Scope:
- in scope: [insert]
- out of scope: [insert]

Done when:
- the 10-20 most important issues are found and prioritized;
- each issue has a concrete recommendation;
- there is a priority-based remediation plan.
```

## Subagent Contract

Each audit subagent task must include:

- audit type;
- mode;
- project context;
- in-scope files, modules, screens or documents;
- out-of-scope areas;
- expected output format;
- priority rules;
- validation expectations;
- instruction not to change files unless explicitly assigned;
- instruction not to revert unrelated changes.

The central agent must review subagent findings before accepting them. Potential findings without code, config, screenshot or runtime evidence must be marked as `Needs verification`, `Assumption` or `Potential risk`.

## Audit Passes

### 1. Project Map

Use first when the project is not already mapped.

Expected output:

- main layers;
- entry points;
- core modules;
- data flow;
- stateful or long-running areas;
- security-sensitive areas;
- UI-critical flows;
- build, deploy and environment surfaces;
- top 5-10 critical zones for later review.

### 2. Code Review

Reviewer role: senior software engineer and technical reviewer.

Check:

- folder and module structure;
- responsibility boundaries;
- coupling between modules;
- large components, services, stores or manager classes;
- duplication and unnecessary complexity;
- weak typing and unclear names;
- hidden side effects;
- state duplication and single-source-of-truth violations;
- async risks, missing retries, timeouts or cancellation;
- weak error handling and edge cases;
- build, test and development workflow friction.

Required report sections:

1. Executive summary.
2. Project map.
3. Top findings.
4. Architectural risks.
5. Refactoring plan.
6. Quick wins.
7. Final verdict.

For each finding include:

- title;
- severity: `critical`, `high`, `medium` or `low`;
- where;
- problem;
- why it matters;
- recommendation.

### 3. UX/UI Audit

Reviewer role: senior product designer and UX/UI auditor.

Use screenshots, rendered pages or the live app. Do not audit only from component names when visual output is required.

Check:

- clarity of product structure;
- primary user flows;
- navigation;
- action hierarchy;
- overloaded screens;
- loading, empty and error states;
- visual hierarchy;
- grid, spacing and typography;
- contrast and readability;
- consistency of components;
- forms, tables, modals, filters and cards;
- color as signal;
- microcopy and terminology;
- accessibility and click target size.

Required report sections:

1. Executive summary.
2. Core UX issues.
3. Core UI issues.
4. Screen-by-screen review.
5. Design system / consistency review.
6. Prioritized redesign plan.
7. Quick wins.
8. Final verdict.

Each issue must state what is wrong, why it matters, how it affects the user and exactly what to change.

### 4. Security Audit

Reviewer role: senior application security reviewer / security engineer.

Default constraint: code and configuration analysis only. Do not perform active pentest or destructive checks unless explicitly authorized.

Check:

- authentication and session handling;
- password, token and cookie safety;
- authorization, role checks and IDOR risks;
- server-side validation;
- injection risks;
- XSS, CSRF, SSRF, clickjacking and open redirect risks;
- secrets and env exposure;
- client bundle exposure;
- upload and storage safety;
- CORS and rate limiting;
- logs and personal data;
- dependency and supply-chain risks.

Required report sections:

1. Security summary.
2. Attack surface map.
3. Findings.
4. Configuration and secrets review.
5. Dependency risks.
6. Remediation plan.
7. Final verdict.

Each finding must include:

- title;
- severity;
- CWE/OWASP category when applicable;
- where;
- risk;
- exploitation scenario;
- recommendation.

### 5. Memory / Performance Audit

Reviewer role: senior performance engineer / memory diagnostics reviewer.

Separate confirmed leaks from high memory use, retention risks and general inefficiency.

Check:

- component and object lifecycle;
- subscriptions, listeners, observers and timers;
- sockets, streams, media and background jobs;
- cleanup on unmount/dispose/deinit/teardown;
- React `useEffect` cleanup and stale closures;
- global stores, refs, portals and modals;
- unbounded caches, maps, sets, logs and history buffers;
- large arrays, buffers and files;
- queue growth, pending promises, missing cancellation and missing backpressure;
- heavy lists without virtualization.

Required report sections:

1. Memory health summary.
2. High-risk areas.
3. Findings.
4. Lifecycle and cleanup review.
5. Cache/store/buffer review.
6. Profiling plan.
7. Remediation plan.
8. Final verdict.

Each finding must include:

- title;
- severity;
- type: `confirmed leak`, `probable leak`, `retention risk` or `inefficiency`;
- where;
- what is retained;
- why it may leak or grow;
- user-visible impact;
- recommendation.

### 6. Documentation / Remediation Formatter

Use after an audit pass. The formatter must not re-run the whole audit unless explicitly asked.

Goal:

- either update existing project documents;
- or create one clear remediation plan when no suitable document exists.

Document placement rules:

- do not create a new document if an existing one is the right place;
- do not spread the same topic across many files;
- preserve existing document style;
- mark uncertain findings as `Needs verification`, `Assumption` or `Potential risk`;
- order work from critical risks to lower-priority improvements.

Recommended priority groups:

- `P0` - critical blockers, security risks, data loss, crash risks.
- `P1` - architectural and systemic problems.
- `P2` - UX/UI and maintainability improvements.
- `P3` - optional polish.

Remediation document structure:

```text
# [Artifact title]

## Purpose
## Scope
## Out of scope
## Current state summary
## Key findings
For each finding:
- Problem
- Impact
- Recommendation
- Priority
- Dependencies
- Verification

## Remediation order
### Phase 1 - Critical fixes
### Phase 2 - Structural fixes
### Phase 3 - UX/UI / maintainability improvements
### Phase 4 - Optional polish

## Step-by-step implementation plan
For each step:
1. Goal
2. Changes
3. Files/modules likely affected
4. Risk
5. Verification
6. Done when

## Quick wins
## Risks and assumptions
## Final recommendation
```

## Documentation Alignment Audit

Use this pass when the goal is to make docs match the current project.

Check:

- existing documentation inventory;
- current code structure and entry points;
- package scripts and build commands;
- env/config instructions;
- test, build, deploy and run workflow;
- outdated paths or module names;
- conflicts between README and `docs/*`;
- duplicate information;
- missing onboarding or operational notes.

Required report sections:

1. Documentation status summary.
2. Documentation inventory.
3. Source-of-truth mapping.
4. Proposed update strategy.
5. File-by-file update plan.
6. Proposed content.
7. Final recommendation.

Priorities:

- `P0` - broken or dangerous instructions.
- `P1` - architecture or operational contradictions.
- `P2` - onboarding, setup or workflow gaps.
- `P3` - cleanup, simplification and deduplication.

## Master Prompt

Use this when the owner asks for a complete audit-to-plan pass:

```text
First run [audit type]: code review / UX/UI audit / security audit / memory audit.

After analysis, do not stop at findings.
Convert the results into one working artifact:
- either update existing project documents;
- or create one logical remediation plan.

Respect priorities and dependencies.
Avoid duplicated findings.
Make the result actionable for implementation.
Use a separate gpt-5.3-codex subagent for each audit task.
```

## Quality Rules

- Focus on real, important problems.
- Prioritize findings.
- Do not duplicate the same point in different words.
- Do not invent code or behavior that was not inspected.
- Mark uncertainty explicitly.
- Prefer concrete, low-risk recommendations.
- Do not recommend full rewrites unless that is the only realistic option.
- The result must be useful for actual project work and should not be a read-only report.
