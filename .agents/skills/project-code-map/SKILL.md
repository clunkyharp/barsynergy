---
name: project-code-map
description: Use when working in this repository and the task requires finding code owners, dependencies, route groups, validation paths, or the smallest safe set of files to inspect before implementation, QA, debugging, documentation, or handoff.
---

# Project Code Map

## Overview

Use this skill to avoid rereading the whole repository. It routes agents through the project map, then into the minimum task-specific code and docs.

## Required First Read

Read `docs/agent-project-map.md` before broad source exploration. Use it to identify:

- route group;
- domain owner module;
- component family;
- data-flow dependencies;
- likely tests and validation commands.

If the current client does not auto-load this skill in a new session, read this `SKILL.md` manually from `.agents/skills/project-code-map/SKILL.md`, then continue with `docs/agent-project-map.md`.

## Workflow

1. Read `AGENTS.md` for repository rules.
2. Read `docs/agent-project-map.md`.
3. Select the row in "Fast Task Lookup" that matches the task.
4. Open only the files listed for that task, plus any task-specific docs required by `AGENTS.md`.
5. Before editing, state the batch mode, scope, out of scope, done condition and validation path.
6. If the work changes route ownership, domain boundaries, schema ownership, validation commands or agent onboarding, update `docs/agent-project-map.md` in the same batch.
7. Close every implementation or skill/script update with a concrete file-by-file summary: what changed, which files changed, validation run or gap, intentionally untouched nearby files, and remaining risks.

## Stop Gates

Stop before implementation if:

- `docs/agent-project-map.md` does not cover the touched area;
- the task crosses auth, middleware, storage, database schema, production env or deployment without readiness fields;
- more than one route group or domain owner is affected and no mini-spec is frozen;
- the needed files already contain unrelated dirty work.
- this skill or `docs/agent-project-map.md` is missing or still ignored by git in a way that prevents reuse in new sessions.

Report the gap, then either update the map first or ask for a narrower batch.

## Closeout Requirement

Do not end with a vague summary. State the changed files and the role of each changed file so the next agent can resume from the summary before opening diffs.
