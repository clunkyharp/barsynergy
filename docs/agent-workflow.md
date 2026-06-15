# AI Agent Workflow

This document defines how AI agents must work on BARSYNERGY.

The main Codex agent is the orchestration and quality-control center. Subagents are execution or review helpers. The central agent owns final decisions, integration, verification and closeout.

## Central Agent Role

The central agent must:

- keep the project plan in `docs/project-plan.md` as the canonical source;
- keep the phase sequence in `docs/phase-plan.md` as the implementation roadmap;
- lock one mode before work: `DECISION`, `IMPLEMENTATION` or `QA`;
- define goal, scope, ownership, done criteria and validation before meaningful implementation;
- keep public and user-facing Russian copy simple, literal and natural instead of promo-style or machine-like phrasing;
- use the `humanizer-ru` cleanup principle by default when rewriting connected Russian user-facing prose, while leaving code, logs, commands, schemas and exact quotations untouched;
- decide whether subagents are needed;
- assign bounded tasks to subagents;
- review subagent output before accepting it;
- integrate changes only after local inspection;
- run verification;
- run a dedicated `QA` review pass after every large code batch or cross-module remediation before treating the result as stable;
- keep documentation and the Obsidian Kanban board synchronized with every meaningful project change;
- keep production-bound git work clean: `prod` is the VPS deploy branch, and local memory, QA/browser artifacts, scratch output, local access notes, real env files and secrets must not be merged into it;
- report risks and validation gaps clearly;
- prevent scope creep and repeated polishing.

The central agent does not blindly trust subagent output.

## Spec-Driven And Test-Driven Development

Default implementation workflow:

1. Freeze a small mini-spec before editing code.
2. Translate the expected behavior into the smallest useful test or verification check.
3. For testable behavior changes, write or update the smallest meaningful test and run it in the failing state before implementation.
4. Do not edit production code first unless the no-failing-test exception is explicit before editing.
5. Implement the minimum change that satisfies the spec and makes the test pass.
6. Refactor only after the targeted test is green.
7. Rerun targeted validation and broaden to lint, typecheck, browser QA or build only when the changed surface requires it.

The mini-spec must identify:

- goal;
- user-visible or system behavior;
- scope and out of scope;
- affected contracts, routes, modules or UI states;
- acceptance criteria;
- validation path.

Automated tests are expected for new features, bug fixes, refactors and behavior changes when the behavior is reasonably testable. If an automated failing test is not practical, the agent must say so before editing production code and name the substitute proof, such as a source-level assertion, type/lint check, browser smoke, visual QA, manual reproduction or explicit verification gap.

Documentation-only, configuration-only and owner-approved exploratory batches still need a short spec and validation decision, but they do not require a failing code test unless the change affects runtime behavior.

## Subagent Roles

Product Agent:

- scope;
- MVP boundaries;
- user stories;
- prioritization;
- monetization path;
- removal of unnecessary work.

UX/UI Agent:

- page structure;
- UI kit;
- responsive behavior;
- interface states;
- visual quality;
- feasibility of the design.

Database Agent:

- Prisma schema;
- relations;
- indexes;
- migrations;
- data integrity.

Backend Agent:

- Server Actions;
- API routes when needed;
- auth;
- validation;
- storage;
- email;
- Telegram admin notifications.

Frontend Agent:

- pages;
- components;
- forms;
- filters;
- responsive layout;
- loading/error/empty states.

QA Agent:

- test scenarios;
- bug detection;
- regressions;
- security checks;
- release readiness.

## When To Use Subagents

Use subagents when work can be split into independent, bounded tasks, for example:

- Product Agent drafts a mini-spec while Frontend Agent inspects component structure.
- Database Agent reviews a schema while Backend Agent plans server actions.
- QA Agent audits a completed implementation while the central agent fixes a separate issue.
- UX/UI Agent checks visual direction while Frontend Agent prepares page structure.

Do not use subagents for tiny edits where delegation adds overhead.

Do not assign the same file ownership to multiple agents at the same time.

For deep audits, use the dedicated workflow in `docs/audit-workflow.md`. Each audit type must be a separate bounded pass; use a dedicated subagent only when the current agent policy, tooling and owner request allow it.

## Subagent Task Contract

Every delegated task must include:

- mode;
- goal;
- scope;
- out of scope;
- files or module ownership;
- expected output;
- validation expectation;
- instruction not to revert unrelated changes.

For code-edit subtasks, the central agent must define a disjoint write set.

## Quality Gate

Before accepting subagent work, the central agent checks:

- alignment with `docs/project-plan.md`;
- phase boundaries;
- Russia/personal-data restrictions;
- security constraints;
- architecture consistency;
- visual system consistency;
- mobile behavior for public UI;
- migration safety for database changes;
- lint, typecheck and targeted test results when applicable;
- `npm run build` result before commit, or an explicit note that no commit is being made;
- remaining risks.

Subagent output is advisory until the central agent verifies it.

## Closeout Format

Every meaningful batch closes with:

- what was done;
- files changed;
- validation;
- git status;
- documentation sync result;
- Obsidian Kanban status update, or an explicit note that no board update was needed;
- risks;
- out of scope;
- stop polishing checkpoint;
- next step.

## Current Project Rule

Future development must start from:

1. `$project-code-map`, or `.agents/skills/project-code-map/SKILL.md` if the skill is not loaded;
2. `docs/agent-project-map.md`;
3. `docs/project-plan.md`;
4. `docs/agent-workflow.md`;
5. `docs/phase-plan.md`;
6. `PROJECT_STATUS.md`;
7. phase-specific docs or mini-specs;
8. `docs/kanban-sync.md`;
9. current git status.
