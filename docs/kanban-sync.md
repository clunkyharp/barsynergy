# Obsidian Kanban Sync

## Purpose

The active development board lives in Obsidian:

`BARSYNERGY/Разработка BARSYNERGY Kanban.md`

Use it as the short active view of project work. Keep detailed plans, audits and technical decisions in the repository docs.

## Source Of Truth

- Product scope: `docs/project-plan.md`
- Phase order: `docs/phase-plan.md`
- Current project state: `PROJECT_STATUS.md`
- Remediation queue: `docs/remediation-plan.md`
- Agent workflow: `docs/agent-workflow.md`
- Active board: Obsidian Kanban file above

## Sync Rule

Update the Obsidian board when a batch changes any of these:

- current active phase or focus;
- task status: inbox, spec, ready, in progress, review, blocked, done;
- blocker or owner decision;
- validation result or verification gap;
- next recommended implementation batch.

Do not duplicate long notes into the board. Each card should stay short and point back to the repo document when details are needed.

## Closeout Checklist

Before closing a meaningful development, QA, docs or deployment batch:

- check `git status --short --branch`;
- update `PROJECT_STATUS.md` if the actual project state changed;
- update the Obsidian board if task status changed;
- state validation results and remaining blockers in the final response.

